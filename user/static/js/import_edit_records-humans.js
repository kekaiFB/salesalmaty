$(document).ready(function () {

    if(window.location.href.search('/import_check_input_status/fio/') >= 0 )
    {   
        const successClasses = 'bg-light text-dark font-weight-bold';
        
        // Получение индексов колонок
        const officeIndex = 1; // индекс для колонки с office
        const postIndex = 2; // индекс для колонки с post
        const fioColumn = 3; // индекс для колонки с ФИО (пример)
    
        var $tableBody = $('#data-table-fio tbody');

        // Функция для проверки на NaN и возвращения пустой строки в этом случае
        function valueOrEmpty(value) {
            if (value == 'nan')
                return ''
            return (value !== value) ? '' : value; // NaN не равен самому себе, поэтому value !== value верно только для NaN
        }

       

        function updateRowToSuccess($row) {
            $row.addClass(successClasses);
            $row.find('td:first-child .text-danger').replaceWith('<span class="text-success">✔</span>');
    
            const allRowsHaveCheckmark = $('#data-table-fio tbody tr').toArray().every(row => {
                return $(row).find('td:first-child .text-success').length > 0;
            });
    
            if (allRowsHaveCheckmark) {
                $('#applyChanges').show();
            }
        }

        function updateRowToCancel($row) {
            $row.removeClass(successClasses);
            $row.find('td:first-child .text-success').replaceWith('<span class="text-danger">✖</span>');
            $('#applyChanges').hide();
        }
        function populateTable() {
            $tableBody.empty(); // Очистка таблицы перед заполнением
            data.rows.forEach(function(row) {
                let statusIcon = row.exists ? '<span class="text-success">✔</span>' : '<span class="text-danger">✖</span>';
                let existsText = row.exists ? 'Да' : 'Нет';
                      
                // Сначала добавляем пустой option, а затем добавляем остальные options из массива
                var optionsHtml = [`<option value="">------</option>`]
                // var optionsHtml = []
                .concat(row.options.map(option => `<option value="${option}">${option}</option>`))
                .join('');

                // Остальная часть кода без изменений...
                var actionsHtml = `
                    <div class="d-flex align-items-center">
                        <button class="btn btn-outline-primary create-btn mr-3">Изменить</button>
                        <button class="btn btn-outline-success create-new-option-btn mr-3">Создать</button>
                        <select name="existing_option_${row.office.trim()}_${row.post.trim()}" class="material-select">
                            ${optionsHtml}
                        </select>
                    </div>
                `;

            //     <select name="existing_option_${row.office.trim()}_${row.post.trim()}" class="form-control selectpicker mr-2" data-live-search="true" data-hide-disabled="true" title="Выберите ФИО...">
            //     ${optionsHtml}
            // </select>

                // Generate the row HTML
                let rowHtml = `
                    <tr data-fio="${valueOrEmpty(row.fio)}">
                        <td>${statusIcon}</td>
                        <td>${row.office}</td>
                        <td>${row.post}</td>
                        <td>${valueOrEmpty(row.fio)}</td>
                        <td>${existsText}</td>
                        <td>
                            ${actionsHtml}
                        </td>
                    </tr>
                `;
    
                $tableBody.append(rowHtml);
            });
            
            const allRowsHaveCheckmark = $('#data-table-fio tbody tr').toArray().every(row => {
                return $(row).find('td:first-child .text-success').length > 0;
            });
    
            if (allRowsHaveCheckmark) {
                $('#applyChanges').show();
            } else  {
                $('#applyChanges').hide();
            }

            // $('select.selectpicker').selectpicker();    
        }

        populateTable(); // Инициализация таблицы данными
    
        // Заполнение таблицы данными
        let updates = [];
        $('#data-table-fio tbody tr').each(function(index) {
            let office = $(this).find('td:nth-child(2)').text();
            let post = $(this).find('td:nth-child(3)').text();
            let currentText = $(this).find('td:nth-child(4)').text();

            updates.push({
                index: index,
                office: office,
                post: post,
                old_fio: currentText,
                new_fio: currentText
            });
        }); 


        $(document).on('click', '.create-new-option-btn', function() {
            let currentRow = $(this).closest('tr');
            let officeValue = currentRow.find('td:nth-child(2)').text().trim();
            let postValue = currentRow.find('td:nth-child(3)').text().trim();
            let fioValue = currentRow.find('td:nth-child(4)').text().trim();
        
            // Формируем селектор для поиска всех select элементов с нужными office и post
            let selectSelector = `select[name="existing_option_${officeValue.trim()}_${postValue.trim()}"]`;
            let selectsToUpdate = $(selectSelector);
        
            // Создаем новую опцию, если она еще не существует
            if (!selectsToUpdate.eq(0).find(`option[value="${fioValue}"]`).length) {
                let newOption = `<option value="${fioValue}">${fioValue}</option>`;
        
                // Добавляем опцию во все найденные select элементы
                selectsToUpdate.append(newOption);
        
               
                // Выбираем новую опцию только в текущем select
                let currentSelect = currentRow.find(`select[name="existing_option_${officeValue}_${postValue}"]`);
                currentSelect.val(fioValue);
                
                 // Обновляем все select элементы
                //  selectsToUpdate.selectpicker('refresh');
                        
            
                // Обновляем текущую строку до успешного статуса
                updateRowToSuccess(currentRow);
            } else {
                Toast.setTheme(TOAST_THEME.DARK);
                Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                Toast.create("Ошибка", 'Такая опция уже существует!)', TOAST_STATUS.INFO, 10000);

                let currentSelect = currentRow.find(`select[name="existing_option_${officeValue}_${postValue}"]`);
                currentSelect.val(fioValue);
                // selectsToUpdate.selectpicker('refresh');
                updateRowToSuccess(currentRow);
            }
            // $(selectSelector).selectpicker('refresh');
        });


        $(document).on('change', 'select[name^="existing_option_"]', function() {
            let $currentRow = $(this).closest('tr');
            let selectedValue = $(this).val();
        
            $currentRow.find('td').eq(fioColumn).text(selectedValue);
            selectedValue ? updateRowToSuccess($currentRow) : updateRowToCancel($currentRow);
        });
        

        // Проверка уникальности ФИО в пределах office и post
        function isFioUniqueInOfficeAndPost(fio, office, post) {
            // Проверяем, не существует ли уже такое же значение ФИО в select элементах
            // для заданных офиса и должности.
            return !$('table tbody tr').filter(function() {
                let rowOffice = $(this).find('td').eq(officeIndex).text().trim();
                let rowPost = $(this).find('td').eq(postIndex).text().trim();
                return rowOffice === office && rowPost === post;
            }).find('select').filter(function() {
                // В этом месте предполагается, что <select> имеет атрибут name в формате "existing_option_office_post"
                let selectName = `existing_option_${office}_${post}`;
                return $(this).attr('name') === selectName;
            }).find('option').filter(function() {
                return $(this).val() === fio;
            }).length > 0;  // Если длина коллекции больше 0, значит такое ФИО уже существует
        }

        // Обработчик для кнопки "Изменить"
        $('.create-btn').on('click', function() {
            let $currentRow = $(this).closest('tr');
            let currentOffice = $currentRow.find('td').eq(officeIndex).text().trim();
            let currentPost = $currentRow.find('td').eq(postIndex).text().trim();
            let currentFio = $currentRow.find('td').eq(fioColumn).text().trim();
            
            $('#textEditor').val(currentFio);
            $('#textEditorModal').data('office', currentOffice);
            $('#textEditorModal').data('post', currentPost);
        
            $('#textEditorModal').modal('show');
            
            $('#saveTextEditor').off('click').on('click', function() {
                let editedFio = $('#textEditor').val().trim();
                
                if (isFioUniqueInOfficeAndPost(editedFio, currentOffice, currentPost)) {
                    $currentRow.find('td').eq(fioColumn).text(editedFio);
                    updateRowToSuccess($currentRow);
                    $('#textEditorModal').modal('hide');
                    // Добавление новой записи и обновление select'ов опущены для краткости

                     // Формируем селектор для поиска всех select элементов с нужными office и post
                    let selectSelector = `select[name="existing_option_${currentOffice}_${currentPost}"]`;
                    let selectsToUpdate = $(selectSelector);

                    // Добавляем опцию во все найденные select элементы
                    let newOption = `<option value="${editedFio}">${editedFio}</option>`;
                    selectsToUpdate.append(newOption);
                    
                    // Выбираем новую опцию только в текущем select
                    let currentSelect = $currentRow.find(`select[name="existing_option_${currentOffice}_${currentPost}"]`);
                    currentSelect.val(editedFio);

                    
                    // Обновляем все select элементы
                    // selectsToUpdate.selectpicker('refresh');
                } else {
                    // Управление ошибками для неуникального ФИО
                    $('#textEditor').css('border-color', 'red');
                    $('#textError').text('Это ФИО уже существует в этом подразделении и на этой должности!').show();
                    $('#saveTextEditor').prop('disabled', true);
                }
            });
        });

        // Обработчик для изменений в текстовом редакторе
        $('#textEditor').on('input', function() {
            let editedFio = $(this).val().trim();
            let $modal = $(this).closest('#textEditorModal');
            let currentOffice = $modal.data('office');
            let currentPost = $modal.data('post');
    
            if (!isFioUniqueInOfficeAndPost(editedFio, currentOffice, currentPost) || editedFio === 0) {
                $('#textEditor').css('border-color', 'red');
                $('#textError').text('Это ФИО уже существует в этом подразделении и на этой должности. Или входное значение равно пустому значению!').show();
                $('#saveTextEditor').prop('disabled', true);
            } else {
                $('#textEditor').css('border-color', '');
                $('#textError').hide();
                $('#saveTextEditor').prop('disabled', false);
            }
        });

        
        $('.calculate_fio').click(function() {
            Toast.setTheme(TOAST_THEME.DARK);
            Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
            Toast.create("Информация", 'Начинаем расчет', TOAST_STATUS.SUCCESS, 10000);
        
            calculate_fio()
            
            Toast.setTheme(TOAST_THEME.DARK);
            Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
            Toast.create("Информация", 'Расчет завершен', TOAST_STATUS.SUCCESS, 10000);
        });
        
        function calculate_fio() {
            let updateRequired = {};
        
            // Кэшируем строки таблицы
            let $rows = $('#data-table-fio tbody tr');
        
            // Первый проход для создания опций и отметки для обновления
            $rows.each(function() {
                let $cells = $(this).find('td');
                let officeValue = $cells.eq(officeIndex).text().trim();
                let postValue = $cells.eq(postIndex).text().trim();
                let fioValue = $cells.eq(fioColumn).text().trim();
                let selectName = `existing_option_${officeValue}_${postValue}`;
                if ($(`select[name="${selectName}"] option[value="${fioValue}"]`).length === 0) {
                    let newOption = new Option(fioValue, fioValue);
                    $(`select[name="${selectName}"]`).append(newOption);
                    updateRequired[selectName] = true;
                }
            });
        
            // Обновляем все помеченные селекты
            // for (let selectName in updateRequired) {
            //     $(`select[name="${selectName}"]`).selectpicker('refresh');
            // }
        
            // Второй проход для установки значений
            $rows.each(function() {
                let $cells = $(this).find('td');
                let officeValue = $cells.eq(officeIndex).text().trim();
                let postValue = $cells.eq(postIndex).text().trim();
                let fioValue = $cells.eq(fioColumn).text().trim();
                let selectName = `existing_option_${officeValue}_${postValue}`;
                let $currentSelect = $(this).find(`select[name="${selectName}"]`);
                $currentSelect.val(fioValue)
                let selectedValue = $currentSelect.val();
                selectedValue ? updateRowToSuccess($(this)) : updateRowToCancel($(this));

            });
        }
        


        $('#applyChanges').click(function() {
            let records = [];
        
            /// Обновим массив updates перед отправкой запроса
            $('#data-table-fio tbody tr').each(function(index) {
                let office = $(this).find('td:nth-child(2)').text().trim();
                let post = $(this).find('td:nth-child(3)').text().trim();
                let currentText = $(this).find('td:nth-child(4)').text().trim();
                
                for (let update of updates) {
                    if (update.index === index && update.office === office && update.post === post) {
                        update.new_fio = currentText;
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
                    'field': 'fio',
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