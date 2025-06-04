class Quiz {
  constructor() {
    this.questions = [];
    this.currentQuestion = 0;
    this.score = 0;
  }
  
  async load() {
    try {
      // Используем API путь для загрузки вопросов
      const resp = await fetch("/api/questions");
      this.questions = await resp.json();
      console.log(`Загружено ${this.questions.length} вопросов`);
    } catch (error) {
      console.error("Ошибка при загрузке вопросов:", error);
    }
  }

  getCurrentQuestion() {
    return this.questions[this.currentQuestion];
  }

  checkAnswer(answerIndex) {
    const correct =
      this.questions[this.currentQuestion].correct === answerIndex;
    this.score += correct ? 10 : -5;
    this.currentQuestion++;
    return correct;
  }

  isGameOver() {
    return this.currentQuestion >= this.questions.length;
  }
}

class Trail {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.width = 12;
    this.height = 10;
    this.moveSpeed = getRandom(5, 10);
    this.shrinkSpeed = getRandom(0.1, 0.2);
    this.fadeSpeed = 0.05;
    this.opacity = 1;
    this.el = this.createElement(options.parentContainer);
  }

  createElement(parentContainer) {
    const el = $("<div class='trail-point'></div>");
    parentContainer.append(el);
    return el;
  }

  update() {
    this.el.css({
      left: this.x,
      top: this.y,
      opacity: this.opacity,
      width: this.width,
      height: this.height
    });
    this.x -= this.moveSpeed;
    this.opacity -= this.fadeSpeed;
    this.width -= this.shrinkSpeed;
    this.height -= this.shrinkSpeed;

    if (this.width <= 0 || this.opacity <= 0) {
      this.el.remove();
      this.delete = true;
    }
  }
}

class Bullet {
  constructor(options) {
    this.x = options.x;
    this.y = options.y;
    this.speed = 13;
    this.width = 25;
    this.height = 15;
    this.dir = options.dir;
    this.game = options.game;
    this.el = this.createElement(options.parentContainer);
    options.startUpdating(this); // передаем объект для обновления
    this.isDead = false;
  }

  createElement(parentContainer) {
    const el = $("<div class='bullet'></div>");
    parentContainer.append(el);
    el.css({
      left: this.x,
      top: this.y,
      width: this.width,
      height: this.height,
      transform: `translate(-50%, -50%) rotate(${this.dir}rad)`
    });
    this.createFlash(parentContainer);
    return el;
  }

  createFlash(parentContainer) {
    const el = $("<div class='flash'></div>");
    el.css({
      top: this.y,
      left: this.x
    });
    parentContainer.append(el);
    el.on("animationend", () => el.remove());
  }

  update() {
    this.x += Math.cos(this.dir) * this.speed;
    this.y += Math.sin(this.dir) * this.speed;
    
    // Удалить пулю, если она выходит за пределы экрана
    if (
      this.x < 0 || this.x > window.innerWidth ||
      this.y < 0 || this.y > window.innerHeight
    ) {
      this.el.remove();
      this.isDead = true;        // помечаем как «удалён»
      return;
    }

    this.el.css({
      left: this.x,
      top: this.y,
      transform: `translate(-50%, -50%) rotate(${this.dir}rad)`
    });
    this.checkCollision();
  }

  checkCollision() {
    $(".answer").each((index, answer) => {
      const rect = answer.getBoundingClientRect();
      if (
        this.x >= rect.left &&
        this.x <= rect.right &&
        this.y >= rect.top &&
        this.y <= rect.bottom
      ) {
        this.game.checkAnswer(index, { x: this.x, y: this.y });
        this.el.remove();
        this.isDead = true; // помечаем пулю как удаленную
        return false;
      }
    });
  }
}

class Player {
  constructor(options) {
    this.controls = options.controls;
    this.startUpdating = options.startUpdating;
    this.parentContainer = options.parentContainer;
    this.game = options.game;
    this.x = 150;
    this.y = window.innerHeight / 2;
    this.width = 150;
    this.height = 150;
    this.mouthHeight = 2;
    this.mouthShrinkSpeed = 1;
    this.xvel = 0;
    this.yvel = 0;
    this.friction = 0.9;
    this.speed = 1.5;
    this.rotation = 0;
    this.trail = [];
    this.trailTimer = 0;
    this.trailSpawnRate = 1;
    this.shootDown = false;
    this.el = this.createElement(options.parentContainer);
    this.startUpdating(this); // передаем сам объект для обновления
  }

  createElement(parentContainer) {
    const el = $(`
            <div class='player'>
                <img src="../images/vgolem.png" alt="Rock Golem">
            </div>
        `);
    parentContainer.append(el);
    
    // Устанавливаем размеры и позицию
    el.css({
      left: this.x,
      top: this.y,
      width: '250px',
      height: '250px'
    });
    
    return el;
  }

