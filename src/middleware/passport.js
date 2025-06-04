/**
 * Конфигурация Passport.js для аутентификации
 */
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

// Настройки для стратегии Discord
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:3000/auth/discord/callback';

// Конфигурация Passport
module.exports = function() {
  // Настройка стратегии Discord
  passport.use(new DiscordStrategy({
    clientID: DISCORD_CLIENT_ID,
    clientSecret: DISCORD_CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    scope: ['identify']
  }, (accessToken, refreshToken, profile, done) => {
    // Передаем данные пользователя в Passport
    process.nextTick(() => {
      return done(null, profile);
    });
  }));

  // Сериализация пользователя
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // Десериализация пользователя
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};
