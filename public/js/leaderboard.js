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
        
        const tr = $('<tr>');
        $('<td>')
          .addClass('rank ' + rankClass)
          .text(index + 1)
          .appendTo(tr);
        $('<td>')
          .text(entry.username || 'Unknown')
          .appendTo(tr);
        $('<td>')
          .text(entry.score || 0)
          .appendTo(tr);
        $('<td>')
          .text(formattedDate)
          .appendTo(tr);
        tbody.append(tr);
      });
    }
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    $('#leaderboard-body').html('<tr><td colspan="4">Error loading leaderboard: ' + error.message + '</td></tr>');
    $('#global-leaderboard').show();
    $('#no-scores').hide();
  }
}


// Инициализация при загрузке страницы
$(document).ready(function() {
  console.log('Страница лидерборда загружена!');
  console.log('jQuery версия:', $.fn.jquery);
  
  try {
    createSpaceBackground("images/vulkan.png");
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
