$(document).ready(function () {

    if(window.location.href.search('/import_check_input_status/office/') >= 0 )
    {          
        const $tableBody = $('#data-table-office tbody');
        const successClasses = 'bg-light text-dark font-weight-bold';
        const modifyColumn = parseInt($('.modify_column').text());
        const filed_name_input = $('.filed_name_input').val();
        var original_records = []
        
        data.rows.forEach(function(row) {
            let existsText = row.exists ? 'Да' : 'Нет';
            
            // Отображение статуса: галочка или крестик
            let statusIcon = row.exists ? '<span class="text-success">✔</span>' : '<span class="text-danger">✖</span>';
            
            let actionsHtml = '';
            actionsHtml = `
                <div class="d-flex align-items-center">
                    <button class="btn btn-outline-primary create-btn mr-3">Изменить</button>
                    <button class="btn btn-outline-success create-new-option-btn mr-3">Создать</button>
                    <select name="existing_option" class="form-control selectpicker mr-2" data-live-search="true" data-hide-disabled="true" title="${filed_name_input}...">
                        ${row.options.map(option => `<option value="${option}">${option}</option>`).join('')}
                    </select>
                </div>
            `;
            let rowHtml = `
                <tr ${row.exists ? `class="${successClasses}"` : ''}>
                    <td>${statusIcon}</td>
                    <td>${row.record}</td>
                    <td>${existsText}</td>
                    <td>${actionsHtml}</td>
                </tr>
            `;
            
            $tableBody.append(rowHtml);

        });

        const allRowsHaveCheckmark = $('#data-table-office tbody tr').toArray().every(row => {
            return $(row).find('td:first-child .text-success').length > 0;
        });

        if (allRowsHaveCheckmark) {
            $('#applyChanges').show();
        } else  {
            $('#applyChanges').hide();
        }

        // Собираем все записи из столбца "запись"
        $('#data-table-office tbody tr').each(function() {
            let record = $(this).find('td:nth-child(2)').text(); // Предполагая, что "запись" находится во втором столбце
            original_records.push(record);
        });

        // Обработчик события change для select
        $('select[name="existing_option"]').on('change', function() {
            let $row = $(this).closest('tr');
            let chosenOption = $(this).val();
            
            $row.find('td').eq(modifyColumn).text(chosenOption);
            updateRowToSuccess($row);  // функция для обновления строки
        });


        $(document).on('click', '.create-new-option-btn', function() {
            let currentRow = $(this).closest('tr');
            let selectElement = $(`select[name="existing_option"]`)
            let officeValue = currentRow.find('td:nth-child(2)').text().trim(); // Получим значение должности из текущей строки

            // Проверим, существует ли такая опция
            if (!selectElement.find(`option[value="${officeValue}"]`).length) {
                // Добавим новую опцию в select
                let newOption = `<option value="${officeValue}">${officeValue}</option>`;
                selectElement.append(newOption);
                 
                let $currentSelect = currentRow.find(`select[name="existing_option"]`);
                $currentSelect.val(officeValue);  // Выбор новой опции

                selectElement.selectpicker('refresh');

                updateRowToSuccess(currentRow);  // обновляем строку после добавления новой опции

                // Также, вы можете добавить логику по обновлению исходного массива 'data' с новой опцией, если это необходимо
            } else {
                Toast.setTheme(TOAST_THEME.DARK);
                Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                Toast.create("Ошибка", 'Такая опция уже существует!)', TOAST_STATUS.SUCCESS, 10000);
            }
        });

        $('.create-btn').on('click', function() {
            let $currentRow = $(this).closest('tr');
            
            let currentText = $currentRow.find('td').eq(modifyColumn).text();
            
            $('#textEditor').val(currentText);
            
            $('#textEditorModal').modal('show');
            
            $('#saveTextEditor').off('click').on('click', function() {
                let editedText = $('#textEditor').val().trim();
                
                let allCurrentEntries = $('table tbody tr td').eq(modifyColumn).map(function() {
                    return $(this).text();
                }).get();
                
                if (allCurrentEntries.includes(editedText)) {
                    $('#textEditor').css('border-color', 'red');
                    $('#textError').show();
                    $(this).prop('disabled', true);
                } else {
                    $('#textEditor').css('border-color', '');
                    $('#textError').hide();
                    $(this).prop('disabled', false);
                    $currentRow.find('td').eq(modifyColumn).text(editedText);
                    updateRowToSuccess($currentRow);  // функция для обновления строки

                    $('#textEditorModal').modal('hide');

                     // Добавление новой записи в options всех select'ов
                     $('select[name="existing_option"]').each(function() {
                        $(this).append(new Option(editedText, editedText));
                        $(this).selectpicker('refresh');  // Обновление selectpicker после добавления новой опции
                    });

                 
                    // Выбор новой опции в selectpicker текущей строки
                    let $currentSelect = $currentRow.find('select[name="existing_option"]');
                    $currentSelect.val(editedText);  // Выбор новой опции
                    $currentSelect.selectpicker('refresh');
                    
                }
            });

            function doesRecordExist(record) {
                return $('table tbody tr').map(function() {
                    return $(this).find('td').eq(modifyColumn).text();
                }).get().includes(record);
            }
            
            $('#textEditor').on('input', function() {
                let editedText = $(this).val().trim();
                
                if (doesRecordExist(editedText)|| editedText === 0) {
                    $('#textEditor').css('border-color', 'red');
                    $('#textError').text('Запись уже существует в этом подразделении или входное значение равно пустому значению!').show();
                    $('#saveTextEditor').prop('disabled', true);
                } else {
                    $('#textEditor').css('border-color', '');
                    $('#textError').hide();
                    $('#saveTextEditor').prop('disabled', false);
                }
            });
        });

        // Функция для обновления строки в успешное состояние
        function updateRowToSuccess($row) {
            $row.addClass(successClasses);
            $row.find('td:first-child .text-danger').replaceWith('<span class="text-success">✔</span>');

            const allRowsHaveCheckmark = $('#data-table-office tbody tr').toArray().every(row => {
                return $(row).find('td:first-child .text-success').length > 0;
            });
            
            if (allRowsHaveCheckmark) {
                $('#applyChanges').show();
            }
        }


        $('#applyChanges').click(function() {
            let records = [];
        
            // Собираем все записи из столбца "запись"
            $('#data-table-office tbody tr').each(function() {
                let record = $(this).find('td:nth-child(2)').text(); // Предполагая, что "запись" находится во втором столбце
                records.push(record);
            });
        
            Toast.setTheme(TOAST_THEME.DARK);
            Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
            Toast.create("Информация", 'Пожалуйста подождите)', TOAST_STATUS.SUCCESS, 10000);
            $('#applyChanges').prop('disabled', true);

            // Отправляем запрос AJAX
            $.ajax({
                url: window.location.href,
                type: 'POST',
                data: {
                    'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val(),
                    'action': 'update',
                    'field': 'office',
                    'records': JSON.stringify(records) ,
                    'original_records': JSON.stringify(original_records),  // Преобразуем массив в строку формата JSON для отправки на сервер
                },
                success: function(data) {
                    if (data.redirect_url) {
                        window.location.href = data.redirect_url;
                    }
                    setTimeout(function() {
                        $('#applyChanges').prop('disabled', false);  // Включаем кнопку с задержкой в 1 секунду
                    }, 1000);
                },
                error: function() {
                    alert('Произошла ошибка при отправке запроса.');
                    setTimeout(function() {
                        $('#applyChanges').prop('disabled', false);  // Включаем кнопку с задержкой в 1 секунду
                    }, 1000);
                }
            });
        });


       

    // ----------------------------------------------------------------
    }
});