/**
 * Контроллер игровых данных
 */
const db = require('../models/db');
const path = require('path');
const fs = require('fs');

/**
 * Получение списка вопросов
 * @param {object} req - HTTP запрос
 * @param {object} res - HTTP ответ
 */
exports.getQuestions = (req, res) => {
  const questionsPath = path.join(__dirname, '..', '..', 'questions.json');
  
  fs.readFile(questionsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Ошибка при чтении файла вопросов:', err);
      return res.status(500).json({ error: 'Error reading questions' });
    }
    
    try {
      const questions = JSON.parse(data);
      res.json(questions);
    } catch (err) {
      console.error('Ошибка при парсинге JSON файла вопросов:', err);
      res.status(500).json({ error: 'Error parsing questions' });
    }
  });
};

/**
 * Проверка ответа на вопрос
 * @param {object} req - HTTP запрос
 * @param {object} res - HTTP ответ
 */
exports.checkAnswer = (req, res) => {
  const { questionId, answer } = req.body;
  
  if (!questionId || answer === undefined) {
    return res.status(400).json({ error: 'Question ID and answer are required' });
  }
  
  const questionsPath = path.join(__dirname, '..', '..', 'questions.json');
  
  fs.readFile(questionsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Ошибка при чтении файла вопросов:', err);
      return res.status(500).json({ error: 'Error reading questions' });
    }
    
    try {
      const questions = JSON.parse(data);
      const question = questions.find(q => q.id === questionId);
      
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      const isCorrect = question.correct === answer;
      
      res.json({
        correct: isCorrect,
        correctAnswer: question.correct
      });
    } catch (err) {
      console.error('Ошибка при парсинге JSON файла вопросов:', err);
      res.status(500).json({ error: 'Error parsing questions' });
    }
  });
};

/**
 * Сохранение счета
 * @param {object} req - HTTP запрос
 * @param {object} res - HTTP ответ
 */
exports.saveScore = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'You must be logged in to save scores' });
  }
  
  const { score, duration } = req.body;
  const userId = req.user.id;
  const username = req.user.username;

  // Сохраняем счет в базе данных
  db.saveScore(userId, username, score, duration)
    .then(id => res.json({ success: true, id }))
    .catch(err => {
      console.error('Ошибка сохранения счета:', err);
      res.status(500).json({ error: 'Error saving score' });
    });
};
