
$(document).ready(function () {
    // Заявки по модулям показать\скрыть
    if (window.location.href.search('/profile/') >= 0 || window.location.href.search('/user/') >= 0 ){
        $('.application_span').on('click', function (e) {
            $('.application_content').toggle() 
        });
    }

    // Заявки по модулям показать
    if (window.location.href.search('applications') >= 0 ){
         $('.application_content').show()      
    }

    if($('.table_dt_application').length == 1)
    {
        // $('.table_dt_application thead tr')
        // .clone(true)
        // .addClass('filters-thead')
        // .appendTo('.table_dt_application thead');
        var savedSelected_row;
        var dataTable = $('.table_dt_application').DataTable({
                "dom": 'fltipr',
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

        
        if (window.location.href.search('/profile/') >= 0 ){
            //Каскадные фильтры
            var selected_val_column = {}
            var column_active = -1
            init_dt_select(dataTable, selected_val_column, column_active)   
            //клонируем header и вставляем после него
            // $('.table_dt_application'+'tfoot tr')
            // .clone(true)
            // .addClass('filters')
            // .insertBefore('.table_dt_application'+'thead tr');
        // ----------------------------------------------------------------
        }
    }

});

