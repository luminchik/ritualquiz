/**
 * Модуль для работы с базой данных
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Создаем директорию для базы данных, если ее нет
const dbDir = path.join(__dirname, '..', '..', 'db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

// Путь к файлу базы данных
const dbPath = path.join(dbDir, 'game.db');

// Подключение к базе данных
const db = new sqlite3.Database(dbPath);

/**
 * Инициализация базы данных
 */
function initDatabase() {
    db.serialize(() => {
        // Создаем таблицу для хранения результатов
        db.run(`
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT NOT NULL,
                username TEXT NOT NULL,
                score INTEGER NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Проверим, есть ли уже записи в таблице
        db.get('SELECT COUNT(*) as count FROM scores', (err, row) => {
            if (err) {
                console.error('Ошибка при проверке количества записей:', err);
                return;
            }

            // Если записей нет, добавляем тестовые данные
            if (row.count === 0) {
                insertTestData();
            }
        });

        console.log('База данных инициализирована');
    });
}

/**
 * Функция для вставки тестовых данных
 */
function insertTestData() {
    console.log('Добавляем тестовые данные в лидерборд...');
    
    const testData = [
        { userId: '12345', username: 'lumin.eth', score: 70 }
    ];
    
    const stmt = db.prepare(`
        INSERT INTO scores (userId, username, score)
        VALUES (?, ?, ?)
    `);
    
    testData.forEach(data => {
        stmt.run(data.userId, data.username, data.score, (err) => {
            if (err) {
                console.error('Ошибка при добавлении тестовых данных:', err);
            }
        });
    });
    
    stmt.finalize();
}

/**
 * Функция для получения списка лучших результатов
 * @param {number} limit - максимальное количество результатов
 * @returns {Promise<Array>} - промис с массивом результатов
 */
function getLeaderboard(limit = 10) {
    return new Promise((resolve, reject) => {
        db.all(`
            WITH MaxScores AS (
                SELECT username, MAX(score) as maxScore
                FROM scores
                GROUP BY username
            )
            SELECT s.username, s.score, s.timestamp
            FROM scores s
            JOIN MaxScores m ON s.username = m.username AND s.score = m.maxScore
            ORDER BY s.score DESC
            LIMIT ?
        `, [limit], (err, rows) => {
            if (err) {
                console.error('Ошибка при получении лидерборда:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Функция для сохранения результата
 * @param {string} userId - ID пользователя
 * @param {string} username - имя пользователя
 * @param {number} score - счет
 * @returns {Promise<number>} - промис с ID новой записи
 */
function saveScore(userId, username, score) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO scores (userId, username, score) VALUES (?, ?, ?)`,
            [userId, username, score],
            function (err) {
                if (err) {
                    console.error('Ошибка при сохранении счета:', err);
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
    });
}

// Экспортируем функции
module.exports = {
    db,
    initDatabase,
    getLeaderboard,
    saveScore
};
