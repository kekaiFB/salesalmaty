$(document).ready(function () {
    // если на странице один dataTable, даем ему стандартные настройки
    // при создании DataTable на странице, просто задаем класс table_dt и возрадуемся результату)))))
    var dom_modify = 'fltipr'
    if (window.location.href.search('/table_tgo/') >= 0 )
    {  
        dom_modify = 'ltipr'
    }

    if($('.table_dt').length == 1)
    {
        var savedSelected_row;
        var dataTable = $('.table_dt').DataTable({
                "dom": dom_modify,
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

        // перемещаем кнопк, в красивое место где DataTable
        $('#formFilter').hide()
        $('.dataTables_length').text('')
        $('.dataTables_length').append($('#formFilter').html())


        //Сбросить фильтры
        $('.dt_resetFilter').on('click', function (e) {
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
               $(this).find('td span, button').removeClass("text-white");
               $(this).find('td span, button').addClass("text-black");

               $(this).find('td button').removeClass("btn-warning");
               $(this).find('td button').addClass("btn-outline-warning");

               
               $(this).find('td .copyTGO').removeClass("text-white");
               $(this).find('td .copyTGO').addClass("text-black");
           } else {
               //удаляю у не выбранных кнопок класс
               dataTable.$('tr').find('td span, button').removeClass("text-white");
               dataTable.$('tr').find('td span, button').addClass("text-black");
               dataTable.$('tr').find('td .copyTGO').removeClass("text-white");
               dataTable.$('tr').find('td .copyTGO').addClass("text-black");

               
               $(this).find('td .copyTGO').removeClass("text-black");
               $(this).find('td .copyTGO').addClass("text-white");


               dataTable.$('tr').find('td button').removeClass("btn-warning");
               dataTable.$('tr').find('td button').addClass("btn-outline-warning");
   
               $(this).find('td span, button').removeClass("text-black");
               $(this).find('td span, button').addClass("text-white");

               $(this).find('td').removeClass("btn-outline-warning");
               $(this).find('td button').addClass("btn-warning");
           }
       });


        //Выбранная строка при перезугрзке страницы
        if(typeof savedSelected_row !== "undefined" && savedSelected_row.length !== 0){
            dataTable.row(savedSelected_row).select()

            $('.table_dt tbody .selected').find('td .copyTGO').removeClass("text-black");
            $('.table_dt tbody .selected').find('td .copyTGO').addClass("text-white");
            $('.table_dt tbody .selected').find('td span, button').removeClass("text-black");
            $('.table_dt tbody .selected').find('td span, button').addClass("text-white");
            $('.table_dt tbody .selected').find('td').removeClass("btn-outline-warning");
            $('.table_dt tbody .selected').find('td button').addClass("btn-warning");
        } 
        
        //Каскадные фильтры
        var selected_val_column = {}
        var column_active = -1
        init_dt_select(dataTable, selected_val_column, column_active)   

        //клонируем header и вставляем после него
        // $('.table_dt'+' tfoot tr')
        // .clone(true)
        // .addClass('filters')
        // .insertBefore('.table_dt'+' thead tr');
        
        dataTable.$('td.False').each(function () {
            $(this).html("<del>"+ $(this).html() +"</del>");
        });
        // ----------------------------------------------------------------
        
        // Установка минимальной ширины для столбца с индексом 0
        // $('table#table_tgo th:eq(0)').css('min-width', '200px');
        // $('table#table_tgo th:eq(2)').css('min-width', '200px');
        // $('table#table_tgo th:eq(3)').css('min-width', '200px');
        // $('table#table_tgo th:eq(4)').css('min-width', '200px');
        // $('table#table_tgo th:eq(5)').css('min-width', '100px');
        // $('table#table_tgo th:eq(6)').css('min-width', '100px');

    }
    

    if (window.location.href.search('/table_tgo/') >= 0 )
    {        
        // чтоб не надоедало всплывающее окно (повторите отправку формы)
        $(document).bind('keydown keyup', function(e) {
           
            if(e.which === 116) {
                location.reload()
            }
            if(e.which === 82 && e.ctrlKey) {
                location.reload()
            }
        });
    }
});

