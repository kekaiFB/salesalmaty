$(document).ready(function () {

    if(window.location.href.search('/import-humans/') >= 0 || window.location.href.search('/import-snj/') >= 0 )
    {     
        function isValidFile(file) {
            var fileExtension = file.name.split('.').pop().toLowerCase();
            return validExtensions.includes('.' + fileExtension);
        }
        function getErrorMessage() {
            var extensionsString = validExtensions.join(', ');
            return 'Пожалуйста, загружайте только файлы с расширениями: ' + extensionsString;
        }
        

        var dropZone = $('#drop_zone');

        var validExtensions = ['.xlsx']; // Здесь можно добавить больше расширений при необходимости

        // При клике на зону, вызываем стандартный клик по input для файлов

        // Отдельный обработчик для всей зоны, но исключаем клик по внутреннему input
        $('#drop_zone').click(function(event){
            if (event.target === this || event.target === $('.fa-file-upload')[0]) {
                $('#file_input').click();
            }
        });
    
         // Добавляем/удаляем класс для визуального отображения перетаскивания
        $('#drop_zone').on('dragover', function(e) {
            e.preventDefault();  
            $(this).addClass('dragover');
        });

        $('#drop_zone').on('dragleave', function(e) {
            e.preventDefault();  
            $(this).removeClass('dragover');
        });

    
        dropZone.on('drop', function(e) {
            e.preventDefault();  
            $(this).removeClass('dragover');

            var files = e.originalEvent.dataTransfer.files;

            if (isValidFile(files[0])) {
                handleFiles(files);
            } else {
                alert(getErrorMessage()); // Используем функцию для получения сообщения об ошибке
            }
        });
    
        // Обработка, когда файлы выбраны через диалоговое окно
        $('#file_input').change(function() {
            var files = this.files;
    
            
            // Проверяем файл и передаем его, если он допустимый  
            if (isValidFile(files[0])) {
                handleFiles(files);
            } else {
                alert(getErrorMessage()); // Используем функцию для получения сообщения об ошибке
            }
        });
    
        // Функция обработки файлов
        function handleFiles(files) {
            var file = files[0];
        
            // Получаем расширение файла
            var fileExtension = file.name.split('.').pop().toLowerCase();
        
            // Проверяем, соответствует ли файл одному из допустимых расширений
            if (validExtensions.includes('.' + fileExtension)) {
                var formData = new FormData();
                formData.append('file', file); // 'file' это ключ, по которому сервер будет искать ваш файл

                 // Добавление CSRF токена в formData
                var csrftoken = $('input[name=csrfmiddlewaretoken]').val();
                formData.append('csrfmiddlewaretoken', csrftoken);

                
                // Отправляем файл на сервер
                $.ajax({
                    url: window.location.href, // Текущий URL
                    type: 'POST',
                    data: formData,
                    processData: false, // Сообщаем jQuery не обрабатывать данные
                    contentType: false, // Сообщаем jQuery не устанавливать заголовок contentType
                    success: function (data) {
                        location.reload()
                    },
                    error: function (xhr, status, error) {
                        alert('Произошла ошибка при загрузке файла: ' + error);
                    }
                });
                
            } else {
                // Если расширение файла не соответствует допустимому, выводим сообщение об ошибке
                alert('Пожалуйста, загружайте файлы следующих форматов: ' + validExtensions.join(', '));
            }
        }


        
        // Инициализация Bootstrap Confirmation на элементе
        $('.delete-file-btn').confirmation({
            rootSelector: '.delete-file-btn',
            title: 'Вы уверены?', // Заголовок подтверждения
            btnOkLabel: 'Да, удалить', // Текст на кнопке подтверждения
            btnCancelLabel: 'Отмена', // Текст на кнопке отмены
            btnOkClass: 'btn btn-success', // Классы для кнопки подтверждения
            btnCancelClass: 'btn btn-danger', // Классы для кнопки отмены
            onConfirm: function() {
                
                Toast.setTheme(TOAST_THEME.DARK);
                Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                Toast.create("Информация", 'Удаляем файл', TOAST_STATUS.INFO, 10000);

                // Получаем URL из данных элемента
                var url = $(this).data('url');
                // AJAX запрос для удаления файла
                $.ajax({
                    url: url,
                    type: 'POST',
                    data: {
                        'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val(),
                        'action': 'delete_file'
                    },
                    success: function(response) {
                        // Перезагрузить страницу или обновить интерфейс пользователя
                        location.reload();
                    },
                    error: function() {
                        // Отобразить сообщение об ошибке
                        alert('Произошла ошибка при отправке запроса.');
                    }
                });
            },
            onCancel: function() {
                // Обработка отмены действия
            },
        });

        // Предотвращаем стандартное поведение ссылки при клике
        $('.delete-file-btn').on('click', function(e) {
            e.preventDefault();
        });
        
        
        $("#StartImport").on("click", function(e) {
            e.preventDefault();
            var button = $(this);
            var url = button.data("url"); // URL текущей страницы
                
            Toast.setTheme(TOAST_THEME.DARK);
            Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
            Toast.create("Информация", 'Начинаем импорт, это может занять несколько минут, пожалуйста не закрывайте страницу', TOAST_STATUS.INFO, 10000);
            $('.StartImportDiv').toggle();

            // Получение выбранных значений
            var selectedReason = $('select[name="reason"]').val();
            var selectedShift = $('select[name="shift"]').val();

        
            $.ajax({
                url: url,
                type: 'POST',
                data: {
                    'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val(),
                    'action': 'start_import', // Параметр, указывающий на действие
                    'reason': selectedReason, // Передача выбранной причины
                    'shift': selectedShift, // Передача выбранной смены
                },
                success: function(response) {
                    Toast.setTheme(TOAST_THEME.DARK);
                    Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                    Toast.create("Информация", 'Успешно', TOAST_STATUS.INFO, 10000);
                    location.reload()
                },
                error: function() {
                    alert('Произошла ошибка при отправке запроса.');
                    $('.StartImportDiv').toggle();
                }
            });
        });
        
        // Инициализация Bootstrap Confirmation на элементе
        $('#RefreshImport').confirmation({
            rootSelector: '#RefreshImport',
            title: 'Проверьте пожалуйста все связанные объекты(ресурсы подразделений, ТГО, Расписания и тд.)', // Заголовок подтверждения
            btnOkLabel: 'Откатить', // Текст на кнопке подтверждения
            btnCancelLabel: 'Отмена', // Текст на кнопке отмены
            btnOkClass: 'btn btn-success', // Классы для кнопки подтверждения
            btnCancelClass: 'btn btn-danger', // Классы для кнопки отмены
            onConfirm: function() {    
                Toast.setTheme(TOAST_THEME.DARK);
                Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                Toast.create("Информация", 'Начинаем откат', TOAST_STATUS.INFO, 10000);
                $('.StartImportDiv').toggle();

                // Получаем URL из данных элемента
                var url = $(this).data('url');
                // AJAX запрос для удаления файла
                $.ajax({
                    url: url,
                    type: 'POST',
                    data: {
                        'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val(),
                        'action': 'refresh_import',
                    },
                    success: function() {
                        Toast.setTheme(TOAST_THEME.DARK);
                        Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                        Toast.create("Информация", 'Успешно', TOAST_STATUS.INFO, 10000);
                        location.reload()
                    },
                    error: function() {
                        alert('Произошла ошибка при отправке запроса.');
                        $('.StartImportDiv').toggle();
                    }
                });
            },
            onCancel: function() {
                // Обработка отмены действия
            },
        });

        
        
        
        var modify_file_dt = $('.modify_file').DataTable({
            "pageLength": 5,
            "columnDefs": [
                {
                    "targets": [4, 5], // Индексация столбцов начинается с 0, поэтому 3-й и 4-й столбцы имеют индексы 2 и 3
                    "render": function(data, type, row) {
                        return data === '&lt;NA&gt;' ? '' : data;
                    }
                }
            ]
        });
    
        modify_file_dt.draw();
        modify_file_dt.page.len(5).draw();
    // ----------------------------------------------------------------
    }
});