  update() {
    this.y += this.yvel;
    this.x += this.xvel;
    this.xvel *= this.friction;
    this.yvel *= this.friction;
    this.rotation = this.yvel / 50;

    if (this.controls["up"].isDown) this.yvel -= this.speed;
    if (this.controls["down"].isDown) this.yvel += this.speed;
    if (this.controls["right"].isDown) this.xvel += this.speed;
    if (this.controls["left"].isDown) this.xvel -= this.speed;

    if (this.y < 0) this.y = 0;
    else if (this.y > window.innerHeight) this.y = window.innerHeight;
    if (this.x < 0) this.x = 0;
    else if (this.x > window.innerWidth) this.x = window.innerWidth;

    if (this.mouthHeight > 2) this.mouthHeight -= this.mouthShrinkSpeed;
    else this.mouthHeight = 2;

    if (this.controls["space"].isDown && !this.shootDown) {
      this.shoot();
      this.shootDown = true;
    }
    if (!this.controls["space"].isDown) this.shootDown = false;

    this.handleTrail();
    this.setValues();
  }

  handleTrail() {
    // Trail effect removed - no more fire trail points
    // Rock golem doesn't need a rocket fire trail
  }

  shoot() {
    const position = {
      x: this.x + Math.cos(this.rotation) * (this.width / 2),
      y: this.y + Math.sin(this.rotation) * (this.height / 2)
    };
    new Bullet({
      parentContainer: this.parentContainer,
      dir: this.rotation,
      x: position.x,
      y: position.y,
      startUpdating: this.startUpdating,
      game: this.game
    });
    this.xvel -= Math.cos(this.rotation) * 3;
    this.yvel -= Math.sin(this.rotation) * 3;
    this.mouthHeight = 12;
  }

  setValues() {
    this.el.css({
      left: this.x,
      top: this.y,
      transform: `translateX(-50%) translateY(-50%) rotate(${this.rotation}rad)`
    });
  }
}

class Controls {
  constructor() {
    this.right = { isDown: false, keyCode: 39 };
    this.down = { isDown: false, keyCode: 40 };
    this.left = { isDown: false, keyCode: 37 };
    this.up = { isDown: false, keyCode: 38 };
    this.space = { isDown: false, keyCode: 32 };

    $(window).on("keydown", (e) => this.toggle(e.which, true));
    $(window).on("keyup", (e) => this.toggle(e.which, false));
  }

  toggle(keyCode, isDown) {
    const keys = ["left", "down", "right", "up", "space"];
    const key = keys.find((k) => this[k].keyCode === keyCode);
    if (key) this[key].isDown = isDown;
  }
}

class Game {
  constructor(quiz) {
    this.updateFuncs = [];
    this.container = $("#game-container");
    this.controls = new Controls();
    this.quiz = quiz;
    this.timeLeft = 20;
    this.canAnswer = true;

    // Load background and planets during intro screen
    this.createSpaceBackground();

    // Show intro screen with click-to-start
    this.showIntroScreen();
  }

  showIntroScreen() {
    // Метод пустой, так как инициализация происходит через кнопку #start-game
    // в основном коде $(document).ready
  }

  startGame() {
    // Initialize player and start displaying elements after intro
    this.player = new Player({
      controls: this.controls,
      parentContainer: this.container,
      startUpdating: this.startUpdating.bind(this),
      game: this
    });

    // Show the game interface after the intro
    this.displayScore();
    this.displayQuestionCount();
    this.displayQuestion();
    this.update();
  }
  createSpaceBackground() {
    this.spaceBackground = $("#space-background");
    if (this.spaceBackground.length === 0) {
      this.spaceBackground = $("<div id='space-background'></div>");
      $("body").prepend(this.spaceBackground);
    }
    
    // No stars will be created, but the background image is still preserved
    // in CSS via the #space-background selector with background-image: url('vulkan.png')
  }

  update() {
    this.updateFuncs.forEach((obj) => obj.update());
    // Удаляем "мертвые" объекты
    this.updateFuncs = this.updateFuncs.filter(obj => !obj.isDead);
    window.requestAnimationFrame(this.update.bind(this));
  }

  startUpdating(obj) {
    this.updateFuncs.push(obj);
  }

  displayQuestion() {
    if (this.quiz.isGameOver()) {
      this.endGame();
      return;
    }

    const question = this.quiz.getCurrentQuestion();
    const questionEl = $(
      "<div class='question'>" + question.question + "</div>"
    );
    this.container.append(questionEl);

    const answerImages = [
      "../images/lava.png",
      "../images/lava.png",
      "../images/lava.png",
      "../images/lava.png"
    ];

    question.answers.forEach((answer, index) => {
      const answerEl = $(`
                <div class='answer answer-${index}' data-index='${index}'>
                    <span class="answer-title">${answer}</span>
                </div>
            `);
      answerEl.css({
        left: Math.random() * (window.innerWidth - 150) + 75,
        top: Math.random() * (window.innerHeight - 150) + 75,
        backgroundImage: `url(${answerImages[index]})`,
        backgroundSize: "cover",
        width: "100px",
        height: "100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "#ffffff",
        fontWeight: "bold",
        borderRadius: "10px"
      });
      this.container.append(answerEl);
      this.floatAnswer(answerEl);
    });

    this.resetTimer();
    this.displayQuestionCount();
    this.canAnswer = true;
  }

