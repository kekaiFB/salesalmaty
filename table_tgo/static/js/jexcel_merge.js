$(document).ready(function () {
    if (window.location.href.search('/merge_technology_list/') >= 0 )
    {
        $("body").css("opacity", 0);

        // Инструкции
        $(".merge_instructions").hide();
        $('.edit_merge').on('click', function () {
            $(".merge_instructions").toggle(300,'linear');
        });
        var start_counter_jecxel_table = parseInt($('.jexcelTable')[0].className.split('_')[$('.jexcelTable')[0].className.split('_').length - 1])
        var size = $('.jexcelTable').length
        var myTable
        var dict_links
        var dict_links_all = {}
        var var_table_dict = {}
        var index_merge = 0
        for (var i=0; i<size; i++)
        {
            dict_links = {}
            // //Берем нашу HTML таблицу и конвертируем в 2d массив    
            var myTableArray = [];
            $('.jexcel_'+(parseInt(start_counter_jecxel_table)+i).toString()+' tr').each(function() {
                var rowDataArray = [];
                var actualData = $(this).find('td');
                if (actualData.length > 0) {
                    actualData.each(function() {
                        rowDataArray.push($(this).html());
                    });
                    myTableArray.push(rowDataArray);
                }
            });
            var all_index_parent_row = []
            var new_cellName = '';
            var time_start_cellName_arr = [];
            var cell_pos = 0;
            var value = []
            var rowOp = []
            var loaded = function(instance) {//при изменении таблицы
                updateMyTable()
            }
    
            var options = {
                data: myTableArray,
                rowResize: true,
                columns: [
                    { type:'text', width: 1, readOnly:true,},
                    { type:'text', width: 240, readOnly:true,},
                    { type:'text', width: 240, readOnly:true,},
                    { type:'text', width: 100, readOnly:true,},
                    { type:'text', width: 150},
                    { type:'text', width: 100, mask:'0:00'},
                    { type:'text', width: 100, mask:'0:00'},
                    { type:'text', width: 150, mask:'0:00'},
                    { type:'text', width: 1, readOnly:true,},
                    { type:'text', width: 1, readOnly:true,},
                    { type:'text', width: 1, readOnly:true},
                ],
            
                nestedHeaders:[
                    [
                        {
                            title: '',
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
                            title: '',
                            colspan: '1',
                        },
                        {
                            title: '',
                            colspan: '1',
                        },  
                        {
                            title: '',
                            colspan: '1',
                        },
                    ],
                ],
            
            
                updateTable:function(instance, cell, col, row, val, label, cellName) {
                    cell.style.color = 'black'
                    //выделяем операции особым цветом
                    if (col == 0 || col == 9 || col == 10) {
                            cell.style.visibility = 'hidden';
                    }
                    if (col == 2) {
                        if( cell.innerText != '' && cell.innerText != 'Окончание')
                        {
                            rowOp.push(row)
                            cell.style.backgroundColor = '#edf3ff';
                        }
                    }
            
                    //выделяем окончание особым цветом
                    if (label == 'Окончание') {
                        cell.style.backgroundColor = '#f46e42';
                        cell.style.color = '#ffffff';
                    }
                
                    //выделяем колонки со временем особым цветом
                    if((col == 5 || col == 6 || col == 7) &&  cell.innerText != '' ){
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
            myTable = jspreadsheet(document.getElementById('newJexcel_jexcel_'+(parseInt(start_counter_jecxel_table)+i).toString()), options)
            
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
            
            
            var status = false
            // заменяем переменные ссылками (при изменении данных)
            //Если мы не нашли такого id, заменяем на НОЛЬ
            function replace_id_in_links () {
                var after_save_cell = ['_ressourceoperation', '_RESSOURCEOPERATION', '_tgo_object', '_TGO_OBJECT'] 
                dict_elements = {}
                for (var i = 0; i < myTable.getColumnData([0]).length; i++) 
                { 
                    if (typeof myTable.getRowData([i]) !== 'undefined' && myTable.getRowData([i])[10] != '')
                    {
                        if(myTable.getRowData([i])[1] != '') // операция
                        {
                            dict_elements['tgo_object_'+myTable.getRowData([i])[8]] = i+1
                        } else {
                            dict_elements['ressourceoperation_'+myTable.getRowData([i])[8]] = i+1
                        } 
                    }
                }
                
                for (var i = 0; i < myTable.getColumnData([0]).length; i++) 
                { 
                    var result = myTable.getRowData([i]);
                    if (typeof myTable.getRowData([i]) !== 'undefined' && myTable.getRowData([i])[10] != '')
                    {           
                        for (var z = 5; z < 8; z++) { 
                            if (typeof myTable.getRowData([i])[z] !== 'undefined')
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
                                    var valuee = myTable.getRowData([i])[z].replaceAll(/[+-/*=()]/g, ' ').split(' ') 
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
                                    var old_value_cell = myTable.getRowData([i])[z]
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
                                    myTable.setValue(coords[z] + x, old_value_cell.join('').toUpperCase())    
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
                    for (var i = 0; i < myTable.getColumnData([0]).length; i++) 
                    { 
                        var result = myTable.getRowData([i]);
                        if (typeof myTable.getRowData([i]) !== 'undefined' && myTable.getRowData([i])[10] != '')
                        {
                            for (var z = 5; z < 8; z++) { 
                                if (typeof myTable.getRowData([i])[z] !== 'undefined')
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
                                        var valuee = myTable.getRowData([i])[z].replaceAll(/[+-/*=()]/g, ' ').split(' ') 
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
                                        var old_value_cell = myTable.getRowData([i])[z]     
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
                                                old_value_cell[m] = 0
                                            }
                                        }                                 
                                        myTable.setValue(coords[z] + x, old_value_cell.join(''))
                                    }
                                }
                            }
                        }
                    }
                }
            }
            replace_id_in_links()            
            // off click right mouse
            $("body").on("contextmenu",function(e){
                return false;
            });
            if (!$('.jexcelTable')[i].className.split(' ').includes('jexcelMerge'))
            {
                $('#newJexcel_jexcel_'+(parseInt(start_counter_jecxel_table)+i).toString())
                .find('.jexcel_content')
                .find('table')
                .find('tbody')
                .find('td[data-x="4"]')
                .addClass('readonly')
                
                $('#newJexcel_jexcel_'+(parseInt(start_counter_jecxel_table)+i).toString())
                .find('.jexcel_content')
                .find('table')
                .find('tbody')
                .find('td[data-x="5"]')
                .addClass('readonly')
                
                $('#newJexcel_jexcel_'+(parseInt(start_counter_jecxel_table)+i).toString())
                .find('.jexcel_content')
                .find('table')
                .find('tbody')
                .find('td[data-x="6"]')
                .addClass('readonly')
                
                $('#newJexcel_jexcel_'+(parseInt(start_counter_jecxel_table)+i).toString())
                .find('.jexcel_content')
                .find('table')
                .find('tbody')
                .find('td[data-x="7"]')
                .addClass('readonly')
            } else {
                for (var q = 0; q < myTable.getColumnData([0]).length; q++)  // сохраняем все элементы, чтоб при слиянии была возможность обратно перевести в id
                { 
                    var x = q + 1
                    if(myTable.getRowData([q])[9] != '') // существуют данные
                    {  
                        if(myTable.getRowData([q])[1] != '') // операция
                        {    
                            dict_links[coords[5] + x]='tgo_object_'+myTable.getRowData([q])[8]
                            dict_links[coords[6] + x]='tgo_object_'+myTable.getRowData([q])[8]
                            dict_links[coords[7] + x]='tgo_object_'+myTable.getRowData([q])[8]             
                            
                        } else {
                            dict_links[coords[5] + x]='ressourceoperation_'+myTable.getRowData([q])[8]   
                            dict_links[coords[6] + x]='ressourceoperation_'+myTable.getRowData([q])[8]   
                            dict_links[coords[7] + x]='ressourceoperation_'+myTable.getRowData([q])[8]     
                        } 
                    }
                }
                index_merge ++;
                var_table_dict[index_merge]=myTable  
                dict_links_all[index_merge]=dict_links     
                $('#newJexcel_jexcel_'+(parseInt(start_counter_jecxel_table)+i).toString())
                .find('.jexcel_content')
                .find('table')
                .find('tbody')
                .addClass('jexcel_draggable_megre')
            }

            
            function updateMyTable() {
            for (var i = 0; i < myTable.getColumnData([0]).length; i++) {
                //ячейки со временем, которые являются родителями 
                res = myTable.getValue(time_start_cellName_arr[i]);
            
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
                        if (myTable.getRowData([i])[cell][0] == '=')
                        {
                            all_cells_in_cell = myTable.getRowData([i])[cell]
                            .replaceAll(/[+-/*=()]/g, ' ')
                            .split(' ')  
                            
                            //синим цветом
                            for (var v = 0; v <= all_cells_in_cell.length; v++) {
                                //ячейка ссылается на родительскую
                                if ($.inArray(all_cells_in_cell[v], all_index_parent_row) != -1)
                                {
                                    if (i+1 != parseInt(all_cells_in_cell[v].substring(1, all_cells_in_cell[v].length))) {
                                        var this_cell_child = coords[cell] + parseInt(i+1);
                                        myTable.getCell(this_cell_child).style["backgroundColor"] = '#E0FFFF'
                                    }
                                }
                            }
                    
                        }  
                        
                        if (myTable.getRowData([i])[cell][0] == '=')
                        {  
                            all_cells_in_cell = myTable.getRowData([i])[cell]
                                                .replaceAll(/[+-/*=()]/g, ' ')
                                                .split(' ')  
                            var this_parent = coords[cell] + index_parent_row 

                            //ячейка ссылается на родительскую
                            if ($.inArray(this_parent, all_cells_in_cell) != -1)
                            {
                                var this_cell_child = coords[cell] + parseInt(i+1);
                                childColor(myTable, this_cell_child)
                            }
                            
                        }    
                    }


                    
                } else //дочерние ячейки
                {
                    for (var cell = 5; cell <= 7; cell++) {
                        //если время является формулой
                        if (myTable.getRowData([i])[cell][0] == '=')
                        {  
                            all_cells_in_cell = myTable.getRowData([i])[cell]
                                                .replaceAll(/[+-/*=()]/g, ' ')
                                                .split(' ')  
                            var this_parent = coords[cell] + index_parent_row 

                            //ячейка ссылается на родительскую
                            if ($.inArray(this_parent, all_cells_in_cell) != -1)
                            {
                                var this_cell_child = coords[cell] + parseInt(i+1);
                                childColor(myTable, this_cell_child)
                            }
                            
                        }    
                    }
                }
            }
        }
        function childColor(table, child){
            // if (table.getCell(child).style["backgroundColor"] != 'rgb(216, 191, 216)')
            table.getCell(child).style["backgroundColor"] = '#91DFAB'
        }

        updateMyTable()
        
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
                cells_focused_input = myTable
                                    .getRowData($(this)[0].dataset.y)[$(this)[0].dataset.x]
                                    .toString()
                                    .replaceAll(/[+-/*=()]/g, ' ')
                                    .split(' ')
                focused_cell_value = myTable.getRowData($(this)[0].dataset.y)[$(this)[0].dataset.x]
                cells_focused_input.map(function(val) {
                    myTable.setStyle(val, 'border', '1px solid blue');
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
                    myTable.setStyle(val, 'border', '1px solid white');
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
                    myTable.setStyle(val, 'border', '1px solid white');
                });
            }
            
        );   
        }
        
        $('.cancel_tables_button').on('click', function () {
            if ($(this).text() == '✅')
            {
                $(this).html('✖️'+ $('.operation_'+$(this)[0].className.split(' ')[0].split('_')[1]).text()+' (не используется)')
                $(this).removeClass('alert-success')
                $(this).addClass('alert-primary')
                $('.'+$(this)[0].className.split(' ')[0]+'_allTable').hide()

                
            } else {
                $(this).html('✅')
                $(this).removeClass('alert-primary')
                $(this).addClass('alert-success')
                $('.'+$(this)[0].className.split(' ')[0]+'_allTable').show()
            }
            
        });
        
        // слияние
        var array_merge
        var all_array_merge

        var saved_cell_modify
        function set_save_cells_merge(tr_all, save_cell, index_table) {
            tr_all.each(function() {
                if ($($(this).find('td')[11]).text() != '')
                {
                    var actualData = $(this).find('td');
                    if (actualData.length > 0) {
                        actualData.each(function(index, val) {
                            if (index==6 || index==7 || index==8) {

                                saved_cell_modify =  var_table_dict[index_table].getValue(save_cell).toString()
                                .split(/([+])/).join(' ')
                                .split(/([-])/).join(' ')
                                .split(/([*])/).join(' ')
                                .split(/([/])/).join(' ')
                                .split(/([=])/).join(' ')
                                .split(/([(])/).join(' ')
                                .split(/([)])/).join(' ').split(' ')

                                if (saved_cell_modify.length>1){
                                    for (var m = 0; m < saved_cell_modify.length; m++) { 
                                        if (typeof dict_links_all[index_table][saved_cell_modify[m]] !== 'undefined' )
                                        {
                                            saved_cell_modify[m] =  saved_cell_modify[m][0] +'_'+ dict_links_all[index_table][saved_cell_modify[m]]
                                        }
                                    }  
                                } 
                                saved_cell_modify = saved_cell_modify.join('')      
                            }  
                        });
                    }
                }
            });
            return saved_cell_modify
        }    

        $('.merge_finish').on('click', function () {
            all_array_merge = []
            for (var i=0; i<$('.jexcel_draggable_megre').length; i++)
            {
                array_merge = []
                if ($($('.jexcel_draggable_megre')[i]).is(':visible')) // если используем таблицу для слияния
                {
                    $($('.jexcel_draggable_megre')[i]).find('tr').each(function() {
                        if ($($(this).find('td')[11]).text() != '')
                        {
                            var rowDataArray = [];
                            var actualData = $(this).find('td');
                            if (actualData.length > 0) {
                                actualData.each(function(index, val) {
                                    if (index!=0 && index!=6 && index!=7 && index!=8)
                                    {
                                        rowDataArray.push($(this).html());
                                    } else if (index==6 || index==7 || index==8) {
                                        rowDataArray.push(
                                            set_save_cells_merge($($('.jexcel_draggable_megre')[i]).find('tr'), coords[parseInt(val.dataset.x)]+(parseInt(val.dataset.y)+1), i+1 )
                                        )
                                    } 
                                });
                                array_merge.push(rowDataArray);
                            }
                        }
                    });
                }
                all_array_merge.push([array_merge, 'new_table'])
            }
            $.ajax({             
                url: '/table_tgo/ajax_merge_technology/',
                method : "post",
                dataType : "json",
                data: {
                    'all_array_merge': all_array_merge, 
                    'tgo': $('#id_tgo').val(), 
                    'author': $( "input.requestUser" ).val(), 
                },                
                success: function () {  
                    window.location.href = '/table_tgo/tgo/'+ $('#tgo_title').val() +'/'+ $('#id_tgo').val()+'/' 
                    $("#modal_alert").modal('show');
                    $("#modal_alert .modal-title").html('Успешное слияние');
                    $("#modal_alert .modal-body").html('Перенаправляем вас на ТГО');
                    $("#modal_alert .btn-primary").html('Ок');
                },
                error: function () {
                    $("#modal_alert").modal('show');
                    $("#modal_alert .modal-title").html('Упс, ошибка сервера');
                    $("#modal_alert .modal-body").html('Изменения не сохранены, пожалуйста повторите действия или обновите страницу');
                    $("#modal_alert .btn-primary").html('Ок');
                }
            });  
        });
    }
});

