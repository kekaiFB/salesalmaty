$(document).ready(function () {
    if($('.table_dt').length == 1)
    {
        var dom = ($('#dom-settings').val() === 'timetable-list') ? 'tipr' : 'fltipr';

        // $('.table_dt thead tr')
        // .clone(true)
        // .addClass('filters-thead')
        // .appendTo('.table_dt thead');
        var savedSelected_row;
        var dataTable = $('.table_dt').DataTable({
                "dom": dom,
                stateSave: true,
                select: true,
                select: {
                    style: 'single'
                },
                searchPanes: {
                    initCollapsed: true,
                },
                stateSaveParams: function (s, data) {
                    //выбор строки
                    data.selected = this.api().rows({selected:true})[0];
                },
                // выбираем строку при перезагрузке страницы
                initComplete: function () {
                    var state = this.api().state.loaded();
                    if ( state ) {                            
                        savedSelected_row = state.selected;
                    }
               },
        });     
        $('.dataTables_length label').addClass('ml-1')


        dataTable.page.len(5).draw();
        //Сбросить фильтры
        $('#dt_resetFilter').on('click', function (e) {
            
            var tableId = dataTable.table().node().id;
    
            for (var i = localStorage.length - 1; i >= 0; i--) {
                var key = localStorage.key(i);
                var pattern = new RegExp('^' + window.location.href + '_' + tableId + '.*');
                if (pattern.test(key)) {
                    localStorage.removeItem(key);
                }
            }
            
            
            dataTable.state.clear();
            location.reload()
        });

        //Выбор строки при клике 
        $('.table_dt tbody').on('click', 'tr', function () {
           if ($(this).hasClass('selected')) {
               //удаляю у не выбранных кнопок класс
               $(this).find('td span, button, td a').removeClass("text-white");
               $(this).find('td span, button, td a').addClass("text-black");

               $(this).find('td button, td a').removeClass("btn-warning");
               $(this).find('td button, td a').addClass("btn-outline-warning");

               
               $(this).find('td .copyTGO').removeClass("text-white");
               $(this).find('td .copyTGO').addClass("text-black");
           } else {
               //удаляю у не выбранных кнопок класс
               dataTable.$('tr').find('td span, button, td a').removeClass("text-white");
               dataTable.$('tr').find('td span, button, td a').addClass("text-black");
               dataTable.$('tr').find('td .copyTGO').removeClass("text-white");
               dataTable.$('tr').find('td .copyTGO').addClass("text-black");

               
               $(this).find('td .copyTGO').removeClass("text-black");
               $(this).find('td .copyTGO').addClass("text-white");


               dataTable.$('tr').find('td button, td a').removeClass("btn-warning");
               dataTable.$('tr').find('td button, td a').addClass("btn-outline-warning");
   
               $(this).find('td span, button, td a').removeClass("text-black");
               $(this).find('td span, button, td a').addClass("text-white");

               $(this).find('td').removeClass("btn-outline-warning");
               $(this).find('td button, td a').addClass("btn-warning");
           }
       });


        //Выбранная строка при перезугрзке страницы
        if(typeof savedSelected_row !== "undefined" && savedSelected_row.length !== 0){
            dataTable.row(savedSelected_row).select()

            $('.table_dt tbody .selected').find('td .copyTGO').removeClass("text-black");
            $('.table_dt tbody .selected').find('td .copyTGO').addClass("text-white");
            $('.table_dt tbody .selected').find('td span, button, td a').removeClass("text-black");
            $('.table_dt tbody .selected').find('td span, button, td a').addClass("text-white");
            $('.table_dt tbody .selected').find('td').removeClass("btn-outline-warning");
            $('.table_dt tbody .selected').find('td button, td a').addClass("btn-warning");
        } 
        
        //Каскадные фильтры
        var selected_val_column = {}
        var column_active = -1
        init_dt_select(dataTable, selected_val_column, column_active)   

        dataTable.$('td.False').each(function () {
            $(this).html("<del>"+ $(this).html() +"</del>");
        });
        // ----------------------------------------------------------------
    }

    // Если мы на странице с расписаниями
    if ($(".base_airport_div"))
    {
        $('.save_base_airport').hide()
        $('.cancel_base_airport').hide()

        
        function change_base_airport() {
            $('#base_airport').on('input', function() {
                if($('#base_airport').val().length == 3) 
                {
                    const start_word_airport = $('#base_airport').val()
                    get_airport(start_word_airport)
                }
            });
        }
        change_base_airport()
        
    
        function get_airport (start_word_airport) {
            $.ajax({                       
                url: "/timetable/get_airport/",                 
                data: {
                'start_word_airport': start_word_airport,  
                },
                success: function (data) { 
                    if (data.count <1)
                    {
                        Toast.setTheme(TOAST_THEME.DARK);
                        Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                        Toast.create("Успешно", 'Не было подгружено ни одного аэропорта. Пожалуйста нажмите отмена и введите корректные символы', TOAST_STATUS.SUCCESS, 10000);
                    } else {
                        Toast.setTheme(TOAST_THEME.DARK);
                        Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                        Toast.create("Успешно", `Аэропорты подгружены. Количество ${data.count}`, TOAST_STATUS.SUCCESS, 6000);
                    }
                    let select = $('<select id="select_base_airport">');
                    
                    for (let airport of data.queryset) {
                        select.append($('<option>')
                                        .attr('value', airport.id)
                                        .text(airport.name)
                                    );
                    }
                    $('.span_base_airport').html(select);
                    $('#select_base_airport').attr('data-live-search', 'true');
                    $('#select_base_airport').attr('data-hide-disabled', 'true');
                    $('#select_base_airport').attr('title', 'Выберите аэропорт');
                    $('#select_base_airport').selectpicker({ 
                        noneResultsText:'   Результатов нет',
                    });

                    $('.save_base_airport').show()
                    $('.cancel_base_airport').show()
                },
                error: function () {
                    
                    Toast.setTheme(TOAST_THEME.DARK);
                    Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                    Toast.create("Ошибка", 'Аэропорты не подгружены', TOAST_STATUS.ERROR, 3000);
                }
            });
        }

    // Отмена сохранения базового аэропорта
    $('.cancel_base_airport').on('click', function() {
            $('.save_base_airport').hide()
            $('.cancel_base_airport').hide()
            $('.span_base_airport').html('<input type="text" id="base_airport" maxlength="3" placeholder="первые буквы города"/>');

            // навешиваем событие change
            change_base_airport()
        });

        //  Сохранить базовый аэропорт
        $('.save_base_airport').on('click', function() {
            if($('#select_base_airport').val()!='')
            {
                $('.save_base_airport').hide()
                $('.cancel_base_airport').hide()
                
                $.ajax({                       
                    url: "/timetable/set_base_airport/",                 
                    data: {
                    'id_base_airport': $('#select_base_airport').val(),  
                    },
                    success: function () { 
                        location.reload()
                        Toast.setTheme(TOAST_THEME.DARK);
                        Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                        Toast.create("Успешно", 'Базовый аэропорт установлен', TOAST_STATUS.SUCCESS, 3000);
                    },
                    error: function () {
                        Toast.setTheme(TOAST_THEME.DARK);
                        Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                        Toast.create("Ошибка", 'Ошибка на стороне сервера', TOAST_STATUS.ERROR, 3000);
                    }
                });

            }  else {
                Toast.setTheme(TOAST_THEME.DARK);
                Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                Toast.create("Ой", 'Вы не выбрали аэропорт)', TOAST_STATUS.WARNING, 3000);
            }         
        });

        function delete_base_airport() {
            $.ajax({                       
                url: "/timetable/delete_base_airport/",                 
                data: {
                'id_base_airport': $('#id_base_airport').val(),  
                },
                success: function () {                 
                    $('.save_base_airport').hide()
                    $('.cancel_base_airport').hide()
                    $('.span_base_airport').html('<input type="text" id="base_airport" maxlength="3" placeholder="первые буквы города"/>');

                    // навешиваем событие change
                    change_base_airport()

                    Toast.setTheme(TOAST_THEME.DARK);
                    Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                    Toast.create("Успешно", 'Базовый аэропорт удален', TOAST_STATUS.SUCCESS, 3000);
                },
                error: function () {
                    Toast.setTheme(TOAST_THEME.DARK);
                    Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                    Toast.create("Ошибка", 'Ошибка на стороне сервера', TOAST_STATUS.ERROR, 3000);
                }
            });
        }
        
    // Удаление базового аэропорта
    $('.delete_base_airport').on('click', function() {
            delete_base_airport()
        });

        $('.delete_base_airport').hide()
        $('.base_airport_div').on('mouseenter', function() {
            $('.delete_base_airport').show();
        });
        
        $('.base_airport_div').on('mouseleave', function() {
            $('.delete_base_airport').hide();
        });
    }  


    
    function edit_default_timetable(id, callback) {
        $.ajax({                       
            url: "/timetable/set_default_timetable/",                 
            data: {
                'timetable_id': id,  
            },
            success: function (data) {                 
                Toast.setTheme(TOAST_THEME.DARK);
                Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                Toast.create(data.status, data.text, TOAST_STATUS.SUCCESS, 3000);
    
                if (data.status === "Ошибка") {
                    callback(false);
                } else {
                    callback(false);

                    if (data.reload == 'true')
                    {
                        callback(true);
                       location.reload() 
                    }
                }
            },
            error: function () {
                Toast.setTheme(TOAST_THEME.DARK);
                Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                Toast.create("Ошибка", 'Ошибка на стороне сервера', TOAST_STATUS.ERROR, 3000);
                callback(false);
            }
        });
    }

    
    $('.is_default_timetable_checkbox').click(function() {
        var checkbox = $(this);
        var id = checkbox.data('id');
        edit_default_timetable(id, function(status) {
            checkbox.prop('checked', status);
        });
    });

});

