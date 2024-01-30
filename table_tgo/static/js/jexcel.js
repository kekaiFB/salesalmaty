$(document).ready(function () {
    // Функция для преобразования даты


    // Словарь месяцев с заглавной буквы
    const monthNames_excel_tgo = {
        '01': 'Январь',
        '02': 'Февраль',
        '03': 'Март',
        '04': 'Апрель',
        '05': 'Май',
        '06': 'Июнь',
        '07': 'Июль',
        '08': 'Август',
        '09': 'Сентябрь',
        '10': 'Октябрь',
        '11': 'Ноябрь',
        '12': 'Декабрь'
    };

    // Convert RGB values to hexadecimal format
    function componentToHex(c) {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }

    function formatDate_excel_tgo(inputDate) {
        const parts = inputDate.split('-');
        const day = parts[0];
        const month = parts[1];
        const year = parts[2]; // Получаем последние две цифры года
    
        // Получаем текстовое значение месяца из словаря
        const monthName = monthNames_excel_tgo[month];
    
        if (!monthName) {
        // Если месяц не найден в словаре, вернем исходную дату
        return inputDate;
        }
    
        // Формируем строку в нужном формате
        return `"${day}" ${monthName} ${year} г.`;
    }

    if (window.location.href.search('/tgo/') >= 0 || window.location.href.search('create_tgo_object/') >= 0)
    {
        $("body").css("opacity", 0);

        //Берем нашу HTML таблицу и конвертируем в 2d массив    
        var myTableArray = [];
        $("table#current_tgo tr").each(function() {
            var rowDataArray = [];
            var actualData = $(this).find('td');
            if (actualData.length > 0) {
                actualData.each(function() {
                    rowDataArray.push($(this).html());
                });
                myTableArray.push(rowDataArray);
            }
        });
        var this_version = true
        var status_graphic = 0
        var cell_pos, link_pos = 0;
        var value = []
        var new_cellName = '';
        var time_start_cellName_arr = [];
        var endRow = -1;
        var start_row = -1;
        var rowOp = []
        var valueEndRow = 0
        var valueStartRow = 0
        var loaded = function(instance) {//при изменении таблицы
            updateMyTable()
            if (focused_row_status == 0 && this_version)
            {
                saveTime_Row(myTableTGO.getRowData([focused_row]), parseInt(parseInt(focused_row)+1))
            }
            check_new_technology()
        }

        var options = {
            data: myTableArray,
            rowResize: true,
            columns: [
                { type:'text', width: 80, readOnly:true,},
                { type:'text', width: 300, readOnly:true, align: 'left'},
                { type:'html', width: 150, readOnly:true, align: 'left'},
                { type:'text', width: 100, readOnly:true,},
                { type:'text', width: 100, align: 'left'},
                { type:'text', width: 80, mask:'0:00'},
                { type:'text', width: 100, mask:'0:00'},
                { type:'text', width: 140, mask:'0:00'},
                { type:'text', width: 150, readOnly:true, align: 'left'},
        
                { type:'text', width: 100, readOnly:true,},
                { type:'text', width: 100, readOnly:true,},
                { type:'text', width: 100, readOnly:true,},
                { type:'html', width: 100, readOnly:true, align: 'left'},
                { type:'html', width: 100, readOnly:true, align: 'left'},
                { type:'html', width: 100, readOnly:true, align: 'left'},
            ],
        
            nestedHeaders:[
                [
                    {
                        title: 'Пункт',
                        colspan: '1',
                    },
                    {
                        title: 'Операция',
                        colspan: '1',
                    },
                    {
                        title: 'Ресурс',
                        colspan: '1',
                    },
                    {
                        title: 'Количество',
                        colspan: '1',
                    },
                    {
                        title: 'Примечание',
                        colspan: '1',
                    },
                    {
                        title: 'Начало',
                        colspan: '1',
                    },
                    {
                        title: 'Окончание',
                        colspan: '1',
                    },
                    {
                        title: 'Продолжительность',
                        colspan: '1',
                    },
                    {
                        title: 'Подразделения',
                        colspan: '1',
                    },
                    {
                        title: 'Изменить',
                        colspan: '1',
                    },
                    {
                        title: 'Удалить',
                        colspan: '1',
                    },
                    {
                        title: 'Технология',
                        colspan: '1',
                    },
                ],
            ],
        
        
            toolbar:[
                {
                    type: 'i',
                    tooltip: 'На главную',
                    content: 'arrow_back',
                    onclick: function () {
                        goUrlIndex()
                    }
                },
                {
                    type: 'i',
                    tooltip: 'Добавить операцию',
                    content: 'add_box',
                    onclick: function () {
                        status_graphic = 0
                        addOperation()
                    }
                },
                {
                    type: 'i',
                    tooltip: 'Добавить технологию',
                    content: 'queue',
                    onclick: function () {
                        status_graphic = 0
                        addTechnology()
                    }
                },
                {
                    type: 'i',
                    tooltip: 'Назад',
                    content: 'undo',
                    onclick: function() {
                        myTableTGO.undo();
                        saveTime()
                    }
                },
                {
                    type: 'i',
                    tooltip: 'Вперед',
                    content: 'redo',
                    onclick: function() {
                        myTableTGO.redo();
                        saveTime()
                    }
                },
                {
                    type: 'i',
                    tooltip: 'Сохранить время',
                    content: 'save',
                    onclick: function () {
                        status_graphic = 1
                        saveTime()
                    }
                },
                // {
                //     type: 'i',
                //     tooltip: 'Сохранить в PDF',
                //     content: 'picture_as_pdf',
                //     onclick: function () {
                //         picture_as_pdf()
                //     }
                // },
                {
                    type: 'i',
                    tooltip: 'Сохранить в Excel',
                    content: 'feed',
                    onclick: function () {
                        convert_to_excel()
                    }
                },
                // {
                //     type: 'i',
                //     tooltip: 'Выровнять пункты',
                //     content: 'keyboard_double_arrow_down',
                //     onclick: function () {
                //         keyboard_double_arrow_down()
                //     }
                // },
            ],
        
        
            updateTable:function(instance, cell, col, row, val, label, cellName) {
                cell.style.color = 'black'
                cell.style.border = '1px solid white'
                //выделяем операции особым цветом
                if (col == 1) {
                    if( cell.innerText != '' && cell.innerText != 'Окончание')
                    {
                        rowOp.push(row)
                        cell.style.backgroundColor = '#edf3ff';
                    }
                    else if( cell.innerText != '' && cell.innerText != 'Начало')
                    {
                        rowOp.push(row)
                        cell.style.backgroundColor = '#8dafe3';
                    }
                    else if( cell.innerText != '' && cell.innerText != 'Начало после подготовительных')
                    {
                        rowOp.push(row)
                        cell.style.backgroundColor = '#8dafe3';
                    }
                }
        
                //Окончание ТГО
                if (col == 1) {
                    if( cell.innerText.search("Окончание") == 0)
                    {
                        endRow = row
                    }
                    else if( cell.innerText.search("Начало") == 0)
                    {
                        start_row = row
                    }
                    else if( cell.innerText.search("Начало после подготовительных") == 0)
                    {
                        start_row = row
                    }
                }
                
                if (row == endRow) {
                    if (col == 6) {
                        valueEndRow = label
                    }
                }
                else if (row == start_row) {
                    if (col == 6) {
                        valueStartRow = label
                    }
                }

                //выделяем подразделения для операций особым цветом
                if (rowOp.indexOf(row) != -1) {
                    if (col == 8) {
                        cell.style.backgroundColor = '#edf3ff';
                    }
                }
        
                //выделяем окончание особым цветом
                if (label == 'Окончание') {
                    cell.style.backgroundColor = '#f46e42';
                    cell.style.color = '#ffffff';
                } else if (label == 'Начало') {
                    cell.style.backgroundColor = '#f46e42';
                    cell.style.color = '#ffffff';
                } else if (label == 'Начало после подготовительных') {
                    cell.style.backgroundColor = '#f46e42';
                    cell.style.color = '#ffffff';
                }
        
                


                //выделяем колонки со временем особым цветом
                if(col == 5 || col == 6 || col == 7){
                    cell.style.backgroundColor = '#FFFFE0'
                    
                    //если время является формулой
                    if (val[0] == '=')
                    {
                        //те что не являются формулой все будут белым цветом
                        cell.style.backgroundColor = '#FFFFFF'

                        //колонки которые ссылаются на будущие строки
                        value = val.replaceAll('=', '+').split('+')
                        value.shift()
                        
                        for (var i=0; i<value.length; i++)
                        {   
                            cell_pos = parseInt(cellName.replace(/[^.\d]/g, ''))
                            link_pos = parseInt(value[i].replace(/[^.\d]/g, ''))
                            var flag_pos = 0
                            var valuee = value[i].replaceAll(/[+-/*=()]/g, ' ').split(' ') 
                            
                            
                            for (var h=0; h<valuee.length; h++)
                            { 
                                if (!isNaN(parseInt(valuee[h])))
                                {
                                    valuee[h] = ''
                                }
                                else
                                {
                                valuee[h] = parseInt(valuee[h].replace(/[^.\d]/g, '')) 

                                if (valuee[h] > cell_pos)
                                {
                                    flag_pos = 1
                                }
                                }
                            }
                            if (flag_pos > 0 &&
                                $.inArray(parseInt(cellName.substr(1)), valuee) == -1)
                            {
                                cell.style.backgroundColor = '#D8BFD8'
                            }
                        }
                    }  
                }

                //массив для разделения операций и ресурсов
                if(col == 6 ){
                    new_cellName = 'D' + cellName.substr(1);
                    time_start_cellName_arr.push(new_cellName)  
                }
            
            },    
            onafterchanges: loaded,
            columnSorting: false,
            autoIncrement: true,
            license: 'NTg4NGU4ZGVjYjk2ODNlZGM2YzM4OWM1NWJjM2Y4NmYzZGMxODU2NDYwOGRkNDg2NzM4MWU2YmNkZWRlN2UyMjAxMTcyYjIxNDkyNGM2NjdlNzg1Y2QwY2I0ZWIzZmQ0YTRiMzI1OTU4OTkzMWMwYzNjMzA4MWY4ODAzYjEwMWMsZXlKdVlXMWxJam9pU25Od2NtVmhaSE5vWldWMElpd2laR0YwWlNJNk1UWTRNVEkxT1RZMU55d2laRzl0WVdsdUlqcGJJbXB6Y0hKbFlXUnphR1ZsZEM1amIyMGlMQ0pqYjJSbGMyRnVaR0p2ZUM1cGJ5SXNJbXB6YUdWc2JDNXVaWFFpTENKamMySXVZWEJ3SWl3aWJHOWpZV3hvYjNOMElsMHNJbkJzWVc0aU9pSXpJaXdpYzJOdmNHVWlPbHNpZGpjaUxDSjJPQ0lzSW5ZNUlpd2lZMmhoY25Seklpd2labTl5YlhNaUxDSm1iM0p0ZFd4aElpd2ljR0Z5YzJWeUlpd2ljbVZ1WkdWeUlpd2lZMjl0YldWdWRITWlMQ0pwYlhCdmNuUWlMQ0ppWVhJaUxDSjJZV3hwWkdGMGFXOXVjeUlzSW5ObFlYSmphQ0pkTENKa1pXMXZJanAwY25WbGZRPT0=',
        }
        
        myTableTGO = jspreadsheet(document.getElementById('spreadsheet'), options);
        
        //скрываем по умолчанию столбцы с TableName и ID
        myTableTGO.hideColumn(11);
        myTableTGO.hideColumn(10);
        myTableTGO.hideColumn(9);
  
        for (var i = 0; i < myTableTGO.getColumnData([0]).length; i++) { 
            myTableTGO.setHeight(i, 10)
        }

        dict_child = {
            1: 'F',
            2: 'G',
            3: 'H',
        }

        coords = {
            '5': 'F',
            '6': 'G',
            '7': 'H',
        }

        var index_parent_row = -1
        var all_index_parent_row = []
        var all_cells_in_cell = ''
        
        function updateMyTable() {

            for (var i = 0; i < myTableTGO.getColumnData([0]).length; i++) {

                //ячейки со временем, которые являются родителями 
                res = myTableTGO.getValue(time_start_cellName_arr[i]);
            
                if (res == '')
                {
                    //запоминаем текущего родителя
                    index_parent_row = i + 1
                    
                    //запоминаем всех родителей
                    all_index_parent_row.push(
                        coords[5] + index_parent_row, 
                        coords[6] + index_parent_row, 
                        coords[7] + index_parent_row
                    )

                    for (var cell = 5; cell <= 7; cell++) {
                        //если время является формулой
                        if (myTableTGO.getRowData([i])[cell][0] == '=')
                        {
                            all_cells_in_cell = myTableTGO.getRowData([i])[cell]
                            .replaceAll(/[+-/*=()]/g, ' ')
                            .split(' ')  
                            
                            //синим цветом
                            for (var v = 0; v <= all_cells_in_cell.length; v++) {
                                //ячейка ссылается на родительскую
                                if ($.inArray(all_cells_in_cell[v], all_index_parent_row) != -1)
                                {
                                    if (i+1 != parseInt(all_cells_in_cell[v].substring(1, all_cells_in_cell[v].length))) {
                                        var this_cell_child = coords[cell] + parseInt(i+1);
                                        myTableTGO.getCell(this_cell_child).style["backgroundColor"] = '#E0FFFF'
                                    }
                                }
                            }
                    
                        }  
                        
                        if (myTableTGO.getRowData([i])[cell][0] == '=')
                        {  
                            all_cells_in_cell = myTableTGO.getRowData([i])[cell]
                                                .replaceAll(/[+-/*=()]/g, ' ')
                                                .split(' ')  
                            var this_parent = coords[cell] + index_parent_row 

                            //ячейка ссылается на родительскую
                            if ($.inArray(this_parent, all_cells_in_cell) != -1)
                            {
                                var this_cell_child = coords[cell] + parseInt(i+1);
                                childColor(myTableTGO, this_cell_child)
                            }
                            
                        }    
                    }


                    
                } else //дочерние ячейки
                {
                    for (var cell = 5; cell <= 7; cell++) {
                        //если время является формулой
                        if (myTableTGO.getRowData([i])[cell][0] == '=')
                        {  
                            all_cells_in_cell = myTableTGO.getRowData([i])[cell]
                                                .replaceAll(/[+-/*=()]/g, ' ')
                                                .split(' ')  
                            var this_parent = coords[cell] + index_parent_row 

                            //ячейка ссылается на родительскую
                            if ($.inArray(this_parent, all_cells_in_cell) != -1)
                            {
                                var this_cell_child = coords[cell] + parseInt(i+1);
                                childColor(myTableTGO, this_cell_child)
                            }
                            
                        }    
                    }
                }
            }
            if (status_graphic == 1) //если не происходит редактирование обьектов в модальных окнах
            {
                draw_tgo_table(myTableTGO)
            }
        }

        function childColor(table, child){
            // if (table.getCell(child).style["backgroundColor"] != 'rgb(216, 191, 216)')
            table.getCell(child).style["backgroundColor"] = '#91DFAB'
        }

        updateMyTable()

        var focused_row_status = 1

        //Сохраняем время в БД
        saveTime = function (reload=false, save_version=0, replace_current_version=false) {
            if ($(".requestUser").val() == $( "input[name='author']" ).val())
            {
                var tgo_ogject_update = []; 
                var update_tgoObj_arr = [];
                var update_res_arr = [];
                var res = [];
                
                for (var i = 0; i < myTableTGO.getColumnData([0]).length; i++) { 
                    res = myTableTGO.getRowData([i]);
                    if (typeof res !== 'undefined')
                    {
                        if (!isNaN(parseInt(res[9])))
                        {
                            var l = i+1
                            tgo_ogject_update.push([
                                res[9], 
                                res[10], 
                                res[11], 
                                
                                set_save_cells(myTableTGO, coords[5]+l), 
                                set_save_cells(myTableTGO, coords[6]+l), 
                                set_save_cells(myTableTGO, coords[7]+l), 

                                myTableTGO.getLabel(coords[5]+l),
                                myTableTGO.getLabel(coords[6]+l),
                                myTableTGO.getLabel(coords[7]+l),
                            ])

                        }
                    }
                }
                for (var i = 0; i < tgo_ogject_update.length; i++) { 
                    //получаем массив tgo_obj которые надо обновить
                    if (tgo_ogject_update[i][1] == "table_tgo_tgo_object"){
                        update_tgoObj_arr.push( tgo_ogject_update[i] )
                    }
            
                    //получаем массив res_obj которые надо обновить
                    if (tgo_ogject_update[i][1] == "table_tgo_ressourceoperation"){
                        update_res_arr.push( tgo_ogject_update[i] )
                    }
                }
                $(".text_save_status").text('...')
                $.ajax({             
                    url: '/table_tgo/ajax_update_tgo/',
                    method : "post",
                    dataType : "json",
                    data: {
                        'valueEndRow': [$('#tgo_id').val(), 'valueEndRow', valueEndRow],
                        'valueStartRow': [$('#tgo_id').val(), 'valueStartRow', valueStartRow],
                        'update_tgoObj_arr': update_tgoObj_arr, 
                        'update_res_arr': update_res_arr,   
                        'save_version': [save_version, 'save_version', save_version], 
                    },                
            
                    success: function () {  
                        if (toast)
                        {
                            toastr.success('успешно', 'Статус обновления');
                        }
                        toast = true
                        $(".text_save_status").text('✅').attr('title', 'Этот значок отображает статус сохранения ваших действий, если вместо него стоит красный крестик, значит изменения не сохранились');

                        if (reload) {
                            location.reload()
                        } else if (replace_current_version)
                        {     
                            $.ajax({             
                                url: '/table_tgo/ajax_replace_current_version/',
                                method : "post",
                                dataType : "json",
                                data: {
                                    'tgo_id': $('#tgo_id').val(),
                                    'author': $( "input[name='author']" ).val(), 
                                    'history_tgo': jexcelData, 
                                    'history_change_reason': $('.select_history_tgo').find(":selected").text(), 
                                },                
                                success: function () {  
                                    $(".text_save_status").text('✅').attr('title', 'этот значок отображает статус сохранения ваших действий, если вместо него стоит красный крестик, значит изменения не сохранились');
                                    location.reload()
                                },
                                error: function () {
                                    $(".text_save_status").text('❌').attr('title', 'изменения не сохранены');
                                    $("#modal_alert").modal('show');
                                    $("#modal_alert .modal-title").html('Упс, ошибка сервера');
                                    $("#modal_alert .modal-body").html('Изменения не сохранены, пожалуйста повторите действия или обновите страницу');
                                    $("#modal_alert .btn-primary").html('Ок');
                                }
                            });
                        }
                    },
                    error: function () {
                        if (reload) {
                            $(".text_save_status").text('❌').attr('title', 'изменения не сохранены');
                            $("#modal_alert").modal('show');
                            $("#modal_alert .modal-title").html('Упс, ошибка сервера');
                            $("#modal_alert .btn-primary").html('Ок');

                            setTimeout(
                                function() {
                                    location.reload()
                                }, 1000);
                        } else {
                            myTableTGO.setData(jexcelData) 
                            $(".text_save_status").text('❌').attr('title', 'изменения не сохранены');
                            $("#modal_alert").modal('show');
                            $("#modal_alert .modal-title").html('Упс, ошибка сервера');
                            $("#modal_alert .modal-body").html('Изменения не сохранены, пожалуйста повторите действия или обновите страницу');
                            $("#modal_alert .btn-primary").html('Ок');
                        }
                    }

                });
            }
        }

        // сохраняем время при редактировании ячейки
        function saveTime_Row(focused_row, index) {
            status_graphic = 1
            if ($(".requestUser").val() == $( "input[name='author']" ).val())
            {
                $(".text_save_status").text('...')
                if( focused_cell_x == 4) //если сохраняем  комментарий
                {
                    status_graphic = 0
                    $.ajax({             
                        url: '/table_tgo/ajax_update_tgo_comment/',
                        method : "post",
                        dataType : "json",
                        data: {
                            'cells_update': [focused_row[9], focused_row[10], focused_row[4]],
                        },                
                        success: function () {  
                            $(".text_save_status").text('✅').attr('title', 'этот значок отображает статус сохранения ваших действий, если вместо него стоит красный крестик, значит изменения не сохранились');
                        },
                        error: function () {
                            $(".text_save_status").text('❌').attr('title', 'изменения не сохранены');
                            $("#modal_alert").modal('show');
                            $("#modal_alert .modal-title").html('Упс, ошибка сервера');
                            $("#modal_alert .modal-body").html('Изменения не сохранены, пожалуйста повторите действия');
                            $("#modal_alert .btn-primary").html('Ок');
                        }
                    });
                    
                } else if(focused_row[1] == 'Окончание') //если сохраняем окончание
                {
                    $.ajax({             
                        url: '/table_tgo/ajax_update_tgo_row/',
                        method : "post",
                        dataType : "json",
                        data: { 
                            'cells_update': [
                                focused_row[9], 
                                focused_row[10],  
                                set_save_cells(myTableTGO, coords[5]+index), 
                                set_save_cells(myTableTGO, coords[6]+index), 
                                set_save_cells(myTableTGO, coords[7]+index), 
                                
                                valueEndRow,
                                
                                myTableTGO.getLabel(coords[5]+index),
                                myTableTGO.getLabel(coords[6]+index),
                                myTableTGO.getLabel(coords[7]+index),
                            ],
                        },                
                
                                        
                        success: function () {  
                            $(".text_save_status").text('✅').attr('title', 'этот значок отображает статус сохранения ваших действий, если вместо него стоит красный крестик, значит изменения не сохранились');
                            
                        },
                        error: function () {
                            $(".text_save_status").text('❌').attr('title', 'изменения не сохранены');
                            $("#modal_alert").modal('show');
                            $("#modal_alert .modal-title").html('Упс, ошибка сервера');
                            $("#modal_alert .modal-body").html('Изменения не сохранены, пожалуйста повторите действия');
                            $("#modal_alert .btn-primary").html('Ок');
                        }
                    });
                }else if(focused_row[1] == 'Начало' || focused_row[1] == 'Начало после подготовительных работ') //если сохраняем окончание
                {
                    $.ajax({             
                        url: '/table_tgo/ajax_update_tgo_row/',
                        method : "post",
                        dataType : "json",
                        data: { 
                            'cells_update': [
                                focused_row[9], 
                                focused_row[10],  
                                set_save_cells(myTableTGO, coords[5]+index), 
                                set_save_cells(myTableTGO, coords[6]+index), 
                                set_save_cells(myTableTGO, coords[7]+index), 
                                
                                'Начало',
                                
                                myTableTGO.getLabel(coords[5]+index),
                                myTableTGO.getLabel(coords[6]+index),
                                myTableTGO.getLabel(coords[7]+index),
                            ],
                        },                
                
                                        
                        success: function () {  
                            $(".text_save_status").text('✅').attr('title', 'этот значок отображает статус сохранения ваших действий, если вместо него стоит красный крестик, значит изменения не сохранились');
                            
                        },
                        error: function () {
                            $(".text_save_status").text('❌').attr('title', 'изменения не сохранены');
                            $("#modal_alert").modal('show');
                            $("#modal_alert .modal-title").html('Упс, ошибка сервера');
                            $("#modal_alert .modal-body").html('Изменения не сохранены, пожалуйста повторите действия');
                            $("#modal_alert .btn-primary").html('Ок');
                        }
                    });
                } else { // сохраняем обычную ячейку
                    $.ajax({             
                        url: '/table_tgo/ajax_update_tgo_row/',
                        method : "post",
                        dataType : "json",
                        data: {
                            'cells_update': [
                                focused_row[9], 
                                focused_row[10],  
                                set_save_cells(myTableTGO, coords[5]+index), 
                                set_save_cells(myTableTGO, coords[6]+index), 
                                set_save_cells(myTableTGO, coords[7]+index),
                                
                                '',
                                
                                myTableTGO.getLabel(coords[5]+index),
                                myTableTGO.getLabel(coords[6]+index),
                                myTableTGO.getLabel(coords[7]+index),
                            ],
                        },                           
                        success: function () {  
                            $(".text_save_status").text('✅').attr('title', 'этот значок отображает статус сохранения ваших действий, если вместо него стоит красный крестик, значит изменения не сохранились');
                        },
                        error: function () {
                            $(".text_save_status").text('❌').attr('title', 'изменения не сохранены');
                            $("#modal_alert").modal('show');
                            $("#modal_alert .modal-title").html('Упс, ошибка сервера');
                            $("#modal_alert .modal-body").html('Изменения не сохранены, пожалуйста повторите действия');
                            $("#modal_alert .btn-primary").html('Ок');
                        }
                    });
                }
                
            }
        }
        
        
        //кнопка Назад
        function goUrlIndex() {
            // $("#urlIndex").trigger('click');
            window.location.href = $("#urlIndex").attr("href");

        }
        

        function addOperation() {
            if ($(".requestUser").val() == $( "input[name='author']" ).val()
            || $(".requestUser").val() == $( "input[name='author_tgo']" ).val())
            {
                $(".add_tgo_object").click();
            }   
        }
        function addTechnology() {
            if ($(".requestUser").val() == $( "input[name='author']" ).val()
            || $(".requestUser").val() == $( "input[name='author_tgo']" ).val())
            {
                $(".add_technology").click();
            }   
        }

        //convert to pdf
        function picture_as_pdf() {
            $('#instructions, .jexcel_toolbar, .delete,  .modalButton, .filters-jexcel_nested').attr('data-html2canvas-ignore', 'true');
            $('td[data-column=9], td[data-column=10], td:contains(M), td:contains(N)').attr('data-html2canvas-ignore', 'true');
            $('.sohlasovanie_edit_button1, .sohlasovanie_span, .title_edit, .edit_version, .note_edit, .note_save').attr('data-html2canvas-ignore', 'true');

            count_tr = 0
            for (var i = 0; i < myTableTGO.getColumnData([0]).length; i++) {
                if (!$($('.jexcel_overflow tbody tr')[i])[0].style.cssText.includes('none')){
                    count_tr+=1 
                }
            }
            var doc = {
                info: {  title: 'ТГО ' + $('#title').text() },
                pageSize: "A4",
                pageOrientation: "portrait",
                pageMargins: [30, 30, 30, 30],
                content: []
            };
            if (count_tr>20){
                //добавляем график на html
                $('#spreadsheet').hide()
                html2canvas(document.body, {
                    scrollY: 0}).then(function(canvas) {
                    doc.content.push({
                        image: canvas.toDataURL(),
                        width:  550,
                        }
                    )
                });
                $('#spreadsheet').show()

                $('#oneChart').hide()
                $('#title').hide()

                var count_row = 0
                var count_row2 = 0

                //цикл для того, чтобы вся таблица вместилась в pdf
                for (z=0; z<count_tr; z++)
                {
                    count_row++
                    if ((count_row-count_row2)>60)
                    {
                        $('.jexcel_overflow tbody tr').hide()
                        for (var i = count_row2; i < count_row; i++) {
                            $($($('.jexcel_overflow tbody tr')[i])[0]).show()
                        }
                        
                        html2canvas(document.body, {
                            scrollY: 0}).then(function(canvas) {
                            doc.content.push({
                                image: canvas.toDataURL(),
                                width: 550,
                                }
                            )
                        });
                        count_row2 = count_row
                    } 
                }
                $('.jexcel_overflow tbody tr').show()
                
                html2canvas(document.body, {
                    scrollY: 0}).then(function() {
                    pdfMake.createPdf(doc).open();
                });
                $('#oneChart').show()
                $('#title').show()

            } else {
               //добавляем график на html
               $('#oneChart').hide()
               html2canvas(document.body, {
                   scrollY: 0}).then(function(canvas) {
                   doc.content.push({
                       image: canvas.toDataURL(),
                       width:  550,
                       }
                   )
               });
               $('#oneChart').show()

               $('#spreadsheet, .doc_1, .doc_2, .doc_3').hide()
               $('#title').hide()


               html2canvas(document.body, {
                    scrollY: 0}).then(function(canvas) {
                    doc.content.push({
                        image: canvas.toDataURL(),
                        width:  550,
                        }
                    )
                    
                   pdfMake.createPdf(doc).open();
                });

             $('#spreadsheet, .doc_1, .doc_2, .doc_3').show()
               $('#title').show()
            }
  
            

        }



        order_check = 0
        order_check_prev = -1
        var status = false


        // заменяем переменные ссылками (при изменении данных)
        //Если мы не нашли такого id, заменяем на УДАЛЕНО
        function replace_id_in_links () {
            var after_save_cell = ['_ressourceoperation', '_RESSOURCEOPERATION', '_tgo_object', '_TGO_OBJECT'] 
            dict_elements = {}
            for (var i = 0; i < myTableTGO.getColumnData([0]).length; i++) 
            { 
                if (typeof myTableTGO.getRowData([i]) !== 'undefined' && myTableTGO.getRowData([i])[0] != '')
                {
                    dict_elements[myTableTGO.getRowData([i])[10].substring(10)+'_'+myTableTGO.getRowData([i])[9]] = i+1
                }
            }
            for (var i = 0; i < myTableTGO.getColumnData([0]).length; i++) 
            { 
                var result = myTableTGO.getRowData([i]);
                if (typeof myTableTGO.getRowData([i]) !== 'undefined' && myTableTGO.getRowData([i])[0] != '')
                {           
                    for (var z = 5; z < 8; z++) { 
                        if (typeof myTableTGO.getRowData([i])[z] !== 'undefined')
                        {   
                            var arr_check  = after_save_cell.map(function(val, i) {
                                if (result[z].toString().length > 1)
                                {
                                 if ( result[z].toString().includes(val)) 
                                    { 
                                        return true 
                                    }   
                                }
                                
                            }) //смотрим есть ли ячейки после имзенения

                            var index_modify_cell = $.inArray(true, arr_check)
                            if (index_modify_cell!= -1)
                            {
                                var valuee = myTableTGO.getRowData([i])[z].replaceAll(/[+-/*=()]/g, ' ').split(' ') 
                                for (var h=0; h<valuee.length; h++)
                                { 
                                    if (!isNaN(parseInt(valuee[h])))
                                    {
                                        valuee[h] = ''
                                    }
                                    else
                                    {
                                        valuee[h] = parseInt(valuee[h].replace(/[^.\d]/g, '')) 
                                    }
                                }

                                // разбираем значение ячейки
                                var old_value_cell = myTableTGO.getRowData([i])[z]
                                .toLowerCase()
                                .split(/([+])/).join(' ')
                                .split(/([-])/).join(' ')
                                .split(/([*])/).join(' ')
                                .split(/([/])/).join(' ')
                                .split(/([=])/).join(' ')
                                .split(/([(])/).join(' ')
                                .split(/([)])/).join(' ').split(' ')
                                
                                var x = i+1
                                for (var m = 0; m < old_value_cell.length; m++) { 
                                    if (dict_elements[old_value_cell[m].substring(2)])
                                    {
                                        old_value_cell[m] = old_value_cell[m].split('_')[0] + dict_elements[old_value_cell[m].substring(2)]  
                                    }
                                }    
                                focused_row_status = 1 
                                myTableTGO.setValue(coords[z] + x, old_value_cell.join('').toUpperCase())    
                                focused_row_status = 1 
                            } else {
                                status = true
                            }
                        }
                    }
                }
            }
            if (status) //если сработала замена переменных ссылками
            {
                for (var i = 0; i < myTableTGO.getColumnData([0]).length; i++) 
                { 
                    var result = myTableTGO.getRowData([i]);
                    if (typeof myTableTGO.getRowData([i]) !== 'undefined' && myTableTGO.getRowData([i])[0] != '')
                    {
                        for (var z = 5; z < 8; z++) { 
                            if (typeof myTableTGO.getRowData([i])[z] !== 'undefined')
                            {   
                                var arr_check  = after_save_cell.map(function(val, i) {
                                    if (result[z].toString().length > 1)
                                    {
                                     if ( result[z].toString().includes(val)) 
                                        { 
                                            return true 
                                        }   
                                    }
                                }) //смотрим есть ли ячейки после имзенения
                                var index_modify_cell = $.inArray(true, arr_check)
                                if (index_modify_cell!= -1)
                                {
                                    
                                    status = true
                                    var valuee = myTableTGO.getRowData([i])[z].replaceAll(/[+-/*=()]/g, ' ').split(' ') 
                                    for (var h=0; h<valuee.length; h++)
                                    { 
                                        if (!isNaN(parseInt(valuee[h])))
                                        {
                                            valuee[h] = ''
                                        }
                                        else
                                        {
                                            valuee[h] = parseInt(valuee[h].replace(/[^.\d]/g, '')) 
                                        }
                                    }
                                    // разбираем значение ячейки
                                    var old_value_cell = myTableTGO.getRowData([i])[z]     
                                    .toLowerCase()
                                    .split(/([+])/).join(' ')
                                    .split(/([-])/).join(' ')
                                    .split(/([*])/).join(' ')
                                    .split(/([/])/).join(' ')
                                    .split(/([=])/).join(' ')
                                    .split(/([(])/).join(' ')
                                    .split(/([)])/).join(' ').split(' ')
    
                                    var x = i+1

                                    for (var m = 0; m < old_value_cell.length; m++) { 

                                        if (old_value_cell[m].toLowerCase().includes(after_save_cell[index_modify_cell].toLowerCase()))
                                        {  
                                            old_value_cell[m] = 'удалено'
                                        }
                                    }                                 
                                    focused_row_status = 1 
                                    myTableTGO.setValue(coords[z] + x, old_value_cell.join(''))
                                    focused_row_status = 1 
                                }
                            }
                        }
                    }
                }
            }
        }
        replace_id_in_links()

        //Инструкции
        $('.instructionsButton').on('click', function () {
            $(".instructions").hide();
        });

        
        //ДОБАВЛЕНИЕ и ИЗМЕНЕНИЕ
        $(".modalButton").each(function () {
            $(this).modalForm({formURL: $(this).data("form-url")});
        });
            
            
        //УДАЛЕНИЕ
        $(".delete").each(function () {
            $(this).modalForm({formURL: $(this).data("form-url"), isDeleteForm: true});
        });


        //Ячейка на которой сфокусировались
        var focused_input;
        var cells_focused_input;
        var focused_row;
        var focused_x = -1;
        var focused_cell_value = 0
        var focused_cell_x = -1
        
        $("td").focusin(function() {
            if (typeof $(this)[0].dataset.x !== 'undefined' && typeof $(this)[0].dataset.y !== 'undefined') 
            {
                focused_row_status = 0
                focused_input = $(this)[0]
                focused_cell_x = $(this)[0].dataset.x
                cells_focused_input = myTableTGO
                                    .getRowData($(this)[0].dataset.y)[$(this)[0].dataset.x]
                                    .toString()
                                    .replaceAll(/[+-/*=()]/g, ' ')
                                    .split(' ')
                focused_cell_value = myTableTGO.getRowData($(this)[0].dataset.y)[$(this)[0].dataset.x]
                cells_focused_input.map(function(val) {
                    myTableTGO.setStyle(val, 'border', '1px solid blue');
                });

                focused_row = $(this)[0].dataset.y     
                focused_x = $(this)[0].dataset.x
                focused_cell = 1
            }
        });

        $("td").focusout(function(){
            if (typeof cells_focused_input !== 'undefined') 
            {
                cells_focused_input.map(function(val) {
                    myTableTGO.setStyle(val, 'border', '1px solid white');
                });
                focused_cell = 0
            }
        });

        var statesArray = ['+', '-', '*', '/', '=', '(']; 
        var value_active_cell = '';
        
        var coord_hover_cell = 0
        var nested_hover_cell = []

        //Действия при наведении на ячейку
        $("td").hover(
            function () {
                if(focused_x == 5 || focused_x == 6 || focused_x == 7)
                {
                    nested_hover_cell = []
                    // НУЖНОЕ выделение ячеек которые ссылаются на наводимую
                    // if (typeof coords[$(this)[0].dataset.x] !== 'undefined'
                    // && !isNaN($(this)[0].dataset.y))
                    // {
                    //     var y =  parseInt($(this)[0].dataset.y)+1
                    //     if (coord_hover_cell != coords[$(this)[0].dataset.x] + y  )
                    //     {
                    //         coord_hover_cell = coords[$(this)[0].dataset.x] + y 
                    //         for (var i = 0; i < myTableTGO.getColumnData([0]).length; i++) { 
                    //             res = myTableTGO.getRowData([i]);
                    //             if (typeof res !== 'undefined')
                    //             {
                                    
                    //                 for (var z = 5; z < 8; z++) { 
                    //                     if (res[z].toString().includes(coord_hover_cell))
                    //                     {
                    //                         var valuee = res[z].replaceAll(/[+-/*=()]/g, ' ').split(' ') 
                    //                         for (var h=0; h<valuee.length; h++)
                    //                         { 
                    //                             if (!isNaN(parseInt(valuee[h])))
                    //                             {
                    //                                 valuee[h] = ''
                    //                             }
                    //                             else
                    //                             {
                    //                                 valuee[h] = parseInt(valuee[h].replace(/[^.\d]/g, '')) 
                    //                             }
                    //                         }

                    //                         if ($.inArray(parseInt(coord_hover_cell.replace(/[^.\d]/g, '')), valuee) != -1)
                    //                         {
                    //                             nested_hover_cell.push(coords[z] + (parseInt(i) +1))
                    //                         }
                    //                     }
                    //                 }
                    //             }
                    //         }
                    //         nested_hover_cell.map(function(val) {
                    //             myTableTGO.setStyle(val, 'border', '1px solid black');
                    //         });
                    //     }  
                    // }
            
                    //заполнение формул при наведении как в Excel
                    if (coords[$(this)[0].dataset.x] && $(this)[0].dataset.y && document.activeElement.value) 
                    {
                        if (focused_cell_value != document.activeElement.value && document.activeElement.value[0] == '=')
                        {
                            if($.inArray(document.activeElement.value[document.activeElement.value.length-1],statesArray)!=-1) // если стоит оператор
                            {
                                if ($(this)[0].dataset.y == focused_input.dataset.y && $(this)[0].dataset.x == focused_input.dataset.x) {} 
                                else {   
                                    // буквенное значение ячейки на которую мы навелись
                                    var y =  parseInt($(this)[0].dataset.y)+1
                                    coord_hover_cell =  coords[$(this)[0].dataset.x] + y
                                    //вставляем новое значение
                                    value_active_cell = document.activeElement.value
                                    document.activeElement.value = document.activeElement.value + coord_hover_cell
                                }
                            } 
                            // если стоит ячейка F, G или H, и ее изменение
                            else if (value_active_cell == document.activeElement.value.substring(0, document.activeElement.value.length - coord_hover_cell.length)) {
                                if  ($(this)[0].dataset.y == focused_input.dataset.y && $(this)[0].dataset.x == focused_input.dataset.x)
                                { //Если выделенная и наведенная совпадают
                                } else { 
                                    //Возвращаем выделенную ячейку к стартовому значению
                                    document.activeElement.value = document.activeElement.value.substring(0, document.activeElement.value.length - coord_hover_cell.length);
                    
                                    // буквенное значение ячейки на которую мы навелись
                                    var y =  parseInt($(this)[0].dataset.y)+1
                                    coord_hover_cell =  coords[$(this)[0].dataset.x] + y
                
                                    //вставляем новое значение
                                    value_active_cell = document.activeElement.value
                                    document.activeElement.value = document.activeElement.value + coord_hover_cell
                                }
                            }   
                        }                     
                    }
                }
            }, 
                
            function () {
                nested_hover_cell.map(function(val) {
                    myTableTGO.setStyle(val, 'border', '1px solid white');
                });
            }
            
        );

        // off click right mouse
        $("body").on("contextmenu",function(e){
            return false;
        });
        
        
        
        function set_save_cells(myTableTGO, save_cell) {
            save_cell = save_cell.toString()
            if (
               ( myTableTGO.getValue(save_cell) !== null &&
                myTableTGO.getValue(save_cell) != '' 
                && typeof myTableTGO.getValue(save_cell) !== 'undefined'  
               ) || myTableTGO.getValue(save_cell) == 0
            )
            {
            // ----------------------------------
                // смотрим из чего состоит изменяемая ячейка, и заменяем всё ее значение на вид [F_or_H_or_G]_[ressource_or_tgo]_id[ressource_or_tgo]
                var saved_cell_modify = myTableTGO.getValue(save_cell).toString()
                                        .split(/([+])/).join(' ')
                                        .split(/([-])/).join(' ')
                                        .split(/([*])/).join(' ')
                                        .split(/([/])/).join(' ')
                                        .split(/([=])/).join(' ')
                                        .split(/([(])/).join(' ')
                                        .split(/([)])/).join(' ').split(' ')
                if (saved_cell_modify.length>1){
                    for (var m = 0; m < saved_cell_modify.length; m++) { 
                        if (myTableTGO.getValue(saved_cell_modify[m]) !== null 
                            && myTableTGO.getValue(saved_cell_modify[m]) != '' 
                            && typeof myTableTGO.getValue(saved_cell_modify[m]) !== 'undefined' 
                            && typeof myTableTGO.getRowData(saved_cell_modify[m].substring(1) - 1)!== 'undefined' )
                        {  var index = saved_cell_modify[m].substring(1) - 1
                            if (myTableTGO.getRowData(index)[10].includes('ressourceoperation'))
                            {
                                saved_cell_modify[m] = saved_cell_modify[m][0] +  '_ressourceoperation_' + myTableTGO.getRowData([index])[9]
                            } else {
                                saved_cell_modify[m] = saved_cell_modify[m][0] +  '_tgo_object_' + myTableTGO.getRowData([index])[9]
                            }
                        } 
                    }  
                }
                return saved_cell_modify.join('')
            }
            return save_cell
        }

        //делаем фильтр в таблице
        var tr_filters = $('tr.jexcel_nested')
                        .clone(true)
                        .addClass('filters-jexcel_nested')
                        .insertBefore( "thead.resizable" );

        //удаляем ненужное
        // Массив с индексами <td> элементов, которые нужно очистить
        const indexesToClear = [1, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        // Проходим по индексам и очищаем соответствующие <td> элементы
        indexesToClear.forEach(index => {
        tr_filters.find('td')[index].innerText = '';
        });

        // tr_filters.find('td')[1].innerText = ''
        // tr_filters.find('td')[4].innerText = ''
        // tr_filters.find('td')[5].innerText = ''
        // tr_filters.find('td')[6].innerText = ''
        // tr_filters.find('td')[7].innerText = ''
        // tr_filters.find('td')[8].innerText = ''
        // tr_filters.find('td')[9].innerText = ''
        // tr_filters.find('td')[10].innerText = ''
        // tr_filters.find('td')[11].innerText = ''
        // tr_filters.find('td')[12].innerText = ''

        //копируем select ресурсов
        var select_res = $("#ressource_filter_select")
        .clone(true)
        .attr("id", "ressource_filter")
        .css("display", "block")
        //вставляем его куда надо
        $('.filters-jexcel_nested td[data-column=' + tr_filters.find('td')[3].dataset.column + ']').html(select_res)

        //Делаем его в стиле bootstrap
        $("#ressource_filter").bsMultiSelect(); 

        //Связываем ресурсы с таблицей
        
        var res_filter = 0
        var point_operation = []
        var point_ressource = []
        var full_array = []

        var index_res_cascade_op = []

        $('#ressource_filter').on('change', function (e) {
            var ressource = $(this).val()
            localStorage.setItem('ressource_filter'+'_'+$('#tgo_id').val(), $(this).val());
            point_operation = []
            point_ressource = []
            
            full_array = []
            
            var flag = 1
            var tr = $('.jexcel_overflow tbody tr')

            index_res_cascade_op = []
            if($('#operation_filter').val().length>0) //если фильтр по операциям уже используется
            {
                if (full_array_op.length < $('#operation_filter').val().length) {
                    full_array_op = [...index_oper_cascade]
                }
                if (ressource.length != 0) {
                    var arr_res = $('.jexcel_overflow tbody tr')
                    for (var i=0; i<arr_res.length; i++)
                    {
                        
                        if (jQuery.inArray(i, full_array_op) != -1)
                        {
                            for (var p = 0; p < ressource.length; p++) { //для каждого из ресурсов в checkbox, ищем его операции и его в оставшихся показанных строкха
                                if ($($(arr_res[i]).find("td:eq(3)")).text().slice(0, -1) === ressource[p] && $($(arr_res[i]).find("td:eq(3)")).text().slice(0, -1) != '')
                                { 
                                    var my_flag = 1
                                    for (var z=0; z<=i; z++)
                                    {
                                        if (jQuery.inArray(z, full_array_op ) != -1)
                                        {
                                            var x =z+1
                                            if (myTableTGO.getLabel('B' + x) != '') // операция
                                            { 
                                                if(my_flag == 1){
                                                    index_res_cascade_op.push(z)
                                                } else if (my_flag == 0 ) {
                                                    index_res_cascade_op.pop()
                                                    index_res_cascade_op.push(z)
                                                }
                                                my_flag = 0  
                                            }
                                            else { 
                                            if (z==i)
                                            {
                                                my_flag = 1 
                                                index_res_cascade_op.push(z)
                                            }   
                                            }
                                            
                                        }
                                    }
                                    if (my_flag == 0) { //последняя операция без ресурса, или он нам не подошел
                                        index_res_cascade_op.pop()
                                    }
                                }
                            }
                        }
                    }
                    for (var g=0; g<tr.length; g++) 
                    {
                            $(tr[g]).show()
                    }
        
                    for (var g=0; g<tr.length; g++)
                    {
                        if (jQuery.inArray(g, index_res_cascade_op ) == -1){
                            $(tr[g]).hide()
                        }
                    }
                } else {  

                    for (var g=0; g<tr.length; g++) 
                    {
                            $(tr[g]).show()
                    }
        
                    for (var g=0; g<tr.length; g++)
                    {
                        if (jQuery.inArray(g, full_array_op ) == -1){
                            $(tr[g]).hide()
                        }
                    }
                }
                
            } else {
                if (ressource.length != 0) {
                    res_filter = 1
                    for (var i = 0; i < myTableTGO.getColumnData([0]).length; i++) {  
                        res = myTableTGO.getRowData(i);
                        
        
                        if (i+1 != myTableTGO.getColumnData([0]).length ) {
                            var x =i+1
                            
                            if (myTableTGO.getLabel('B' + x) != '') // операция
                            { 
                                    if(flag == 1){
                                        point_operation.push(i)
                                    } else if (flag == 0 ) {
                                        point_operation.pop()
                                        point_operation.push(i)
                                    }
                                    flag = 0  
                                // }
                            }
                            else { 
                                for (var p = 0; p < ressource.length; p++) { 
                                    if (res[2].slice(0, -1) === ressource[p])
                                    { 
                                        point_ressource.push(i)
                                        flag = 1 
                                    }
                                }
                            }
                        }
                    }
        
                    if (flag == 0) { //последняя операция без ресурса, или он нам не подошел
                        point_operation.pop()
                    }
        
                    full_array = [...point_operation, ...point_ressource].sort()
                    
                    for (var g=0; g<tr.length; g++) 
                    {
                            $(tr[g]).show()
                    }
        
                    for (var g=0; g<tr.length; g++)
                    {
                        if (jQuery.inArray(g, full_array ) == -1){
                            $(tr[g]).hide()
                        }
                    }
        
                } else {
                    res_filter = 0
                    for (var g=0; g<tr.length; g++)
                    {
                            $(tr[g]).show()
                    }
                    
                }
                if (first_load_page_local_storage == localStorage.getItem('ressource_filter'+'_'+$('#tgo_id').val()).split(',').length) {
                    if (localStorage.getItem('operation_filter'+'_'+$('#tgo_id').val())){
                        var array = localStorage.getItem('operation_filter'+'_'+$('#tgo_id').val()).split(',')
                        $('#operation_filter').val(array)
                    }
                }
            }
            first_load_page_local_storage += 1
            draw_tgo_table(myTableTGO)
            
        });
        

        //копируем select операций
        var select_op = $("#operation_filter_select")
        .clone(true)
        .attr("id", "operation_filter")
        .css("display", "block")
        
        //вставляем его куда надо
        $('.filters-jexcel_nested td[data-column=' + tr_filters.find('td')[2].dataset.column + ']').html(select_op)

        //Делаем его в стиле bootstrap
        $("#operation_filter").bsMultiSelect(); 
        var op_filter = 0
        var point_operation_op = []
        var point_ressource_op = []
        var full_array_op = []
        var index_oper_cascade = []
        var start_only_op_hide = 0

        //Связываем операции с таблицей
        $('#operation_filter').on('change', function (e) {
            localStorage.setItem('operation_filter'+'_'+$('#tgo_id').val(), $(this).val());
            point_operation_op = []
            point_ressource_op = []
            var operation = $(this).val()
            index_oper_cascade = []
            var flag_op = -999
            var tr = $('.jexcel_overflow tbody tr')

            if($('#ressource_filter').val().length>0) //если фильтр по ресурсам уже используется
            {
                if (full_array.length < $('#ressource_filter').val().length) {
                    full_array = [...index_res_cascade_op]
                }

                if (operation.length != 0) {
                    var arr_op = $('.jexcel_overflow tbody tr')
                    op_filter = 1
                    var op_casc_status = 0
                    for (var p = 0; p < operation.length; p++ )
                    { 
                        for (var i=0; i<arr_op.length; i++) {
                            if (jQuery.inArray(i, full_array) != -1) //мы нашли либо ресурс либо операцию, которая есть в отфильтрованной(после ресурса) таблице
                            {
                                if ($($(arr_op[i]).find("td:eq(2)")).text().slice(0, -1) != '') //операция
                                {
                                    op_casc_status = 0
                                    if ($($(arr_op[i]).find("td:eq(1)")).text() + ' ' + $($(arr_op[i]).find("td:eq(2)")).text() === operation[p])
                                    {
                                        index_oper_cascade.push(i)
                                        op_casc_status = 1
                                    } 
                                    
                                } //ресурс
                                else { 
                                    if (op_casc_status == 1) { // ресурс нашей операции
                                        index_oper_cascade.push(i)
                                    }
                                }
                            }
                        }
                    }
                    
                    for (var g=0; g<tr.length; g++) 
                    {
                            $(tr[g]).show()
                    }
        
                    for (var g=0; g<tr.length; g++)
                    {
                        if (jQuery.inArray(g, index_oper_cascade ) == -1){
                            $(tr[g]).hide()
                        }
                    }
                } else {  

                    for (var g=0; g<tr.length; g++) 
                    {
                            $(tr[g]).show()
                    }
        
                    for (var g=0; g<tr.length; g++)
                    {
                        if (jQuery.inArray(g, full_array ) == -1){
                            $(tr[g]).hide()
                        }
                    }
                }
            } else {
                if (operation.length != 0) {
                    op_filter = 1
                    for (var i = 0; i < myTableTGO.getColumnData([0]).length - 1; i++) { 
                        res = myTableTGO.getRowData(i);
        
                        if (i != myTableTGO.getColumnData([0]).length - 1) {
                            var x =i+1
        
                            if (myTableTGO.getLabel('B' + x) != '') // операция
                            {  
                                    for (var p = 0; p < operation.length; p++) { 
                                        if ((res[0] + ' ' + res[1]) === operation[p])
                                        { 
                                            if (res_filter == 1)
                                            {
                                                if (jQuery.inArray(operation[p], point_operation))
                                                {
                                                    point_operation_op.push(i)
                                                    flag_op = i 
                                                }
                                            } else {
                                                point_operation_op.push(i)
                                                flag_op = i 
                                            }
                                        }
                                    }
                            }
                            else { 
                                if (res_filter == 1)
                                {
                                    if (jQuery.inArray(i, point_ressource))
                                    {
                                        if (flag_op == i -1)
                                        {
                                        point_ressource_op.push(i)
                                        flag_op += 1 
                                        }
                                    }
                                } else {
                                    if (flag_op == i -1)
                                    {
                                    point_ressource_op.push(i)
                                    flag_op += 1 
                                    }
                                }
                            }
                        }
                    }
        
                    full_array_op = [...point_operation_op, ...point_ressource_op].sort()
                    for (var g=0; g<tr.length; g++) 
                    {
                            $(tr[g]).show()
                    }
        
                    for (var g=0; g<tr.length; g++)
                    {
                        if (jQuery.inArray(g, full_array_op ) == -1){
                            $(tr[g]).hide()
                        }
                    }
        
                } else {
                    op_filter = 0
                    for (var g=0; g<tr.length; g++)
                    {
                            $(tr[g]).show()
                    }
                    
                }
            }
        
            if (start_only_op_hide == 0) {

                setTimeout(() => { if (localStorage.getItem('hide_all_res'+'_'+$('#tgo_id').val())){
                    hide_all_res = localStorage.getItem('hide_all_res'+'_'+$('#tgo_id').val())            
    
                    if(hide_all_res == 'false')
                    {
                        hide_all_res = true
                        $('.tgo-hide_all_res').click()
                    }
                } }
                    
                    , 10);
                
            }
            start_only_op_hide += 1
            draw_tgo_table(myTableTGO)
        });

        
        //переносим сброс фильтров в таблицу
        $('.tgo_hide_buttons')
        .clone(true)
        .removeClass('tgo_hide_buttons')
        .insertAfter($('i.jexcel_toolbar_item')[$('i.jexcel_toolbar_item').length - 1])
        $('.tgo_hide_buttons').hide();
        
        $('i.jexcel_toolbar_item:eq(1)').addClass('text-primary')
        $('i.jexcel_toolbar_item:eq(6)').addClass('text-success')

        // скрыть ресурсы
        var hide_all_res = true
        $('.tgo-hide_all_res').on('click', function (e) {
            if (hide_all_res) {            
                $(this).removeClass('btn-outline-warning')
                $(this).addClass('btn-warning')
                hide_all_res = false
                
                localStorage.setItem('hide_all_res'+'_'+$('#tgo_id').val(), hide_all_res);
                $('.tgo-hide_all_res').text('Показать ресурсы')

                
                for (let i = 0; i < myTableTGO.getColumnData([0]).length; i++) {
                    if (!$($('.jexcel_overflow tbody tr')[i])[0].style.cssText.includes('none')){
                        res = myTableTGO.getRowData(i);
                        var x = i+1
                        if (myTableTGO.getLabel('D' + x) != '')
                        {
                            $($('.jexcel_overflow tbody tr')[i]).hide()
                        }
                    }
                }
            } else {
                $(this).removeClass('btn-warning')
                $(this).addClass('btn-outline-warning')
                hide_all_res = true
                localStorage.setItem('hide_all_res'+'_'+$('#tgo_id').val(), hide_all_res);
                $('.tgo-hide_all_res').text('Скрыть ресурсы')

                //показать ресурсы
                $($('.jexcel_overflow tbody tr')).show()
                for (let i = 0; i < myTableTGO.getColumnData([0]).length; i++) {
                    res = myTableTGO.getRowData(i);
                    var x = i+1
                    for (var g=0; g<$('.jexcel_overflow tbody tr').length; g++)
                    {
                        if (index_res_cascade_op.length > 0 || index_oper_cascade.length > 0)
                        {
                            if (index_oper_cascade.length > index_res_cascade_op.length && index_oper_cascade.length > 0)
                            {
                                if (jQuery.inArray(g, index_oper_cascade ) == -1){
                                    $($('.jexcel_overflow tbody tr')[g]).hide()
                                } else {
                                    $($('.jexcel_overflow tbody tr')[g]).show()
                                }
                            }
                            if (index_res_cascade_op.length > index_oper_cascade.length && index_res_cascade_op.length > 0)
                            {
                                if (jQuery.inArray(g, index_res_cascade_op ) == -1){
                                    $($('.jexcel_overflow tbody tr')[g]).hide()
                                } else {
                                    $($('.jexcel_overflow tbody tr')[g]).show()
                                } 
                            }
                        }
                        else if (full_array.length> 0 || full_array_op.length > 0)
                        {
                            if (full_array_op.length > full_array.length && full_array_op.length > 0)
                            {
                                if (jQuery.inArray(g, full_array_op ) == -1){
                                    $($('.jexcel_overflow tbody tr')[g]).hide()
                                } else {
                                    $($('.jexcel_overflow tbody tr')[g]).show()
                                }
                            }
                            if (full_array.length > full_array_op.length && full_array.length > 0)
                            {
                                if (jQuery.inArray(g, full_array ) == -1){
                                    $($('.jexcel_overflow tbody tr')[g]).hide()
                                } else {
                                    $($('.jexcel_overflow tbody tr')[g]).show()
                                } 
                            }
                        }
                        
                    }
                    
                }
            }
            
            draw_tgo_table(myTableTGO)
            // res_op_filter()
        })

        // сброс фильтров 
        $('.tgo-resetFilter').on('click', function (e) {
            localStorage.removeItem('ressource_filter'+'_'+$('#tgo_id').val())
            localStorage.removeItem('operation_filter'+'_'+$('#tgo_id').val())
            localStorage.removeItem('hide_all_res'+'_'+$('#tgo_id').val())
            
            $("#ressource_filter").BsMultiSelect().deselectAll()
            $("#operation_filter").BsMultiSelect().deselectAll()
            hide_all_res = true
            
            for (var g=0; g<$($('.jexcel_overflow tbody tr')[g]).length; g++) 
            {
                $($('.jexcel_overflow tbody tr')[g]).show()
            }
            draw_tgo_table(myTableTGO)
        })

        var first_load_page_local_storage
        function res_op_filter () { 
            status_graphic = 1
            first_load_page_local_storage = 1
            if (localStorage.getItem('ressource_filter'+'_'+$('#tgo_id').val())){
                var array = localStorage.getItem('ressource_filter'+'_'+$('#tgo_id').val()).split(',')
                $('#ressource_filter').val(array)
            } else {
                if (localStorage.getItem('operation_filter'+'_'+$('#tgo_id').val())){
                    var array = localStorage.getItem('operation_filter'+'_'+$('#tgo_id').val()).split(',')
                    start_only_op_hide = 0
                    $('#operation_filter').val(array)

                } else {
                    draw_tgo_table(myTableTGO)
                    if (localStorage.getItem('hide_all_res'+'_'+$('#tgo_id').val())){
                        hide_all_res = localStorage.getItem('hide_all_res'+'_'+$('#tgo_id').val())
                        if(hide_all_res == 'false')
                        {
                            hide_all_res = true
                            $('.tgo-hide_all_res').click()
                        }
                    }
                }
            }
        }
    res_op_filter()
        
    $('.modal_body_instructions').hide()
    $('.instructions').on('click', function () {  
        $("#modal_alert").modal('show');
        $("#modal_alert .modal-title").html('Пояснения');
        $("#modal_alert .modal-body").html($('.modal_body_instructions').html());
        $("#modal_alert .btn-primary").html('Ок');
    });

    // Контроль версий ТГО -------------------------------------------------------------
    $(".history_tgo").each(function() {
        $('.select_history_tgo').append( '<option value="'+this.id+'" >'+this.getAttribute('name')+'</option>' )
    })
    // if (parseInt($('.select_history_tgo').length) == 1)
    // {
    //     $('.select_history_tgo').attr('display', 'none')
    // }
    var jexcelData =[]   
    $('select.select_history_tgo').change(function() {
        if  ($(this).val() == 'Используемая')
        {
            location.reload()

            //ПОСЛЕ ЭТОГО НЕ РАБОТАЮТ МОДАЛЬНЫЕ ОКНА ПО РЕДАКТИРОВАНИЮ ДАННЫХ В ТАБЛИЦЕ

            // myTableTGO.setData(myTableArray)

            // myTableTGO.hideColumn(11);
            // myTableTGO.hideColumn(10);
            // myTableTGO.hideColumn(9);

            // $('.tgo_save_version').show()
            // $('.tgo_delete_version').hide()
            // $('.tgo_replace_this_version').hide()

            // $(".draggable  td[data-x='4']").removeClass('readonly')
            // $(".draggable  td[data-x='5']").removeClass('readonly')
            // $(".draggable  td[data-x='6']").removeClass('readonly')
            // $(".draggable  td[data-x='7']").removeClass('readonly')

            // $(".jexcel_toolbar_item").show()

            // document.body.appendChild(document.getElementById('sctiprt_modal_1'));  
            // document.body.appendChild(document.getElementById('sctiprt_modal_2'));  
        }  else {
            this_version = false // чтоб изменения ячеек не шли в БД
            jexcelData =[]   
            $('#'+$(this).val() + ' tr').each(function() {
                var rowDataArray = [];
                var actualData = $(this).find('td');
                if (actualData.length > 0) {
                    actualData.each(function() {
                        // if($(this)[0].className != 'status_elem' && $(this)[0].className != 'id' )
                            rowDataArray.push($(this).html());
                    });
                    jexcelData.push(rowDataArray);
                }
            });
            jexcelData.sort((a, b) =>a[0] - b[0]);
            myTableTGO.setData(jexcelData) 
            myTableTGO.hideColumn(10);
            myTableTGO.hideColumn(9);

            $(".jexcel_toolbar_item").hide()
            $("i[title='На главную']").show()
            $("i[title='Сохранить в PDF']").show()


            $('.tgo_save_version').hide()
            if ($(".requestUser").val() == $( "input[name='author']" ).val())
            {
                $('.tgo_delete_version').show()            
                $('.tgo_replace_this_version').show()
                $('.edit_mode').html('Изменения не фиксируются')   
                $('.edit_mode').addClass('alert alert-danger')   
            }  
            replace_id_in_links()
            updateMyTable()
           }
        })

        // сохранить версию 
        $('.tgo_save_version').on('click', function (e) {
            if ($(".requestUser").val() == $( "input[name='author']" ).val())
            {
                saveTime(true, 1)
            }
        })
        
        // удалить версию 
        $('.tgo_delete_version').on('click', function (e) {
            if ($(".requestUser").val() == $( "input[name='author']" ).val())
            {
              $.ajax({             
                url: '/table_tgo/ajax_delete_history/',
                method : "post",
                dataType : "json",
                data: {
                    'history_change_reason': $('.select_history_tgo').find(":selected").text(), 
                },                
                success: function () {  
                  location.reload()
                },
                error: function () {
                    $("#modal_alert").modal('show');
                    $("#modal_alert .modal-title").html('Упс, ошибка сервера');
                    $("#modal_alert .modal-body").html('Изменения не сохранены, пожалуйста повторите действия или обновите страницу');
                    $("#modal_alert .btn-primary").html('Ок');
                }
            });  
            }
        })
        
        // сделать текущей
        $('.tgo_replace_this_version').on('click', function (e) {
            // сначала сохраняю текущую версию, а потом перехлжу ко второму AJAX
            myTableTGO.setData(myTableArray)
            if ($(".requestUser").val() == $( "input[name='author']" ).val())
            {
                saveTime(false, 1, true)
            }
        })
        
      
        if ($(".requestUser").val() != $( "input[name='author']" ).val())
        {
            $('.tgo_save_version').hide()
            $('i.jexcel_toolbar_item:eq(1)').hide()
            $('i.jexcel_toolbar_item:eq(2)').hide()
            $('i.jexcel_toolbar_item:eq(5)').hide()
        } 
        // Контроль версий ТГО -------------------------------------------------------------

        // Технологии
        var arr = $("span.technology_span")
        var order = 0
        var punkt = 0
        for (var i=0; i<arr.length; i++)
        {
            if (typeof $(arr[i]).parent()[0].dataset.y != 'undefined')
            {
               myTableTGO.getCell('A'+(parseInt($(arr[i]).parent()[0].dataset.y)+1)).style["backgroundColor"] = '#FF751830'
               myTableTGO.getCell('D'+(parseInt($(arr[i]).parent()[0].dataset.y)+1)).style["backgroundColor"] = '#FF751830'
               myTableTGO.getCell('E'+(parseInt($(arr[i]).parent()[0].dataset.y)+1)).style["backgroundColor"] = '#FF751830'
               myTableTGO.getCell('M'+(parseInt($(arr[i]).parent()[0].dataset.y)+1)).style["backgroundColor"] = '#FF751830'
               myTableTGO.getCell('N'+(parseInt($(arr[i]).parent()[0].dataset.y)+1)).style["backgroundColor"] = '#FF751830'
               myTableTGO.getCell('O'+(parseInt($(arr[i]).parent()[0].dataset.y)+1)).style["backgroundColor"] = '#FF751830'
            }

            // Будем показывать кнопки редактирования только для первой операции технологии
            if (order == arr[i].className.split(' ')[1].split('_')[1] && punkt != arr[i].className.split(' ')[1].split('_')[2])
            {
                // та же технология
                $(arr[i]).hide()
            } else {
                // новая технология
                $($(arr[i]).parent()[0]).addClass('start_technology')
                order = arr[i].className.split(' ')[1].split('_')[1]
                punkt = arr[i].className.split(' ')[1].split('_')[2]
            }
        }

        // Если только внедрили технологию и ее начало не ссылается ни на что, подсвечиваем ее
        function check_new_technology () {
            for (var i=0; i<$(".start_technology").length; i++)
            {
                if ( myTableTGO.getRowData([$(".start_technology")[i].dataset.y]) && $(".start_technology")[i].dataset.y != 0)
                {
                    // Если только внедрили технологию и ее начало не ссылается ни на что, подсвечиваем ее
                    if(myTableTGO.getRowData([$(".start_technology")[i].dataset.y])[5][0]!='=')
                    {
                        myTableTGO.getCell('A'+(parseInt([$(".start_technology")[i].dataset.y])+1)).style["backgroundColor"] = '#ff6d7650'
                        myTableTGO.getCell('D'+(parseInt([$(".start_technology")[i].dataset.y])+1)).style["backgroundColor"] = '#ff6d7660'
                        myTableTGO.getCell('E'+(parseInt([$(".start_technology")[i].dataset.y])+1)).style["backgroundColor"] = '#ff6d7660'
                        myTableTGO.getCell('M'+(parseInt([$(".start_technology")[i].dataset.y])+1)).style["backgroundColor"] = '#ff6d7650'
                        myTableTGO.getCell('N'+(parseInt([$(".start_technology")[i].dataset.y])+1)).style["backgroundColor"] = '#ff6d7660'
                        myTableTGO.getCell('O'+(parseInt([$(".start_technology")[i].dataset.y])+1)).style["backgroundColor"] = '#ff6d7660'
                    } else {
                        myTableTGO.getCell('A'+(parseInt([$(".start_technology")[i].dataset.y])+1)).style["backgroundColor"] = '#FF751830'
                        myTableTGO.getCell('D'+(parseInt([$(".start_technology")[i].dataset.y])+1)).style["backgroundColor"] = '#FF751830'
                        myTableTGO.getCell('E'+(parseInt([$(".start_technology")[i].dataset.y])+1)).style["backgroundColor"] = '#FF751830'
                        myTableTGO.getCell('M'+(parseInt([$(".start_technology")[i].dataset.y])+1)).style["backgroundColor"] = '#FF751830'
                        myTableTGO.getCell('N'+(parseInt([$(".start_technology")[i].dataset.y])+1)).style["backgroundColor"] = '#FF751830'
                        myTableTGO.getCell('O'+(parseInt([$(".start_technology")[i].dataset.y])+1)).style["backgroundColor"] = '#FF751830'
                    }
                }
            }  
        }
        check_new_technology()

        function formatDate(inputDate) {
            var parts = inputDate.split('-');
            var formattedDate = parts[2] + '-' + parts[1] + '-' + parts[0];
            return formattedDate;
        }


        // СОГЛАСОВАНИЕ
        $('.save_1').hide()
        if ($(".requestUser").val() == $( "input[name='author']" ).val())
        {
            $('.sohlasovanie_edit_button1').on('click', function (e) {
                if ($('.dolznost1').find('input').length != 0)
                {
                    $('.sohlasovanie1').addClass('bg-warning') 
                    $('.dolznost1').html($('.dolznost1 input').val())
                    $('.company1').html($('.company1 input ').val())
                    $('.fio1').html('______________' + $('.fio1 input').val())
                    $('.date_1').html(formatDate($('.date_1').find('input').val()))
                    $('.save_1').hide()

                } else {
                    $('.sohlasovanie1').removeClass('bg-warning') 
                    $('.dolznost1').html('<input type="text"class="form-control col-md-6" value = "'+ $('.dolznost1').html() +'"placeholder="Должность">')
                    $('.company1').html('<input type="text"class="form-control col-md-6" value = "'+ $('.company1').html() +'"placeholder="Компания">')
                    $('.fio1').html('<input type="text"class="form-control col-md-6" value = "'+ $('.fio1').html().toString().replace('______________','') +'"placeholder="ФИО">')
                    $('.date_1').html('<input type="date" class="form-control col-md-6" value = "'+ formatDate($('.date_1').html()) +'"placeholder="Дата согласования">')
                    $('.save_1').show()
                }  
            })
        }
        
        $('.save_1').click(function() {
            $.ajax({             
                url: '/table_tgo/ajax_fields_tgo/',
                method : "post",
                dataType : "json",
                data: {
                    'update': [
                                [$('#tgo_id').val(), 'dolznost1', $('.dolznost1').find('input').val()],
                                [$('#tgo_id').val(), 'company1', $('.company1').find('input').val()],
                                [$('#tgo_id').val(), 'fio1', $('.fio1').find('input').val()],
                                [$('#tgo_id').val(), 'date_1', $('.date_1').find('input').val()],
                               ]
                },                           
                success: function () {  
                    toastr.success('успешно', 'Статус обновления');
                    $('.sohlasovanie_edit_button1').click()
                },
                error: function () {
                    $("#modal_alert").modal('show');
                    $("#modal_alert .modal-title").html('Упс, ошибка сервера');
                    $("#modal_alert .modal-body").html('Изменения не сохранены, пожалуйста повторите действия');
                    $("#modal_alert .btn-primary").html('Ок');
                }
            });
        })
        
       
        // УТВЕРЖДЕНИЕ
        $('.save_2').hide()
        if ($(".requestUser").val() == $( "input[name='author']" ).val())
        {
            $('.sohlasovanie_edit_button2').on('click', function (e) {
                if ($('.dolznost2').find('input').length != 0)
                {
                    $('.sohlasovanie2').addClass('bg-warning') 
                    $('.dolznost2').html($('.dolznost2 input').val())
                    $('.company2').html($('.company2 input ').val())
                    $('.fio2').html('______________' + $('.fio2 input').val())
                    $('.date_2').html(formatDate($('.date_2').find('input').val()))
                    $('.save_2').hide()

                } else {
                    $('.sohlasovanie2').removeClass('bg-warning') 
                    $('.dolznost2').html('<input type="text"class="form-control col-md-6" value = "'+ $('.dolznost2').html() +'"placeholder="Должность">')
                    $('.company2').html('<input type="text"class="form-control col-md-6" value = "'+ $('.company2').html() +'"placeholder="Компания">')
                    $('.fio2').html('<input type="text"class="form-control col-md-6" value = "'+ $('.fio2').html().toString().replace('______________','') +'"placeholder="ФИО">')
                    $('.date_2').html('<input type="date" class="form-control col-md-6" value = "'+ formatDate($('.date_2').html()) +'"placeholder="Дата согласования">')
                    $('.save_2').show()
                }  
            })
        }
        
        $('.save_2').click(function() {
            $.ajax({             
                url: '/table_tgo/ajax_fields_tgo/',
                method : "post",
                dataType : "json",
                data: {
                    'update': [
                                [$('#tgo_id').val(), 'dolznost2', $('.dolznost2').find('input').val()],
                                [$('#tgo_id').val(), 'company2', $('.company2').find('input').val()],
                                [$('#tgo_id').val(), 'fio2', $('.fio2').find('input').val()],
                                [$('#tgo_id').val(), 'date_2', $('.date_2').find('input').val()],
                               ]
                },                           
                success: function () {  
                    toastr.success('успешно', 'Статус обновления');
                    $('.sohlasovanie_edit_button2').click()
                },
                error: function () {
                    $("#modal_alert").modal('show');
                    $("#modal_alert .modal-title").html('Упс, ошибка сервера');
                    $("#modal_alert .modal-body").html('Изменения не сохранены, пожалуйста повторите действия');
                    $("#modal_alert .btn-primary").html('Ок');
                }
            });
        })
        

        if ($(".requestUser").val() == $( "input[name='author']" ).val())
        {
            $('.title_edit').on('click', function (e) {
                $('.edit_version').toggle('slow')
                $('.sohlasovanie1').toggle('slow')
                $('.sohlasovanie2').toggle('slow')
                $('.meta_tgo').toggle('slow')

                $('.sohlasovanie_edit_button1').click()
                $('.sohlasovanie_edit_button2').click()

                // $('.note_edit').click()
            })
        }

        // Примечания
        // $('.notes').html($('.notes').text().trim())
        // if ($('.notes').text() != '' )
        // {
        //     if ($(".requestUser").val() == $( "input[name='author']" ).val())
        //     {
        //         console.log($(".notes").attr("contenteditable"), 2)

        //         $(".notes").attr("contenteditable", "false");
        //         $(".notes").css("background-color", "#e7eaf6");
        //     }
        // } 

        
        // $('.note_edit').on('click', function (e) {
        //     console.log($(".notes").attr("contenteditable"), 2)
        //     if ($(".notes").attr("contenteditable") == 'false')
        //     {
        //         $(".notes").attr("contenteditable", "true");
        //         $(".notes").css("background-color", "white");

        //     } else {
        //         $(".notes").attr("contenteditable", "false");
        //         $(".notes").css("background-color", "#e7eaf6");
        //     }  
        // })
        


        $('.note_save').click(function() {
            var val =  $('.notes').html()
            console.log(val)
            $.ajax({             
                url: '/table_tgo/ajax_field_tgo/',
                method : "post",
                dataType : "json",
                data: {
                    'update': [$('#tgo_id').val(), 'notes', val]
                },                           
                success: function () {  
                    toastr.success('успешно', 'Статус обновления');
                },
                error: function () {
                    $("#modal_alert").modal('show');
                    $("#modal_alert .modal-title").html('Упс, ошибка сервера');
                    $("#modal_alert .modal-body").html('Изменения не сохранены, пожалуйста повторите действия');
                    $("#modal_alert .btn-primary").html('Ок');
                }
            });
        })
        
    
    
        
        if ( $('#status_merge').val() == 'open_add_technology')
        {
            technology_change_merge = $('#technology_change').val()
            order_change_merge = $('#order_change').val()
            status_graphic = 0
            addTechnology()            
        }

        //копируем select ресурсов
        var select_res = $("#text_save_status")
        .clone(true)
        .addClass("text_save_status")
        .css("display", "block")
        .attr('title', 'Этот значок отображает статус сохранения ваших действий, если вместо него стоит красный крестик, значит изменения не сохранились');
        //вставляем его куда надо
        $('.filters-jexcel_nested td[data-column=' + tr_filters.find('td')[1].dataset.column + ']').html(select_res)        
        // $("span:contains('HTML and jQuery')").css("color", "red");
    

        // Excel ----------------------------------------------------------------------------
        function setCellValueStyle(worksheet, row, column, value, style) {
            const cell = worksheet.getCell(row, column);
            cell.value = value;
            cell.style = style;
        }
        function setMaxColumnWidth(worksheet, exclude_row) {
            worksheet.columns.forEach((column) => {
              let maxWidth = 0;
              column.eachCell({ includeEmpty: true }, (cell) => {
                if (!exclude_row.includes(cell.row))
                {
                    const columnWidth = cell.value ? cell.value.toString().length : 10;
                    if (columnWidth > maxWidth) {
                        maxWidth = columnWidth;
                    }   
                }
                
              });
              
              column.width = maxWidth;
            });
        }
        function fillBlockData(worksheet, rowStart, colStart, blockData, style) {
            for (let i = 0; i < blockData.length; i++) {
                if (blockData[i].text === 'СОГЛАСОВАНО' || blockData[i].text === 'УТВЕРЖДАЮ') {
                    setCellValueStyle(worksheet, rowStart + i, colStart, blockData[i].text, blockData[i].style);
                } else {
                    setCellValueStyle(worksheet, rowStart + i, colStart, blockData[i].text, style);
                }
            }
        }
        
          
        function fillFullData(worksheet, rowStart, colStart, blockData, style) {
            for (let i = 0; i < blockData.length; i++) {
                setCellValueStyle(worksheet, rowStart + i, colStart, blockData[i], style);
            }
        }
        
        function convert_to_excel() {
            var workbook = new ExcelJS.Workbook();    
            var worksheet = workbook.addWorksheet('Main sheet', { state: 'visible' });        

            
              
            // Объединение ячеек и добавление заголовка
            worksheet.mergeCells('C1:J1');
            setCellValueStyle(
                worksheet,
                1,
                3,
                'Технологический график обслуживания: ' + $('#title').text(),
                {
                    font: { size: 18, bold: true, name: 'Arial' },
                    alignment: { horizontal: 'center' },
                }
            );
            
            const commonStyle = {
                font: { size: 12, bold: true, name: 'Arial' },
                alignment: { horizontal: 'center' },
            };
            const my_style = {
                font: { size: 12, bold: false, name: 'Arial' },
                alignment: {
                    horizontal: 'left', // Горизонтальное выравнивание по левому краю
                }
            };
              
            // Массив данных для первого блока "Согласовано"
            // Массив данных для первого блока "Согласовано"
            var data_1 = [
                { text: 'СОГЛАСОВАНО', style: commonStyle},
                { text: $('.dolznost1').text(), style: my_style },
                { text: $('.company1').text(), style: my_style },
                { text: ($('.fio1').text() || ''), style: my_style },
                { text: formatDate_excel_tgo($('.date_1').html()), style: my_style },
            ];

            // Массив данных для второго блока "Утверждаю"
            var data_2 = [
                { text: 'УТВЕРЖДАЮ', style: commonStyle },
                { text: $('.dolznost2').text(), style: my_style },
                { text: $('.company2').text(), style: my_style },
                { text: ($('.fio2').text() || ''), style: my_style },
                { text: formatDate_excel_tgo($('.date_2').html()), style: my_style },
            ];

            fillBlockData(worksheet, 4, 3, data_1, my_style);
            fillBlockData(worksheet, 4, 9, data_2, my_style);
            
            var rowStart = 10;
            var rowStart_col_2 = 10;
            var colStart = 3;
            var col_2 = 9;
            var dataBlocks = [
                { selector: '.excel_data_1', col: colStart, startRow: rowStart, add_row: false },
                { selector: '.excel_data_2', col: colStart + 1, startRow: rowStart , add_row: true },
                { selector: '.excel_data_3', col: colStart, startRow: rowStart , add_row: false },
                { selector: '.excel_data_4', col: colStart + 1, startRow: rowStart , add_row: true },
                { selector: '.excel_data_5', col: colStart, startRow: rowStart , add_row: false },
                { selector: '.excel_data_6', col: colStart + 1, startRow: rowStart , add_row: true },
                { selector: '.excel_data_7', col: col_2, startRow: rowStart_col_2, add_row: false  },
                { selector: '.excel_data_8', col: col_2, startRow: rowStart_col_2 , add_row: true },
                { selector: '.excel_data_9', col: col_2, startRow: rowStart_col_2 , add_row: false },
                { selector: '.excel_data_10', col: col_2, startRow: rowStart_col_2 , add_row: true }
            ];
            
            for (var i = 0; i < dataBlocks.length; i++) {
                var block = dataBlocks[i];
                var data = $.trim($(block.selector).text()).split(',').map(element => element.trim());

                if (block.col === col_2) {
                    if (block.add_row)
                    {                    
                        fillFullData(worksheet, rowStart_col_2, block.col+1, data, my_style);
                        rowStart_col_2 += data.length;
                    } else {
                        fillFullData(worksheet, rowStart_col_2, block.col, data, my_style);
                    }
                } else {
                    fillFullData(worksheet, rowStart, block.col, data, my_style);
                    if (block.add_row)
                    {
                        rowStart += data.length;
                    }
                }
            }

           


            // JEXCELL--------------------------------------------------
            var header_jexcel = []
            $('thead.resizable tr.jexcel_nested td').map((index, header) => {
               if( $.trim($(header).text()) != 'Удалить' && $.trim($(header).text()) != 'Изменить' && $.trim($(header).text()) != 'Технология')
               {
                    const cell = worksheet.getCell(rowStart, 1+index);
                    if($(header).text() != '')
                    {
                        header_jexcel.push($(header).text())
                        cell.value = $(header).text();
                        cell.style = {
                            font: { size: 10, bold: true, name: 'Arial' },
                            alignment: { horizontal: 'center' },
                            border: {
                                top: { style: 'thin' },    // Верхняя граница
                                left: { style: 'thin' },   // Левая граница
                                bottom: { style: 'thin' }, // Нижняя граница
                                right: { style: 'thin' }   // Правая граница
                            }
                        };   
                    }
                }
            });
            rowStart++;

            const dict_jexcel_excel = {};
            const chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

            for (let i = 0; i < chars.length; i++) {
                dict_jexcel_excel[i] = chars[i];
            }
            var max_len_order = 0
            const tgo_size = myTableTGO.getColumnData([0]).length
            for (var i = 0; i < tgo_size; i++) {  
                res = myTableTGO.getRowData(i);
                var x = i+1
                if (typeof res !== 'undefined')
                {
                    if (res[0] !== '')
                    {
                         if (!$($('.jexcel_overflow tbody tr')[i])[0].style.cssText.includes('none')){
                            // обход стобцов
                            for (var j = 0; j <= 8; j++) {  
                                if (!myTableTGO.getLabel(dict_jexcel_excel[j] + x).includes('span')) {
                                    // Извлекаем значения RGB из строки
                                    var argbString = ''
                                    try {
                                        const rgbValues = myTableTGO.getCell(dict_jexcel_excel[j] +x).style['backgroundColor'].match(/\d+/g);
                                        const red = parseInt(rgbValues[0]);
                                        const green = parseInt(rgbValues[1]);
                                        const blue = parseInt(rgbValues[2]);

                                        // Задаем значение Alpha (например, полная непрозрачность)
                                        const alpha = 255;

                                        const redHex = componentToHex(red);
                                        const greenHex = componentToHex(green);
                                        const blueHex = componentToHex(blue);
                                        const alphaHex = componentToHex(alpha);

                                        // Собираем ARGB-строку
                                        argbString = `${alphaHex}${redHex}${greenHex}${blueHex}`.toUpperCase();
                                    } catch (error) {
                                        argbString = ''
                                    }

                                    if (['Пункт'].includes(header_jexcel[j])) {
                                        
                                        if (max_len_order < parseInt( myTableTGO.getLabel(dict_jexcel_excel[j] + x).length)+1) {
                                            max_len_order = parseInt( myTableTGO.getLabel(dict_jexcel_excel[j] + x).length)+1;
                                        }
                                    }

                                    var alignment_jexcel_td = { horizontal: 'center' }
                                    
                                    if (['Операция', 'Ресурс', 'Подразделения'].includes(header_jexcel[j]))
                                    {
                                        alignment_jexcel_td = { horizontal: 'left' }
                                    }
                                    
                                    setCellValueStyle(
                                        worksheet,
                                        rowStart,
                                        2+j,
                                        myTableTGO.getLabel(dict_jexcel_excel[j] + x),
                                        {
                                            font: { size: 10, bold: false, name: 'Arial' },
                                            alignment: alignment_jexcel_td,
                                            fill: {
                                                type: 'pattern',
                                                pattern: 'solid',   
                                                fgColor: { argb: argbString } // Red color in ARGB format
                                            },
                                            border: {
                                                top: { style: 'thin' },    // Верхняя граница
                                                left: { style: 'thin' },   // Левая граница
                                                bottom: { style: 'thin' }, // Нижняя граница
                                                right: { style: 'thin' }   // Правая граница
                                            }
                                        }
                                    );
                                } else {
                                    // если это кнопка, то пропускаем ее
                                    setCellValueStyle(
                                        worksheet,
                                        rowStart,
                                        2+j,
                                        '',
                                        {
                                            font: { size: 10, bold: false, name: 'Arial' },
                                            border: {
                                                top: { style: 'thin' },    // Верхняя граница
                                                left: { style: 'thin' },   // Левая граница
                                                bottom: { style: 'thin' }, // Нижняя граница
                                                right: { style: 'thin' }   // Правая граница
                                            }
                                        }
                                    );
                                }
                            }
                            rowStart++;
                        }
                    }
                }
            }
            // JEXCEL END --------------------------------------------------

            
            //  Notes -----------------------------------------------------------
            data_1 = $('.notes').html().trim().split('<div>').map(function(item) {
                return $.trim(item.split('</div>').join(' ').split('<br>')[0]);
            });   
            if (data_1[0] != 'Примечания...')
            {
                data_1.unshift('Примечания:');
            } 
            fillFullData(worksheet, rowStart, 2, data_1, {
                font: { size: 12, bold: false, name: 'Arial' },
                alignment: {
                    horizontal: 'left', 
                }
            });
            rowStart += data_1.length
            // Notes END --------------------------------------------------


            //  CHART.JS -----------------------------------------------------------

            // Получаем HTML-элемент canvas из объекта jQuery
            var canvas = $('#oneChart')[0];

            // Получаем 2D контекст рисования
            var ctx = canvas.getContext('2d');

            // Рисуем график с использованием Chart.js
            // Ваш код для создания графика на canvas с Chart.js

            // Теперь, когда график нарисован на canvas, вы можете преобразовать его в base64 изображение
            var base64Image = canvas.toDataURL();

            // Добавляем изображение в Excel с использованием библиотеки ExcelJS (пример)
            var imageId = workbook.addImage({
                base64: base64Image,
                extension: 'png',
            });

            const cellWidth = 35; // Ширина одной ячейки (замените на свое значение)
            const cellHeight = 3; // Высота одной ячейки (замените на свое значение)

            const numColsOccupied = Math.ceil(canvas.width / cellWidth)/8;
            var row_end = rowStart + Math.ceil(canvas.height / cellHeight)/11;

            worksheet.addImage(imageId, {
                tl: { col: 1, row: rowStart },
                br: { col: 1 + numColsOccupied - 1, row: row_end }
            });
            
            // Определите диапазон ячеек
            const startCol = 1;
            const endCol = 1 + numColsOccupied - 1;
           

            // Установите цвет границы в белый для указанного диапазона ячеек
            for (let col = startCol; col <= endCol; col++) {
                for (let row = rowStart; row <= row_end; row++) {
                    const cell = worksheet.getCell(`${String.fromCharCode(64 + col)}${row}`);
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFFFFFFF' } }, // Устанавливаем белый цвет границы
                        left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                        bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                        right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
                    };
                }
            }
            //  CHART.JS -----------------------------------------------------------
            

   

            // Задаем ширину стобцов
            var exclude_row = [1, 14, 16]
            setMaxColumnWidth(worksheet, exclude_row) 
            worksheet.getColumn(1).width = 3
            worksheet.getColumn(2).width = parseInt(max_len_order)*2-2
            worksheet.getColumn(5).width = 15
            worksheet.getColumn(6).width = 15
            worksheet.getColumn(7).width = 15
            worksheet.getColumn(8).width = 15
            worksheet.getColumn(9).width = 30
              
            worksheet.pageSetup.fitToPage = true;
            worksheet.pageSetup.fitToWidth = 1; // 1 страница по ширине
            worksheet.pageSetup.fitToHeight = 0; // По высоте масштабируется автоматически


            workbook.xlsx.writeBuffer().then(function(buffer) {
                saveAs(new Blob([buffer], { type: "application/octet-stream" }),  'ТГО ' + $('#title').text()+'.xlsx');
            });
        }
        var toast=false
        saveTime()
    }
    // $('.jexcel_overflow').html($('.tgo_home_notes').text())
    
        //переносим примечания в конец
        var htmlContent = $('.tgo_home_notes').text();
        $('.jexcel_overflow').after(htmlContent);

});

