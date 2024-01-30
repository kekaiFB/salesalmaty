
if (window.location.href.search('timetable/timetable/') >= 0 || 
    window.location.href.search('timetable/timetable_week/') >= 0 || 
    window.location.href.search('timetable/timetable_week_group') >= 0) {    

    function decodeHtmlEntity(encodedString) {
        var textArea = document.createElement('textarea');
        textArea.innerHTML = encodedString;
        return textArea.value;
    }

    function load_tgo(airlines_arr, vs_arr, type_arr, timetable_ids, callback) {
        $.ajax({     
            url: "/timetable/load_multiple_set_tgo/",                 
            data: {
                'airlines_arr': airlines_arr,   
                'vs_arr': vs_arr,   
                'type_arr': type_arr,   
            },
            success: function (data) {  
                var select = setSelectOption("selectTGO", data.tgo);
                callback(airlines_arr, vs_arr, type_arr, timetable_ids, select);
            },
            error: function () {        
                Toast.setTheme(TOAST_THEME.DARK);
                Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                Toast.create("Ошибка", 'Ошибка на стороне сервера', TOAST_STATUS.ERROR, 3000);
            }
        });
    }

    function set_tgo(timetable_ids, tgo_id) {
        $.ajax({     
            url: "/timetable/setter_multiple_set_tgo/",                 
            data: {
                'timetable_ids': timetable_ids,   
                'tgo_id': tgo_id,     
            },
            success: function () {  
                Toast.setTheme(TOAST_THEME.DARK);
                Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                Toast.create("Успешно", 'ТГО успешно установлены', TOAST_STATUS.success, 3000);
                location.reload()
                },
            error: function () {        
                Toast.setTheme(TOAST_THEME.DARK);
                Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                Toast.create("Ошибка", 'Ошибка на стороне сервера', TOAST_STATUS.ERROR, 3000);
            }
        });
    }

    function createModalWindow(airlines_arr, vs_arr, type_arr, timetable_ids, select) {
        var modalHtml = 
        '<div id="modalWindowTGO" class="modal fade" tabindex="-1" role="dialog">' +
            '<div class="modal-dialog" role="document">' +
                '<div class="modal-content">' +
                    '<div class="modal-header">' +
                        '<h5 class="modal-title">Детали фильтрации</h5>' +
                        '<button type="button" class="close" data-dismiss="modal" aria-label="Закрыть">' +
                            '<span aria-hidden="true">&times;</span>' +
                        '</button>' +
                    '</div>' +
                    '<div class="modal-body">' +
                        '<div class="alert alert-warning" role="alert">' +
                            'ТГО будет назначено всем записям в отфильтрованной таблице.' +
                        '</div>' +
                        '<div class="alert alert-warning" role="alert">' +
                            'Если вы не видите ни одного ТГО в выпадающем списке, значит отсутствует ТГО которое полностью соответствует всем выбранным фильтрам' +
                        '</div>' +
                            '<div class="list-group">' +
                            '<p class="list-group-item">Уникальные значения в столбце <strong>Авиакомпания:</strong> ' + airlines_arr.join(", ") + '</p>' +
                            '<p class="list-group-item">Уникальные значения в столбце <strong>Тип ВС:</strong> ' + vs_arr.join(", ") + '</p>' +
                            '<p class="list-group-item">Уникальные значения в столбце <strong>Тип:</strong> ' + type_arr.join(", ") + '</p>' +
                        '</div>' +
                        select.prop('outerHTML') +
                    '</div>' +
                    '<div class="modal-footer">' +
                        '<button type="button" class="btn btn-secondary" data-dismiss="modal" id="closeButton">Закрыть</button>' +
                        '<button type="button" class="btn btn-primary" id="applyButton">Применить</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    
        // Удаляем предыдущее модальное окно, если оно существует
        $('#modalWindowTGO').remove();
        // Добавляем HTML модального окна в тело документа
        $('body').append(modalHtml);
    
        // Инициализация и показ модального окна
        $('#modalWindowTGO').modal('show');
    
        // Добавление обработчиков событий для кнопок модального окна
        $('#modalWindowTGO').on('click', '.close, #closeButton', function() {
            $('#modalWindowTGO').modal('hide');
        });
        $('#modalWindowTGO').on('click', '#applyButton', function() {
            set_tgo(timetable_ids, $('#selectTGO').val())
        });
    
        // Обновление селектора selectpicker
        $('.selectpicker').selectpicker();
    }
    
    
    
    function setSelectOption(select_id, options) {
        select = $('<select>').attr('id', select_id);
        select.append($('<option>', {
            value: '',
            text: 'ТГО не выбрано......',
            selected: true
        }));
        // Добавьте новые опции на основе полученных данных
        $.each(options, function(index, item) {
            select.append($('<option>', {
                value: item.id,
                text: item.name
            }));
        });
    
        // Добавление классов и атрибутов
        select.addClass('form-control selectpicker mr-2')
              .attr('data-live-search', 'true')
              .attr('data-hide-disabled', 'true')
              .attr('title', 'ТГО...');

        return select;
    }

    function getFilteredUniqueValues(table_dt) {
        var last_column_index = table_dt.columns().count() - 1;
      
        var filteredRows = table_dt.rows({ search: 'applied' }).data();
        
        var timetable_ids = filteredRows
        .column(last_column_index, { search: 'applied' })
        .data()
        .unique()
        .toArray()
        .filter(function(value) {
          return value !== '';
        });
      
      var airlines_arr = filteredRows
        .column(':contains("Авиакомпания")', { search: 'applied' })
        .data()
        .unique()
        .toArray()
        .filter(function(value) {
          return value !== '';
        });
      
      var vs_arr = filteredRows
        .column(':contains("Тип ВС")', { search: 'applied' })
        .data()
        .unique()
        .toArray()
        .filter(function(value) {
          return value !== '';
        });
      
      var type_arr = filteredRows
        .column(':contains("Тип")', { search: 'applied' })
        .data()
        .unique()
        .toArray()
        .filter(function(value) {
          return value !== '';
        });

        type_arr = type_arr.map(elem => decodeHtmlEntity(elem));

        load_tgo(airlines_arr, vs_arr, type_arr, timetable_ids, createModalWindow);
    }
}
