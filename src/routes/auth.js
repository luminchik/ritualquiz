/**
 * Маршруты аутентификации
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Маршрут для начала процесса аутентификации Discord
router.get('/discord', authController.authenticateDiscord);

// Маршрут обратного вызова Discord
router.get('/discord/callback', authController.discordCallback);

// Маршрут для выхода
router.get('/logout', authController.logout);

module.exports = router;
