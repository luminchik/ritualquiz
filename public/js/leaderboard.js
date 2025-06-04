// Загрузка данных лидерборда
async function loadLeaderboard() {
  try {
    console.log('Запрашиваем данные лидерборда...');
    
    // Очищаем таблицу и показываем сообщение о загрузке
    $('#leaderboard-body').html('<tr><td colspan="4">Loading leaderboard data...</td></tr>');
    
    const response = await fetch('/api/leaderboard');
    console.log('Ответ получен:', response);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Данные лидерборда:', data);
    
    if (!Array.isArray(data)) {
      console.error('Неверный формат данных:', data);
      $('#leaderboard-body').html('<tr><td colspan="4">Error: Invalid data format</td></tr>');
      return;
    }
    
    if (data.length === 0) {
      $('#no-scores').show();
      $('#global-leaderboard').hide();
    } else {
      $('#no-scores').hide();
      $('#global-leaderboard').show();
      
      const tbody = $('#leaderboard-body');
      tbody.empty();
      
      data.forEach((entry, index) => {
        let formattedDate = 'Unknown';
        try {
          const date = new Date(entry.timestamp);
          formattedDate = date.toLocaleDateString();
        } catch (e) {
          console.error('Error formatting date:', e);
        }
        
        const rankClass = index < 3 ? `rank-${index + 1}` : '';
        
        tbody.append(`
          <tr>
            <td class="rank ${rankClass}">${index + 1}</td>
            <td>${entry.username || 'Unknown'}</td>
            <td>${entry.score || 0}</td>
            <td>${formattedDate}</td>
          </tr>
        `);
      });
    }
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    $('#leaderboard-body').html('<tr><td colspan="4">Error loading leaderboard: ' + error.message + '</td></tr>');
    $('#global-leaderboard').show();
    $('#no-scores').hide();
  }
}

// Функции для работы с Discord авторизацией
async function checkAuthStatus() {
  try {
    const response = await fetch('/api/auth-status');
    const data = await response.json();
    
    if (data.authenticated) {
      // Пользователь авторизован
      $('#not-logged').hide();
      $('#logged-in').show();
      $('#username').text(data.user.username);
      
      // Устанавливаем аватар пользователя
      if (data.user.avatar) {
        const avatarUrl = `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`;
        $('#user-avatar').attr('src', avatarUrl);
      } else {
        // Дефолтный аватар если у пользователя нет аватара
        $('#user-avatar').attr('src', 'https://cdn.discordapp.com/embed/avatars/0.png');
      }
      
      return true;
    } else {
      // Пользователь не авторизован
      $('#not-logged').show();
      $('#logged-in').hide();
      return false;
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
}

function setupAuthButtons() {
  // Кнопка входа через Discord
  $('#discord-login').on('click', function() {
    window.location.href = '/auth/discord';
  });
  
  // Кнопка выхода
  $('#logout').on('click', function() {
    window.location.href = '/auth/logout';
  });
  
  // Проверяем URL для параметра loggedIn
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('loggedIn') === 'true') {
    // Обновляем интерфейс после успешного входа
    checkAuthStatus();
    // Очищаем URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// Создаем фон (как в основной игре)
function createSpaceBackground() {
  console.log('Создаем фон...');
  const spaceBackground = $("#space-background");
  if (spaceBackground.length === 0) {
    console.log('Создаем новый элемент фона...');
    $("<div id='space-background'></div>").css({
      'position': 'fixed',
      'top': 0,
      'left': 0,
      'width': '100%',
      'height': '100%',
      'z-index': -1,
      'overflow': 'hidden',
      'background-image': 'url("vulkan.png")',
      'background-size': '100% 100%',
      'background-position': 'center'
    }).prependTo("body");
    console.log('Фон создан.');
  }
}

// Инициализация при загрузке страницы
$(document).ready(function() {
  console.log('Страница лидерборда загружена!');
  console.log('jQuery версия:', $.fn.jquery);
  
  try {
    createSpaceBackground();
    console.log('Настраиваем кнопки авторизации...');
    setupAuthButtons();
    console.log('Проверяем статус авторизации...');
    checkAuthStatus().then(() => {
      console.log('Загружаем лидерборд...');
      loadLeaderboard();
    });
  } catch (error) {
    console.error('Ошибка при инициализации страницы:', error);
  }
});
