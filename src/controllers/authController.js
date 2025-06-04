/**
 * Контроллер аутентификации
 */
const passport = require('passport');

/**
 * Аутентификация через Discord
 * @param {object} req - HTTP запрос
 * @param {object} res - HTTP ответ
 */
exports.authenticateDiscord = passport.authenticate('discord');

/**
 * Callback для Discord OAuth
 * @param {object} req - HTTP запрос
 * @param {object} res - HTTP ответ
 * @param {function} next - Следующий middleware
 */
exports.discordCallback = (req, res, next) => {
  passport.authenticate('discord', { 
    failureRedirect: '/?error=auth-failed' 
  })(req, res, () => {
    // Успешная аутентификация
    res.redirect('/?loggedIn=true');
  });
};

/**
 * Выход из системы
 * @param {object} req - HTTP запрос
 * @param {object} res - HTTP ответ
 * @param {function} next - Следующий middleware
 */
exports.logout = (req, res, next) => {
  req.logout(function(err) {
    if (err) { 
      console.error('Ошибка при выходе:', err);
      return next(err); 
    }
    res.redirect('/');
  });
};

/**
 * Проверка статуса аутентификации
 * @param {object} req - HTTP запрос
 * @param {object} res - HTTP ответ
 */
exports.getAuthStatus = (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        avatar: req.user.avatar
      }
    });
  }
  
  return res.json({ authenticated: false });
};
