$(document).ready(function () {
        // $('#office_dt thead tr')
        // .clone(true)
        // .addClass('filters-office_dt')
        // .appendTo('#office_dt thead');
        var savedSelected_office;
        var office_dt = $('#office_dt').DataTable({
                "dom": 'tipr',
                //--------------------Память фильторв---------------------------
                stateSave: true,
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
        
                initComplete: function () {
                    var api = this.api();
                    var state = api.state.loaded();
                    if ( state ) {
                            api.columns().eq( 0 ).each( function ( colIdx ) {
                            var colSearch = state.columns[colIdx].search;
                            var res = ''
                        if ( colSearch.search ) {
                            res = colSearch.search.replace('))))','')
                            res = res.replace('((((','')
                            $('select', $('.filters-office_dt th')).val( res );
                        }
                        savedSelected_office = state.selected;
                        });
                    }
                    
                },
                
        });

        // $('#post_dt thead tr')
        // .clone(true)
        // .addClass('filters-post_dt')
        // .appendTo('#post_dt thead');
        
        var savedSelected_post;
        var post_dt = $('#post_dt').DataTable({
                "dom": 'tipr',
                //--------------------Память фильторв---------------------------
                
                rowId: 'id',
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
        
                initComplete: function () {
                    var api = this.api();
                    var state = api.state.loaded();
                    if ( state ) {
                        
                            api.columns().eq( 0 ).each( function ( colIdx ) {
                            var colSearch = state.columns[colIdx].search;
                            var res = ''
                        if ( colSearch.search ) {
                            res = colSearch.search.replace('))))','')
                            res = res.replace('((((','')
                            $('select', $('.filters-post_dt th')[colIdx-1]).val( res );
                        }
                        savedSelected_post = state.selected;
                        });
                    }
                    
                },
                
            }); 

        


        // $('#boss_dt thead tr')
        // .clone(true)
        // .addClass('filters-boss_dt')
        // .appendTo('#boss_dt thead');
        var savedSelected_boss;
        var boss_dt = $('#boss_dt').DataTable({
                "dom": 'tipr',
                //--------------------Память фильторв---------------------------
                stateSave: true,
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
        
                initComplete: function () {
                
                    var api = this.api();
            
                    var state = api.state.loaded();
                    if ( state ) {
                            api.columns().eq( 0 ).each( function ( colIdx ) {
                            var colSearch = state.columns[colIdx].search;
                            var res = ''
                        if ( colSearch.search ) {
                            res = colSearch.search.replace('))))','')
                            res = res.replace('((((','')
                            $('select', $('.filters-boss_dt th')[colIdx]).val( res );
                        }
                        savedSelected_boss = state.selected;
                        });
                    }
                    
                },
                
        });



        // $('#human_dt thead tr')
        // .clone(true)
        // .addClass('filters-human_dt')
        // .appendTo('#human_dt thead');
        var savedSelected_human;
        var human_dt = $('#human_dt').DataTable({
                "dom": 'tipr',
                //--------------------Память фильторв---------------------------
                stateSave: true,
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
        
                initComplete: function () {
                    var api = this.api();
                    var state = api.state.loaded();
                    if ( state ) {
                            api.columns().eq( 0 ).each( function ( colIdx ) {
                            var colSearch = state.columns[colIdx].search;
                            var res = ''
                        if ( colSearch.search ) {
                            res = colSearch.search.replace('))))','')
                            res = res.replace('((((','')
                            $('select', $('.filters-human_dt th')[colIdx]).val( res );
                        }
                        savedSelected_human = state.selected;
                        });
                    }
                },  
        });

        function clearLocalStorageForTableId(tableId) {
            for (var i = localStorage.length - 1; i >= 0; i--) {
                var key = localStorage.key(i);
                var pattern = new RegExp('^' + window.location.href + '_' + tableId + '.*');
                if (pattern.test(key)) {
                    localStorage.removeItem(key);
                }
            }
        }


        //Сбросить фильтры
        $('#office_dt-resetFilter').on('click', function (e) {
            var tables = [office_dt, post_dt, human_dt, boss_dt];
            tables.forEach(function(dt) {
                var tableId = dt.table().node().id;
                clearLocalStorageForTableId(tableId);
                dt.state.clear();
            });

            location.reload();
        });


        //Количество строк
        office_dt.page.len(5).draw();
        post_dt.page.len(5).draw();
        boss_dt.page.len(5).draw();
        human_dt.page.len(10).draw();

        //скрываем id
        office_dt.column( 0 ).visible( false );
        post_dt.column( 0 ).visible( false );
        post_dt.column( 2 ).visible( false );

        //Выбранная строка при перезугрзке страницы
        if(typeof savedSelected_office !== "undefined" && savedSelected_office.length !== 0){
            office_dt.row(savedSelected_office).select()
            office_dt.$('tr.selected').find('td span').removeClass("text-primary");
            $('.add_post').css('visibility', 'visible')
        }
        if(typeof savedSelected_post !== "undefined" && savedSelected_post.length !== 0){
            post_dt.row(savedSelected_post).select()
            post_dt.$('tr.selected').find('td span').removeClass("text-primary");
            $('.add_human').css('visibility', 'visible')
        }
        if(typeof savedSelected_human !== "undefined" && savedSelected_human.length !== 0){
            human_dt.row(savedSelected_human).select()
            human_dt.$('tr.selected').find('td a').addClass("text-white");
        }
        if(typeof savedSelected_boss !== "undefined" && savedSelected_boss.length !== 0){
            boss_dt.row(savedSelected_boss).select()
            boss_dt.$('tr.selected').find('td a').addClass("text-white");
        }


        //Выбор строки при клике ПОДРАЗДЕЛЕНИЯ
        $('#office_dt tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
                    
                //Заполняем select для должностей
                $('select', $('.filters-post_dt th')[0]).val('').change()
                $('select', $('.filters-human_dt th')[1]).val('').change()
                $('select', $('.filters-human_dt th')[2]).val('').change()

                //Настраиваем кнопку добавить должности
                $('.add_post').css('visibility', 'hidden')
                
                //удаляю у не выбранных кнопок класс
                $(this).find('td span').removeClass("text-white");
                $(this).find('td span').addClass("text-primary");
            } else {
                $(this, $('td')).addClass('selected');

                //Заполняем select для должностей
                $('select', $('.filters-post_dt th')[0]).val(office_dt.row( this ).data()[1]).change()
                $('select', $('.filters-human_dt th')[1]).val(office_dt.row( this ).data()[1]).change()
                $('select', $('.filters-human_dt th')[2]).val('').change()

                //Настраиваем кнопку добавить должности
                $('.add_post').css('visibility', 'visible')

                //удаляю у не выбранных кнопок класс
                office_dt.$('tr').find('td span').removeClass("text-white");
                office_dt.$('tr').find('td span').addClass("text-primary");
                
                $(this).find('td span').removeClass("text-primary");
                $(this).find('td span').addClass("text-white");
            }
        });

        //Выбор строки при клике ДОЛЖНОСТИ
        $('#post_dt tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {

                //Настраиваем кнопку добавить сотрудника
                $('.add_human').css('visibility', 'hidden')
                    
                //Заполняем select для начальников
                $('select', $('.filters-boss_dt th')[1]).val('').change()
                    
                //Заполняем select для сотрудников
                $('select', $('.filters-human_dt th')[1]).val('').change()

                $('select', $('.filters-human_dt th')[2]).val('').change()
                
                //удаляю у не выбранных кнопок класс
                $(this).find('td span').removeClass("text-white");
                $(this).find('td span').addClass("text-primary");
            } else {
                $(this, $('td')).addClass('selected');
        
                //Настраиваем кнопку добавить должности
                $('.add_human').css('visibility', 'visible')

                //Заполняем select для начальников
                $('select', $('.filters-boss_dt th')[1]).val(post_dt.row( this ).data()[1]).change()

                //Заполняем select для сотрудников
                $('select', $('.filters-human_dt th')[1]).val(post_dt.row( this ).data()[1]).change()
                
                $('select', $('.filters-human_dt th')[2]).val(post_dt.row( this ).data()[3]).change()


                //удаляю у не выбранных кнопок класс
                post_dt.$('tr').find('td span').removeClass("text-white");
                post_dt.$('tr').find('td span').addClass("text-primary");


                $(this).find('td span').removeClass("text-primary");
                $(this).find('td span').addClass("text-white");
            }
        });



        //Выбор строки при клике СОТРУДНИКИ
        $('#human_dt tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
                    
                //удаляю у не выбранных кнопок класс
                $(this).find('td a').removeClass("text-white");
                $(this).find('td a').addClass("text-black");
            } else {
                //удаляю у не выбранных кнопок класс
                human_dt.$('tr').find('td a').removeClass("text-white");
                human_dt.$('tr').find('td a').addClass("text-black");


                $(this).find('td a').removeClass("text-black");
                $(this).find('td a').addClass("text-white");
            }
        });


        //Выбор строки при клике СОТРУДНИКИ
        $('#boss_dt tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
                    
                //удаляю у не выбранных кнопок класс
                $(this).find('td a').removeClass("text-white");
                $(this).find('td a').addClass("text-black");
            } else {
                //удаляю у не выбранных кнопок класс
                boss_dt.$('tr').find('td a').removeClass("text-white");
                boss_dt.$('tr').find('td a').addClass("text-black");


                $(this).find('td a').removeClass("text-black");
                $(this).find('td a').addClass("text-white");
            }
        });


        
        // $('#user_history_dt thead tr')
        // .clone(true)
        // .addClass('filters-user_history_dt')
        // .appendTo('#user_history_dt thead');
        var savedSelected_user;
        var user_history_dt = $('#user_history_dt').DataTable({
                "dom": 'tipr',
                //--------------------Память фильторв---------------------------
                stateSave: true,
                select: {
                    style: 'single'
                },
                searchPanes: {
                initCollapsed: true,
                },
                "iDisplayLength": -1,  

                order: [[0, 'asc']],
                stateSaveParams: function (s, data) {
                    //выбор строки
                    data.selected = this.api().rows({selected:true})[0];
                },
        
                initComplete: function () {
                
                    var api = this.api();
            
                    var state = api.state.loaded();
                    if ( state ) {
                            api.columns().eq( 0 ).each( function ( colIdx ) {
                            var colSearch = state.columns[colIdx].search;
                            var res = ''
                        if ( colSearch.search ) {
                            res = colSearch.search.replace('))))','')
                            res = res.replace('((((','')
                            $('select', $('.filters-user_history_dt th')[colIdx]).val( res );
                        }
                        savedSelected_user = state.selected;
                        });
                    }
                    
                },
                
        });

        //Выбранная строка при перезугрзке страницы
        if(typeof savedSelected_user !== "undefined" && savedSelected_user.length !== 0){
            user_history_dt.row(savedSelected_user).select()
            user_history_dt.$('tr.selected').find('td span').removeClass("text-primary");
            user_history_dt.$('tr.selected').find('td span').removeClass("text-white");
        }



        // $('#user_post_dt thead tr')
        // .clone(true)
        // .addClass('filters-user_post_dt')
        // .appendTo('#user_post_dt thead');
        var savedSelected_user_post_dt;
        var groupColumn = 0;

        var user_post_dt = $('#user_post_dt').DataTable({
                "dom": 'tipr',
                //--------------------Память фильторв---------------------------
                stateSave: true,
                order: [[groupColumn, 'asc']],
                select: {
                    style: 'single'
                },
                searchPanes: {
                initCollapsed: true,
                },
                "iDisplayLength": -1,  

                order: [[0, 'desc']],
                stateSaveParams: function (s, data) {
                    //выбор строки
                    data.selected = this.api().rows({selected:true})[0];
                },
        
                drawCallback: function (settings) {
                    var api = this.api();
                    var rows = api.rows({ page: 'current' }).nodes();
                    var last = null;
        
                    api
                        .column(groupColumn, { page: 'current' })
                        .data()
                        .each(function (group, i) {
                            if (last !== group) {
                                $(rows)
                                    .eq(i)
                                    .before('<tr class="group alert-secondary p-2"><td colspan="20" class="h4 text-primary">' + group.substring(0) + '</td></tr>');
                                    last = group;
                            }
                        });
                },

                initComplete: function () {
                
                    var api = this.api();
            
                    var state = api.state.loaded();
                    if ( state ) {
                            api.columns().eq( 0 ).each( function ( colIdx ) {
                            var colSearch = state.columns[colIdx].search;
                            var res = ''
                        if ( colSearch.search ) {
                            res = colSearch.search.replace('))))','')
                            res = res.replace('((((','')
                            $('select', $('.filters-user_post_dt th')).val( res );
                        }
                        savedSelected_user_post_dt = state.selected;
                        });
                    }
                },
                
        });


        user_post_dt.column( 0 ).visible( false );

        $('#user_post_dt tbody').on('click', 'tr.group', function () {
            var currentOrder = user_post_dt.order()[0];
            if (currentOrder[0] === groupColumn && currentOrder[1] === 'asc') {
                user_post_dt.order([groupColumn, 'desc']).draw();
            } else {
                user_post_dt.order([groupColumn, 'asc']).draw();
            }
        });


        //Выбранная строка при перезугрзке страницы
        if(typeof savedSelected_user_post_dt !== "undefined" && savedSelected_user_post_dt.length !== 0){
            user_post_dt.row(savedSelected_user_post_dt).select()
            user_post_dt.$('tr.selected').find('td span').removeClass("text-primary");
            user_post_dt.$('tr.selected').find('td span').removeClass("text-white");
            
            user_post_dt.$('tr.selected').find('td span').removeClass("text-danger");
            user_post_dt.$('tr.selected').find('td span').addClass("text-white");
        }


        
        //Выбор строки при клике подразделения пользователя
        $('#user_post_dt tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
                    
                //удаляю у не выбранных кнопок класс
                $(this).find('td a').removeClass("text-white"); 
                $(this).find('td a').addClass("text-black");
                

                $(this).find('td span').removeClass("text-white");
                $(this).find('td span').addClass("text-danger");
            } else {
                //удаляю у не выбранных кнопок класс
                user_post_dt.$('tr').find('td a').removeClass("text-white");
                user_post_dt.$('tr').find('td a').addClass("text-black");

                
                user_post_dt.$('tr').find('td span').removeClass("text-white");
                user_post_dt.$('tr').find('td span').addClass("text-danger");

                
                $(this).find('td a').removeClass("text-black");
                $(this).find('td a').addClass("text-white");

                
                $(this).find('td span').removeClass("text-black");
                $(this).find('td span').addClass("text-white");
            }
        });



        //Сбросить фильтры
        $('#user_history_dt-resetFilter').on('click', function (e) {
            user_history_dt.state.clear();
            user_post_dt.state.clear();
            location.reload()
        });

        
        user_history_dt.page.len(5).draw();
        user_post_dt.page.len(5).draw();

  


        // Фильтры select_dropdown, с сохранением состояния
        var selected = []
        var select_set = new Set()

        var selected_val_column_office_dt = {}
        var column_active_office_dt = -1

        var selected_val_column_post_dt = {}
        var column_active_post_dt = -1
        
        var selected_val_column_human_dt = {}
        var column_active_human_dt = -1
        
        var selected_val_column_boss_dt = {}
        var column_active_boss_dt = -1
        
        var selected_val_column_user_history_dt = {}
        var column_active_user_history_dt = -1

        var selected_val_column_user_post_dt = {}
        var column_active_user_post_dt = -1


        init_dt_select(office_dt, selected_val_column_office_dt, column_active_office_dt)
        init_dt_select(post_dt,  selected_val_column_post_dt, column_active_post_dt)
        init_dt_select(human_dt,  selected_val_column_human_dt, column_active_human_dt)
        init_dt_select(boss_dt, selected_val_column_boss_dt, column_active_boss_dt)
        init_dt_select(user_history_dt, selected_val_column_user_history_dt, column_active_user_history_dt)
        init_dt_select(user_post_dt, selected_val_column_user_post_dt, column_active_user_post_dt)

        boss_dt.$('td.False').each(function () {
            $(this).html("<del>"+ $(this).html() +"</del>");
        });
        human_dt.$('td.False').each(function () {
            $(this).html("<del>"+ $(this).html() +"</del>");
        });
});
