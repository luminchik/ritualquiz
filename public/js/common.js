// Общие функции авторизации и интерфейса

async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth-status');
    const data = await response.json();

    if (data.authenticated) {
      $('#not-logged').hide();
      $('#logged-in').show();
      $('#username').text(data.user.username);

      if (data.user.avatar) {
        const avatarUrl = `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`;
        $('#user-avatar').attr('src', avatarUrl);
      } else {
        $('#user-avatar').attr('src', 'https://cdn.discordapp.com/embed/avatars/0.png');
      }

      return true;
    } else {
      $('#not-logged').show();
      $('#logged-in').hide();
      return false;
    }
  } catch (error) {
    console.error('Ошибка при проверке статуса авторизации:', error);
    return false;
  }
}

function setupAuthButtons() {
  $('#discord-login').on('click', function() {
    window.location.href = '/auth/discord';
  });

  $('#logout').on('click', function() {
    window.location.href = '/auth/logout';
  });

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('loggedIn') === 'true') {
    checkAuthStatus();
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

function createSpaceBackground(imagePath) {
  const spaceBackground = $('#space-background');
  if (spaceBackground.length === 0) {
    $('<div id="space-background"></div>').prependTo('body');
  }
  $('#space-background').css({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    'z-index': -1,
    overflow: 'hidden',
    'background-image': `url("${imagePath}")`,
    'background-size': '100% 100%',
    'background-position': 'center'
  });
}
