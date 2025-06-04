/**
 * Главный файл сервера
 */
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

// Загрузка env-переменных
dotenv.config();

// Импортируем модули
const db = require('./src/models/db');
const apiRoutes = require('./src/routes/api');
const authRoutes = require('./src/routes/auth');
const createSessionStore = require('./src/middleware/session-store');

// Настройки сервера
const PORT = process.env.PORT || 3000;
// Session secret is loaded once with a fallback for local development
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-key';

// Создаем приложение Express
const app = express();

// Настраиваем CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Настройка middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(session({
  store: createSessionStore(),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней в миллисекундах
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Настройка Passport
app.use(passport.initialize());
app.use(passport.session());

// Инициализация Passport
require('./src/middleware/passport')();

// Инициализация базы данных
db.initDatabase();

// Настройка маршрутов
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);

// Маршрут главной страницы
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Маршрут страницы лидерборда
app.get('/leaderboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'leaderboard.html'));
});

// Маршрут для /game - страница игры
app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'game.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`Откройте http://localhost:${PORT} в браузере`);
});
