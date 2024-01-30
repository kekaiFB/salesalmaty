$(document).ready(function () {
    if(window.location.href.search('timetable/telegram/') >= 0)
    {            
        const dom = 'fltipr';
        
        const telegram_dataTable = $('#timetable-telegram').DataTable({
                "dom": dom,
                stateSave: true,
                select: true,
        });     
        telegram_dataTable.page.len(5).draw();

            
        //Каскадные фильтры
        var selected_val_column = {}
        var column_active = -1
        init_dt_select(telegram_dataTable, selected_val_column, column_active)   



        
        const telegram_dataTable_structure = $('#timetable-telegram-structure').DataTable({
                "dom": dom,
                stateSave: true,
                select: true,
        });     
        telegram_dataTable_structure.page.len(5).draw();
            
        //Каскадные фильтры
        // var selected_val_column = {}
        // var column_active = -1
        // init_dt_select(telegram_dataTable_structure, selected_val_column, column_active)  


        document.getElementById('showInstructions').addEventListener('click', function() {

            const instructions = [
                "Сообщения подгружаются при обновлении текущей страницы.",
                "Загружаются только те сообщения, которые еще не были загружены на текущий сайт. То есть, удалив телеграмму с таблицы, вы не сможете повторно ее загрузить. Для этого вам придестя заново отправить сообщение на почту.",
                "Телеграмму можно импортировать на сайт один раз, после этого она будет подсвечиваться зеленым цветом.",
                "При нажатии на кнопку 'Стркутурировать сообщения' текущий прогресс импорта телеграмм будет сброшен, но туда добавятся все имеющиеся не импортированные телеграммы",
                "Терминалы и 'переход через сутки', пока что, не учитываются при импорте телеграмм",
                "В последующих версиях, когда будет замечено что программа не ошибается, можно будет исключить действия пользователя в импорте телеграмм, и формировании ответных телеграмм",
            ];
            
            // Получаем модальное окно и его тело
            var modal = $('.telegram-modal-instructions');
            var instructionsBody = $('.modal-body-instructions');
            var modalTitle = $('.modal-title-instructions');
            
            // Добавляем классы Bootstrap к заголовку и телу модального окна
            modalTitle.addClass('modal-title'); // Добавляем класс для заголовка
            instructionsBody.addClass('modal-body'); // Добавляем класс для тела
            
            // Устанавливаем текст заголовка
            modalTitle.html('Инструкции');
            
            // Очищаем текущее содержимое модального окна
            instructionsBody.html('');
            
            // Добавляем инструкции из массива в модальное окно
            for (var i = 0; i < instructions.length; i++) {
                var instruction = document.createElement('p');
                instruction.className = 'alert alert-warning'; 
                instruction.textContent = instructions[i];
                instructionsBody.append(instruction);
            }
            
            // Показываем модальное окно
            modal.modal('show');
        });


        $('#decode_messages').click(function() { 
            Toast.setTheme(TOAST_THEME.DARK);
            Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
            Toast.create("Пожалуйста подождите", '', TOAST_STATUS.INFO, 10000);

            $('#decode_messages').addClass('button-loading'); // Добавляем класс для анимации


            var checked_messages = [0];

            // Перебираем все строки в таблице
            telegram_dataTable.rows().every(function(rowIdx, tableLoop, rowLoop) {
                // Получаем данные строки
                let row = this.node();
                // Находим чекбокс в столбце "Выбрать"
                let checkbox = $(row).find('input[type="checkbox"]');
                // Проверяем, отмечен ли чекбокс
                if (checkbox.prop('checked')) {
                    // Если отмечен, добавляем data-id этой строки в массив
                    checked_messages.push(checkbox.data('id'));
                }
            });

            $.ajax({
                url: window.location.href,
                method: "post",
                dataType: "json",
                traditional: true,
                data: {
                    'action': 'decode_messages',
                    'used_messages': checked_messages,
                    'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
                },
                success: function(data) {
                    $('#decode_messages').removeClass('button-loading'); // Добавляем класс для анимации
                    if (data.status != 'ok') {
                        Toast.setTheme(TOAST_THEME.DARK);
                        Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                        Toast.create("Ошибка", '', TOAST_STATUS.ERROR, 10000);
                    } else {
                        location.reload()
                        Toast.setTheme(TOAST_THEME.DARK);
                        Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                        Toast.create("Успешно", 'Данные успешно структурированы', TOAST_STATUS.SUCCESS, 10000);
                    }
                    
                },
                error: function(error) {
                    $('#decode_messages').removeClass('button-loading'); // Добавляем класс для анимации
                    Toast.setTheme(TOAST_THEME.DARK);
                    Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                    Toast.create("Ошибка", 'Ошибка на стороне сервера', TOAST_STATUS.ERROR, 3000);
                }
            });
        });


        $('#get_message').click(function() { 
            Toast.setTheme(TOAST_THEME.DARK);
            Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
            Toast.create("Пожалуйста подождите", '', TOAST_STATUS.INFO, 10000);

            $('#get_message').addClass('button-loading'); // Добавляем класс для анимации

            $.ajax({
                url: window.location.href,
                method: "post",
                dataType: "json",
                data: {
                    'action': 'get_message',
                    'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
                },
                success: function(data) {
                    if (data.status != 'ok') {
                        Toast.setTheme(TOAST_THEME.DARK);
                        Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                        Toast.create("Ошибка", '', TOAST_STATUS.ERROR, 10000);
                    } else {
                        location.reload()
                        Toast.setTheme(TOAST_THEME.DARK);
                        Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                        Toast.create("Успешно", 'Почта успешно загружена', TOAST_STATUS.SUCCESS, 10000);
                    }
                },
                error: function(error) {
                    Toast.setTheme(TOAST_THEME.DARK);
                    Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                    Toast.create("Ошибка", 'Ошибка на стороне сервера', TOAST_STATUS.ERROR, 3000);
                }
            });
        });


        $('#import_telegram').click(function() { 
            Toast.setTheme(TOAST_THEME.DARK);
            Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
            Toast.create("Пожалуйста подождите", '', TOAST_STATUS.INFO, 10000);

            $('#import_telegram').addClass('button-loading'); // Добавляем класс для анимации
            
            var checked_messages = [0];

            // Перебираем все строки в таблице
            telegram_dataTable.rows().every(function(rowIdx, tableLoop, rowLoop) {
                // Получаем данные строки
                let row = this.node();
                // Находим чекбокс в столбце "Выбрать"
                let checkbox = $(row).find('input[type="checkbox"]');
                // Проверяем, отмечен ли чекбокс
                if (checkbox.prop('checked')) {
                    // Если отмечен, добавляем data-id этой строки в массив
                    checked_messages.push(checkbox.data('id'));
                }
            });
            $.ajax({
                url: window.location.href,
                method: "post",
                dataType: "json",
                traditional: true,
                data: {
                    'action': 'decode_messages',
                    'import_status': 'ok',
                    'selected_timetable': $('.timetableList-select').val(),
                    'used_messages': checked_messages,
                    'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
                },
                success: function(data) {
                    $('#import_telegram').removeClass('button-loading'); 
                    if (data.status != 'ok') {
                        Toast.setTheme(TOAST_THEME.DARK);
                        Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                        Toast.create("Ошибка", '', TOAST_STATUS.ERROR, 10000);
                    } else {
                        location.reload()
                        Toast.setTheme(TOAST_THEME.DARK);
                        Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                        Toast.create("Успешно", 'Данные успешно импортированы', TOAST_STATUS.SUCCESS, 10000);
                    }
                },
                error: function(error) {
                    Toast.setTheme(TOAST_THEME.DARK);
                    Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                    Toast.create("Ошибка", 'Ошибка на стороне сервера', TOAST_STATUS.ERROR, 3000);
                }
            });
        });


        $(document).on('click', '.showTableButton', function() {
            $('.elem_li_for_color').removeClass('text-dark')

            // Получаем data-id кнопки, чтобы найти соответствующую таблицу
            var dataId = $(this).data('id');
            
            // Находим таблицу с классом 'telegram_record_for_modal' и указанным id
            var table = $('.telegram_record_for_modal#' + dataId);
            
            // Получаем модальное окно и его тело
            var modal = $('.telegram-modal-actions');
            var instructionsBody = $('.modal-body-actions');
            var modalTitle = $('.modal-title-actions');

            

            // Добавляем классы Bootstrap к заголовку и телу модального окна
            modalTitle.addClass('modal-title'); // Добавляем класс для заголовка
            instructionsBody.addClass('modal-body'); // Добавляем класс для тела
                        
            // Очищаем текущее содержимое модального окна
            instructionsBody.html('');
            
            // Клонируем таблицу и добавляем ее в модальное окно, если она была найдена
            if (table.length > 0) {
                var tableClone = table.clone();
                tableClone.removeAttr('hidden');
            
                instructionsBody.append(tableClone);
                
                // Установим ширину модального окна равной ширине контента
                modal.find('.modal-dialog').css('max-width', '75%');
                modal.find('.modal-content').css('width', 'auto');
                
                // Показываем модальное окно
                modal.modal('show');
            } else {
                // Если таблица не найдена, можно добавить сообщение об ошибке
                instructionsBody.html('<p>Таблица не найдена.</p>');
            }
        });

        $('.timetableList-select').select2();
        // Установка минимальной ширины для Select2 контейнера
        $('.timetableList-select').css('min-width', '100px');


        // Проверка состояния при инициализации
        toggleImportButton();

        // Обработчик изменения выбора
        $('.timetableList-select').on('change', function() {
            toggleImportButton();
        });

        function toggleImportButton() {
            if ($('.timetableList-select').val()) {
                $('#import_telegram').prop('disabled', false);
            } else {
                $('#import_telegram').prop('disabled', true);
            }
        }
    }
});