  floatAnswer(answerEl) {
    const floatAnimation = () => {
      const newX = Math.random() * (window.innerWidth - 150) + 75;
      const newY = Math.random() * (window.innerHeight - 150) + 75;
      answerEl.animate(
        { left: newX, top: newY },
        5000,
        "linear",
        floatAnimation
      );
    };
    floatAnimation();
  }

  checkAnswer(answerIndex, bulletPosition) {
    if (!this.canAnswer) return;
    this.canAnswer = false;
    const correctAnswerIndex = this.quiz.getCurrentQuestion().correct;
    
    // Удаление консоль лога для повышения производительности
    // console.log("Selected:", answerIndex, "Correct:", correctAnswerIndex);
    
    const correct = this.quiz.checkAnswer(answerIndex);
    this.displayScore();      // <-- добавили обновление счета
    this.displayFeedback(
      correct ? "CORRECT!" : "INCORRECT!",
      correct,
      bulletPosition
    );
    setTimeout(() => {
      this.clearQuestion();
      this.resetTimer();
      if (this.quiz.isGameOver()) {
        this.endGame();
      } else {
        this.displayQuestion();
      }
    }, 2000);
  }

  displayFeedback(text, correct, position) {
    const feedbackEl = $("<div class='feedback'>" + text + "</div>");
    feedbackEl.css({
      left: position.x,
      top: position.y,
      color: correct ? "#00ff00" : "#ff0000"
    });
    this.container.append(feedbackEl);
    setTimeout(() => feedbackEl.remove(), 1000);
  }

  clearQuestion() {
    $(".question, .answer").remove(); // Clear out both the question and answers
  }

  startTimer() {
    // Очищаем предыдущий интервал, если он существует
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timeLeft = 20;
    this.displayTimer();                 // сразу показать 20
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.displayTimer();               // обновлять каждую секунду
      if (this.timeLeft <= 0) {
        this.handleTimeUp();
      }
    }, 1000);
  }

  displayTimer() {
    // если элемента ещё нет – создаём
    let timerEl = $(".timer");
    if (timerEl.length === 0) {
      timerEl = $("<div class='timer'></div>");
      this.container.append(timerEl);
    }
    timerEl.text(`⏳ ${this.timeLeft}s`);
  }

  handleTimeUp() {
    clearInterval(this.timerInterval);
    this.displayFeedback("Time's up!", false, {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });
    setTimeout(() => {
      this.clearQuestion();
      this.quiz.currentQuestion++;
      this.displayScore();      // <-- добавили обновление счета
      if (!this.quiz.isGameOver()) {
        this.displayQuestion();
        this.startTimer();
      } else {
        this.endGame();
      }
    }, 1000);
  }

  resetTimer() {
    clearInterval(this.timerInterval);
    this.startTimer();
  }

  displayScore() {
    $(".score").remove();
    const scoreEl = $(
      "<div class='score'>Score: " + this.quiz.score + "</div>"
    );
    this.container.append(scoreEl);
  }

  displayQuestionCount() {
    $(".question-count").remove();
    const total = this.quiz.questions.length;
    const countEl = $(
      `<div class='question-count'>Question: ${this.quiz.currentQuestion + 1}/${total}</div>`
    );
    this.container.append(countEl);
  }

  endGame() {
    // Получаем информацию пользователя (если он авторизован)
    let userInfo = "";
    const usernameElement = $("#username");
    
    if (usernameElement.length > 0 && usernameElement.text()) {
      // Пользователь авторизован, добавляем информацию о нем
      userInfo = `<p class="user-result">Player: ${usernameElement.text()}</p>`;
    }
    
    const gameOverEl = $(
      `<div class='game-over'>
         ${userInfo}
         <p>Final Score: ${this.quiz.score}</p>
       </div>`
    );
    
    this.container.append(gameOverEl);
    
    // Сохраняем счет если пользователь авторизован
    saveScore(this.quiz.score);
  }
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}


// Функция для сохранения счета пользователя
async function saveScore(score) {
  try {
    const response = await fetch('/api/save-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ score })
    });
    const data = await response.json();
    console.log('Счет сохранен:', data);
  } catch (error) {
    console.error('Ошибка при сохранении счета:', error);
  }
}


$(async function () {
  // Инициализация авторизации
  setupAuthButtons();
  await checkAuthStatus();
  
  // Создаем фон
  createSpaceBackground("images/backgroundseismic.png");
  
  // Обработчик для кнопки запуска игры (изображение)
  $("#intro-image").on("click", async function() {
    console.log("Нажатие на кнопку запуска игры");
    
    // Скрываем интро контейнер
    $("#intro-container").hide();
    
    // Очищаем контейнер игры перед началом
    $("#game-container").empty();
    
    // Инициализация и запуск игры
    try {
      const quiz = new Quiz();
      await quiz.load();  // Ждём загрузку вопросов из JSON
      const game = new Game(quiz);  // Создаем игру
      
      // Запускаем игру
      game.startGame();
      console.log("Игра запущена!");
    } catch (error) {
      console.error("Ошибка при запуске игры:", error);
    }
  });
});