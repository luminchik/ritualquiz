// components/MemeMaker.jsx
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

/* ---------- 1. Данные шаблонов и стикеров ---------- */
const CUSTOM_TEMPLATES = [
  {
    id: 'local-1',
    url: '/Meme/1.png',
    name: 'Template from Dabs (@dabsdabs)',
    width: 1032,
    height: 1032,
    isLandscape: false,
  },
  // …добавьте остальные
];

const STICKERS = {
  iconsassets: [
    '/Sticker/iconsassets/1.png',
    '/Sticker/iconsassets/2.png',
    // …
  ],
  Emojisfromdiscordfficial: [
    '/Sticker/Emojisfromdiscordfficial/1.png',
    // …
  ],
  BubbleChat: ['/Sticker/BubbleChat/1.png', '/Sticker/BubbleChat/2.png'],
  PakKetum: ['/Sticker/PakKetum/1.png', '/Sticker/PakKetum/2.png'],
};

/* ---------- 2. Палитра проекта ---------- */
const COLORS = {
  primary: '#FE11C5',
  secondary: '#781961',
  accent: '#90DCFF',
  highlight: '#F9E766',
  darkBg: '#0f0f1a',
  lightBg: '#1a1a2e',
};

/* ---------- 3. Вспомогательные функции ---------- */
const hexToRgb = (hex) => {
  const [, r, g, b] = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex) || [];
  return `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}`;
};

const getCanvasSize = (w, h, container, isMobile) => {
  const maxSide = Math.min(container, isMobile ? container - 40 : 800);
  const ratio = w / h;
  return ratio > 1
    ? { width: maxSide, height: maxSide / ratio }
    : { width: maxSide * ratio, height: maxSide };
};

