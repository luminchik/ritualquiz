/**
 * Модуль для хранения сессий в SQLite
 */
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');

// Создание хранилища сессий на основе SQLite
module.exports = function createSessionStore() {
  return new SQLiteStore({
    // Путь к директории с базой данных
    dir: path.join(__dirname, '../../db'),
    // Имя файла базы данных для сессий
    db: 'sessions.db',
    // Таблица для хранения сессий
    table: 'sessions',
    // Интервал очистки истекших сессий (в миллисекундах)
    concurrentDB: true
  });
};
