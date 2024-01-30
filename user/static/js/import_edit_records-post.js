$(document).ready(function () {

    if(window.location.href.search('/import_check_input_status/post/') >= 0 )
    {          
        const $tableBodyPost = $('#data-table-post tbody');
        const successClasses = 'bg-light text-dark font-weight-bold';
        const modifyColumn = parseInt($('.modify_column').text());
        const filed_name_input = $('.filed_name_input').val();
        
        data.rows.forEach(function(row) {
            let existsText = row.exists ? 'Да' : 'Нет';
            let statusIcon = row.exists ? '<span class="text-success">✔</span>' : '<span class="text-danger">✖</span>';
            let actionsHtml = '';
            
            let optionsHtml = row.options.map(option => `<option value="${option}">${option}</option>`).join('');

            actionsHtml = `
                <div class="d-flex align-items-center">
                    <button class="btn btn-outline-primary create-btn mr-3">Изменить</button>
                    <button class="btn btn-outline-success create-new-option-btn mr-3">Создать</button>
                    <select name="existing_option_${row.office}" class="form-control selectpicker mr-2" data-live-search="true" data-hide-disabled="true" title="${filed_name_input}...">
                        ${optionsHtml}
                    </select>
                </div>
            `;
            let rowHtml = `
                <tr data-office="${row.office}" ${row.exists ? `class="${successClasses}"` : ''}>
                    <td>${statusIcon}</td>
                    <td>${row.office}</td>
                    <td>${row.post}</td>
                    <td>${existsText}</td>
                    <td>${actionsHtml}</td>
                </tr>
            `;
        
            $tableBodyPost.append(rowHtml);
            // Если строка помечена как 'success' в исходных данных, вызываем функцию обновления
            if (row.exists) {
                let $currentRow = $tableBodyPost.find(`tr[data-office="${row.office}"]`);
                updateRowToSuccess($currentRow);
            } 
        });
        const allRowsHaveCheckmark = $('#data-table-post tbody tr').toArray().every(row => {
            return $(row).find('td:first-child .text-success').length > 0;
        });

        if (allRowsHaveCheckmark) {
            $('#applyChanges').show();
        } else  {
            $('#applyChanges').hide();
        }


        $(document).on('click', '.create-new-option-btn', function() {
            let currentRow = $(this).closest('tr');
            let selectElement = $(`select[name="existing_option_${currentRow.find('td:nth-child(2)').text().trim()}"]`)
            let postValue = currentRow.find('td:nth-child(3)').text().trim(); // Получим значение должности из текущей строки

            // Проверим, существует ли такая опция
            if (!selectElement.find(`option[value="${postValue}"]`).length) {
                // Добавим новую опцию в select
                let newOption = `<option value="${postValue}">${postValue}</option>`;
                selectElement.append(newOption);
                 
                let $currentSelect = currentRow.find(`select[name="existing_option_${currentRow.find('td:nth-child(2)').text().trim()}"]`);
                $currentSelect.val(postValue);  // Выбор новой опции

                selectElement.selectpicker('refresh');

                updateRowToSuccess(currentRow);  // обновляем строку после добавления новой опции

                // Также, вы можете добавить логику по обновлению исходного массива 'data' с новой опцией, если это необходимо
            } else {
                Toast.setTheme(TOAST_THEME.DARK);
                Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                Toast.create("Ошибка", 'Такая опция уже существует!)', TOAST_STATUS.SUCCESS, 10000);
            }
        });
        


        function doesRecordExistInOffice(record, office) {
            return $('#data-table-post tbody tr[data-office="' + office + '"]').map(function() {
                return $(this).find('td').eq(modifyColumn).text();
            }).get().includes(record);
        }
 
        let updates = [];
        // Собираем исходные данные
        $('#data-table-post tbody tr').each(function(index) {
            let initialText = $(this).find('td:nth-child(3)').text();
            let office = $(this).attr('data-office');
            
            updates.push({
                index: index,
                office: office,
                old_post: initialText,
                new_post: initialText
            });
        });

        // Обработчик события change для select
        $('select').on('change', function() {
            let $row = $(this).closest('tr');
            let chosenOption = $(this).val();
            
            $row.find('td').eq(modifyColumn).text(chosenOption);
            updateRowToSuccess($row);  // функция для обновления строки
        });

        
        $('.create-btn').on('click', function() {
            let $currentRow = $(this).closest('tr');
            let currentOffice = $currentRow.attr('data-office');
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
                     $(`select[name="existing_option_${currentOffice}"]`).each(function() {
                        $(this).append(new Option(editedText, editedText));
                        $(this).selectpicker('refresh');  // Обновление selectpicker после добавления новой опции
                    });

                 
                    // Выбор новой опции в selectpicker текущей строки
                    let $currentSelect = $currentRow.find(`select[name="existing_option_${currentOffice}"]`);
                    $currentSelect.val(editedText);  // Выбор новой опции
                    $currentSelect.selectpicker('refresh');
                    updateRowToSuccess($currentRow);  // обновляем строку после успешного редактирования текста
                }
            });

            function doesRecordExist(record) {
                return $('table tbody tr').map(function() {
                    return $(this).find('td').eq(modifyColumn).text();
                }).get().includes(record);
            }
            
            $('#textEditor').on('input', function() {
                let editedText = $(this).val().trim();
                if (doesRecordExistInOffice(editedText, currentOffice) || editedText === 0) {
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

            const allRowsHaveCheckmark = $('#data-table-post tbody tr').toArray().every(row => {
                return $(row).find('td:first-child .text-success').length > 0;
            });

            if (allRowsHaveCheckmark) {
                $('#applyChanges').show();
            }
        }


        $('#applyChanges').click(function() {
            let records = [];
        
            /// Обновим массив updates перед отправкой запроса
            $('#data-table-post tbody tr').each(function(index) {
                let currentText = $(this).find('td:nth-child(3)').text();
                let office = $(this).attr('data-office');
                
                for (let update of updates) {
                    if (update.index === index && update.office === office) {
                        update.new_post = currentText;
                        break;
                    }
                }
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
                    'field': 'post',
                    'updates': JSON.stringify(updates),

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