// Функция для экранирования специальных символов в регулярных выражениях
function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function select_filters_cascade(table, selected_val_column, column_active) {
    table.columns().every(function (column_index) {
        const footerHtml = $(table.column(column_index).footer()).html();
        if (footerHtml && !['Изменить', 'Удалить', 'Подробнее', 'Добавить', 'Выбрать'].includes(footerHtml)) {
            if (column_active !== column_index) {
                const column = this;

                
                var header = $(column.header()).html().split('<br>');

                if (header.length > 1) {
                    header= header[0]
                }

                const select = $('<select class="form-control" multiple="multiple"></select>')
                .appendTo($(column.header()).empty().append(header).append('<br>'));

                const selectAllOption = $('<option value="all">Выбрать все</option>');
                select.append(selectAllOption);

                const select_set = new Set();

                table.column(column_index, { search: 'applied' })
                .data()
                .unique()
                .sort()
                .each(function (d) {
                    if (d) {                        
                        // Удаление сообщений с определенным форматом
                        if (d.includes('<span class="not-highspanghted custom-size">')) {
                            return; // пропускаем такие строки
                        }

                        // Обработка для <select> элемента
                        if (d.includes('<select>')) {
                            $(d).find('option').each(function () {
                                select_set.add($(this).val());
                            });
                            return;
                        }

                        // Замена символов на HTML символы
                        if (d.includes('-&gt;')) {
                            d = d.replaceAll('-&gt;', '->');
                        }

                        // Взятие только значения из <a> элемента
                        if (d.includes('<a href=')) {
                            d = $(d).text();
                        }

                        const arr = d.split(',').map(item => {
                            return item.split(' ').filter(e => e === 0 ? true : e).join(' ');
                        });
                        arr.forEach(item => {
                            select_set.add(item);
                        });
                    }
                });
                select_set.forEach(val => {
                    select.append('<option value="' + val + '">' + val + '</option>');
                });

                // Обработка выбора опции "Выбрать все"
                select.on('select2:selecting', function (e) {
                    if (e.params.args.data.id === 'all') {
                        var areAllSelected = $(this).find('option').not('[value="all"]').length === $(this).find('option:selected').not('[value="all"]').length;
                        if (areAllSelected) {
                            // Если все опции уже выбраны, снимаем выбор со всех
                            $(this).find('option').not('[value="all"]').prop('selected', false);
                        } else {
                            // Если не все опции выбраны, выбираем все
                            $(this).find('option').not('[value="all"]').prop('selected', true);
                        }
                        $(this).trigger('change');
                        e.preventDefault(); 
                    }
                });
     

                if (selected_val_column[column_index] && selected_val_column[column_index].split('|')[0] !== '') {
                    selected_val_column[column_index].split('|').forEach(value => {
                        if (!select.find("option:contains('" + value + "')").length) {
                            select.append('<option value="' + value + '">' + value + '</option>');
                        }
                    });

                    selected_val_column[column_index].split('|').forEach(value => {
                        if (select.find("option:contains('" + value + "')").length) {
                            select.find("option:contains('" + value + "')").attr("selected", "selected");
                        }
                    });
                }

                select.addClass("overflow-scroll").select2({
                    // minimumInputLength: 2,
                    language: {
                        noResults: function() {
                            return "Ничего не найдено";
                        },
                        inputTooShort: function (args) {
                            var remainingChars = args.minimum - args.input.length;
                            return "Пожалуйста, введите еще " + remainingChars + " символа(ов)";
                        }
                    },
                    
                    width: "100%", // Или можно использовать null
                    dropdownAutoWidth: true // Это свойство позволяет раскрывающемуся меню автоматически регулировать ширину
                })

                .on('select2:selecting', function(e) {
                    // Сразу после инициализации Select2 устанавливаем стили
                    $(this).next('.select2-container').find('.select2-selection--multiple').css({
                        'max-height': '50px', // Ограничиваем максимальную высоту
                        'overflow-y': 'auto',  // Добавляем вертикальную прокрутку
                        'overflow-x': 'hidden' // Скрываем горизонтальную прокрутку
                    });
                });

         
                select.on('change', function () {
                    column_active = column_index; // Установка активной колонки
                    const selectedOptions = Array.from(this.options).filter(option => option.selected).map(option => option.value);

                    selected_val_column[column_active] = selectedOptions.join('|'); // Сохраняем выбранные значения для активной колонки


                    // Экранируем специальные символы в выбранных значениях и добавляем регулярные выражения для точного совпадения
                    const searchStr = selectedOptions.map(value => '^' + escapeRegExp(value) + '$').join('|');

                    // Сброс или применение фильтра
                    if (selectedOptions.length) {
                        let searchValues = selectedOptions.join('|'); // Объединяем все выбранные значения для поиска
                        table.column(column_index).search(searchValues, true, false, true).draw();
                    } else {
                        table.column(column_index).search('', true, false, false).draw();
                    }
                
                    // Обновление фильтров для всех столбцов
                    select_filters_cascade(table, selected_val_column, column_active);
                    var tableId = table.table().node().id;
                    localStorage.setItem(window.location.href + '_' + tableId + '_selected_val_column', JSON.stringify(selected_val_column));

                  });
                $('li').addClass('text-dark');
            } else if (column_active === column_index) { 
                var selectElement = table.column(column_active).header().querySelector('select');
                let selectedOptions = Array.from(selectElement.selectedOptions).map(option => option.value);
                if (selectedOptions.length === 0) {
                    const select_set = new Set();
                    const data = table.column(column_index, { search: 'applied' }).data();
                    data.each(function (d) {
                        if (d) {
                            const items = d.replaceAll('\n', '').split(',').map(item => item.trim());
                            items.forEach(item => {
                                // Удаление сообщений с определенным форматом
                                if (item.includes('<span class="not-highspanghted custom-size">')) {
                                    return; // пропускаем такие строки
                                }
                    
                                // Обработка для <select> элемента
                                if (item.includes('<select>')) {
                                    $(item).find('option').each(function () {
                                        select_set.add($(this).val());
                                    });
                                    return;
                                }
                    
                                // Замена символов на HTML символы
                                if (item.includes('-&gt;')) {
                                    item = item.replaceAll('-&gt;', '->');
                                }
                    
                                // Взятие только значения из <a> элемента
                                if (item.includes('<a href=')) {
                                    item = $(item).text();
                                }
                    
                                select_set.add(item);
                            });
                        }
                    });
                    

                    // Очищаем текущие опции из select
                    selectElement.innerHTML = '';
                    
                    const option = document.createElement('option');
                    option.value = 'all';
                    option.textContent = 'Выбрать все'
                    selectElement.appendChild(option);

                    // Добавляем новые опции из select_set
                    select_set.forEach(val => {
                        const option = document.createElement('option');
                        option.value = val;
                        option.textContent = val;
                        selectElement.appendChild(option);
                    });

                    // Восстанавливаем ранее выбранные значения
                    if (selected_val_column[column_index]) {
                        const selectedValues = selected_val_column[column_index].split('|');
                        selectedValues.forEach(value => {
                            const option = selectElement.querySelector(`option[value="${value}"]`);
                            if (option) option.selected = true;
                        });
                    }
                }

    
            }
            

        } else {
            $(this.header());
        }
    });
}




function init_dt_select(table, selected_val_column, column_active) {

    if (table.settings()[0]) {
      
        var tableId = table.table().node().id;

        const storedValue = localStorage.getItem(window.location.href + '_' + tableId + '_selected_val_column');

        if (storedValue) {
            selected_val_column = JSON.parse(storedValue);        
        }

        // После перерисовки таблицы инициализируем select_filters_cascade
        select_filters_cascade(table, selected_val_column, column_active);

        if (storedValue) {
            // Проходим по ключам объекта selected_val_column
            Object.keys(selected_val_column).forEach(column_index => {
                const val = selected_val_column[column_index];
                if (val && val.split('|')[0] !== '') {
                    // Находим соответствующий select-элемент и вызываем событие 'change'
                    const select = $(table.column(column_index).header()).find('select');
                    if (select.length) {
                        select.trigger('change');
                    }
                }
            });
        }

        $('select[multiple]').next('.select2-container').find('.select2-selection--multiple').css({
            'max-height': '50px',    // Ограничиваем максимальную высоту
            'overflow-y': 'auto',     // Добавляем вертикальную прокрутку
            'overflow-x': 'hidden'    // Скрываем горизонтальную прокрутку
        });
    }
}