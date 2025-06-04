/**
 * API маршруты
 */
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authController = require('../controllers/authController');

// Маршруты для игровых данных
router.get('/questions', gameController.getQuestions);
router.post('/check-answer', express.json(), gameController.checkAnswer);
router.post('/save-score', express.json(), gameController.saveScore);

// Маршруты для аутентификации
router.get('/auth-status', authController.getAuthStatus);

// Маршрут для получения лидерборда
router.get('/leaderboard', (req, res) => {
  const db = require('../models/db');
  
  console.log('Запрос на получение лидерборда');
  
  db.getLeaderboard()
    .then(leaderboard => {
      console.log('Получены данные лидерборда:', leaderboard);
      res.json(leaderboard);
    })
    .catch(err => {
      console.error('Ошибка при получении лидерборда:', err);
      res.status(500).json({ error: 'Error retrieving leaderboard' });
    });
});

module.exports = router;