/* ---------- 4. Главный компонент ---------- */
export default function MemeMaker() {
  /* UI‑состояния */
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [text, setText] = useState('');
  const [fontFamily, setFontFamily] = useState('Impact');
  const [fontSize, setFontSize] = useState(40);
  const [fontColor, setFontColor] = useState('#ffffff');
  const [fabricReady, setFabricReady] = useState(false);
  const [canvasDim, setCanvasDim] = useState({ width: 500, height: 500 });
  const [mobile, setMobile] = useState(false);

  /* refs */
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const fabricCanvas = useRef(null);

  /* ---------- 4.1 — загрузка Fabric.js ---------- */
  useEffect(() => {
    if (window.fabric) {
      setFabricReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js';
    script.onload = () => setFabricReady(true);
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  /* ---------- 4.2 — адаптация под мобилку ---------- */
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ---------- 4.3 — выбор шаблона ---------- */
  useEffect(() => {
    if (!fabricReady || !activeTemplate || !wrapperRef.current) return;

    // очищаем старый canvas
    if (fabricCanvas.current) fabricCanvas.current.dispose();

    const { width, height } = getCanvasSize(
      activeTemplate.width,
      activeTemplate.height,
      wrapperRef.current.clientWidth,
      mobile
    );
    setCanvasDim({ width, height });

    // создаём новый canvas
    const canvas = new window.fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: COLORS.darkBg,
      preserveObjectStacking: true,
    });
    fabricCanvas.current = canvas;

    // фон‑изображение
    window.fabric.Image.fromURL(
      activeTemplate.url,
      (img) => {
        const scale = Math.min(width / img.width, height / img.height);
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: (width - img.width * scale) / 2,
          top: (height - img.height * scale) / 2,
          selectable: false,
        });
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      },
      { crossOrigin: 'Anonymous' }
    );
  }, [fabricReady, activeTemplate, mobile]);

  /* ---------- 5. Хелпер для скачивания ---------- */
  const downloadPNG = () => {
    if (!fabricCanvas.current || !activeTemplate) return;
    const dataURL = fabricCanvas.current.toDataURL({ format: 'png' });
    const link = document.createElement('a');
    link.download = `meme-${activeTemplate.name}.png`;
    link.href = dataURL;
    link.click();
  };

  /* ---------- 6. JSX ---------- */
  return (
    <>
      <Head>
        <title>Sucanted Meme Maker</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
      </Head>

      <div className="min-h-screen" style={{ background: COLORS.darkBg }}>
        {/* ---------------- Шапка ---------------- */}
        <div
          className="text-center mb-8 p-6 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
            border: `1px solid ${COLORS.primary}`,
            boxShadow: `0 4px 20px rgba(${hexToRgb(COLORS.primary)},0.3)`,
          }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Sucanted Meme Maker <i className="fas fa-laugh-squint ml-2" />
          </h1>
          <p className="text-white/80 text-sm md:text-base">
            Create, customize, and share your memes with ease
          </p>
        </div>

        {/* ---------------- Выбранный шаблон и редактор ---------------- */}
        {activeTemplate && fabricReady ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Канвас */}
            <div className="w-full lg:w-2/3" ref={wrapperRef}>
              <div
                className="p-4 rounded-xl flex justify-center"
                style={{
                  background: COLORS.lightBg,
                  border: `1px solid ${COLORS.primary}30`,
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={canvasDim.width}
                  height={canvasDim.height}
                  className="border shadow-lg max-w-full"
                  style={{
                    borderColor: COLORS.primary,
                    width: canvasDim.width,
                    height: canvasDim.height,
                  }}
                />
              </div>
            </div>

            {/* Панель инструментов */}
            <div className="w-full lg:w-1/3">
              <div
                className="p-4 rounded-xl space-y-4"
                style={{
                  background: COLORS.lightBg,
                  border: `1px solid ${COLORS.primary}30`,
                }}
              >
                {/* Текст */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold" style={{ color: COLORS.accent }}>
                    Text editor
                  </h3>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter your meme text…"
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                    style={{
                      background: `${COLORS.primary}10`,
                      borderColor: `${COLORS.primary}50`,
                    }}
                  />
                  <div className="flex gap-2">
                    {/* Цвет */}
                    <input
                      type="color"
                      value={fontColor}
                      onChange={(e) => setFontColor(e.target.value)}
                      className="w-10 h-10 border rounded-lg cursor-pointer"
                    />
                    {/* Шрифт */}
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                      style={{
                        background: `${COLORS.primary}10`,
                        borderColor: `${COLORS.primary}50`,
                      }}
                    >
                      {['Impact', 'Arial', 'Comic Sans MS', 'Times New Roman'].map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                    {/* Размер */}
                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(+e.target.value)}
                      min={10}
                      max={100}
                      className="w-20 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
                      style={{
                        background: `${COLORS.primary}10`,
                        borderColor: `${COLORS.primary}50`,
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!text.trim() || !fabricCanvas.current) return;
                      const canvas = fabricCanvas.current;
                      const textbox = new window.fabric.Text(text, {
                        left: canvas.width / 2,
                        top: canvas.height / 2,
                        originX: 'center',
                        originY: 'center',
                        fontFamily,
                        fontSize,
                        fill: fontColor,
                        stroke: '#000',
                        strokeWidth: 1,
                        selectable: true,
                      });
                      canvas.add(textbox).setActiveObject(textbox).renderAll();
                      setText('');
                    }}
                    className="w-full px-4 py-2 rounded-lg text-white"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                    }}
                  >
                    <i className="fas fa-plus mr-2" />
                    Add text
                  </button>
                </div>

                {/* Стикеры */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold" style={{ color: COLORS.accent }}>
                    Stickers
                  </h3>
                  <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 rounded-lg"
                       style={{ background: `${COLORS.primary}10` }}>
                    {Object.values(STICKERS).flat().map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="sticker"
                        className="cursor-pointer w-full object-contain rounded hover:scale-110 transition-transform"
                        onClick={() =>
                          window.fabric.Image.fromURL(
                            src,
                            (img) => {
                              const scale = 0.2 * canvasDim.width / img.width;
                              img.set({
                                scaleX: scale,
                                scaleY: scale,
                                left: canvasDim.width / 2,
                                top: canvasDim.height / 2,
                                originX: 'center',
                                originY: 'center',
                              });
                              fabricCanvas.current.add(img).setActiveObject(img).renderAll();
                            },
                            { crossOrigin: 'anonymous' },
                          )
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Кнопки */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={downloadPNG}
                    className="flex-1 px-4 py-2 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.highlight} 0%, #FF9A00 100%)`,
                      color: '#000',
                    }}
                  >
                    <i className="fas fa-download mr-2" />
                    Download
                  </button>
                  <button
                    onClick={() => setActiveTemplate(null)}
                    className="flex-1 px-4 py-2 rounded-lg text-white"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.secondary} 0%, #4A00E0 100%)`,
                    }}
                  >
                    <i className="fas fa-arrow-left mr-2" />
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ---------------- Список шаблонов ---------------- */
          <div className="container mx-auto px-4 py-8">
            <p className="text-gray-300 mb-4 text-center">
              Choose a template or upload your own image
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {CUSTOM_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setActiveTemplate(tpl)}
                  className="cursor-pointer group"
                >
                  <div
                    className="relative overflow-hidden rounded-lg aspect-square border"
                    style={{
                      background: COLORS.lightBg,
                      borderColor: `${COLORS.primary}30`,
                    }}
                  >
                    <img
                      src={tpl.url}
                      alt={tpl.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-white text-xs truncate">{tpl.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
