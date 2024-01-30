$(document).ready(function () {

    if(window.location.href.search('timetable/timetable_week_group') >= 0)
    {     
        var groupColumn = 0;
        var timetable_week_group = $('#timetable_week_group').DataTable({
            "dom": 'ftipr',
            
            order: [[groupColumn, 'asc']],
            //--------------------Память фильторв---------------------------
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
                                .before('<tr class="group bg-secondary p-2 opacity-50"><td colspan="24" class="h4 text-warning">' + group.substring(2) + '</td></tr>');
    
                            last = group;
                        }
                    });
            },

            });
            // timetable_week_group.column( 0 ).visible( false );
            timetable_week_group.column(timetable_week_group.columns().indexes().length - 1).visible( false );
            analitics_dt = timetable_week_group;

            $('#timetable_week_group tbody').on('click', 'tr.group', function () {
                var currentOrder = timetable_week_group.order()[0];
                if (currentOrder[0] === groupColumn && currentOrder[1] === 'asc') {
                    timetable_week_group.order([groupColumn, 'desc']).draw();
                } else {
                    timetable_week_group.order([groupColumn, 'asc']).draw();
                }
            });

            //Сбросить фильтры
            $('#timetable_week_group-resetFilter').on('click', function (e) {
                
                var tableId = timetable_week_group.table().node().id;
        
                for (var i = localStorage.length - 1; i >= 0; i--) {
                    var key = localStorage.key(i);
                    var pattern = new RegExp('^' + window.location.href + '_' + tableId + '.*');
                    if (pattern.test(key)) {
                        localStorage.removeItem(key);
                    }
                }
                

                timetable_week_group.state.clear();
                location.reload()
            });

            //Выбор строки при клике 
            $('#timetable_week_group tbody').on('click', 'tr', function () {
            if ($(this).hasClass('selected')) {
                //удаляю у не выбранных кнопок класс
                $(this).find('td span, button').removeClass("text-white");
                $(this).find('td span, button').addClass("text-black");

                $(this).find('td button').removeClass("btn-warning");
                $(this).find('td button').addClass("btn-outline-warning");
            } else {
                //удаляю у не выбранных кнопок класс
                timetable_week_group.$('tr').find('td span, button').removeClass("text-white");
                timetable_week_group.$('tr').find('td span, button').addClass("text-black");
                timetable_week_group.$('tr').find('td .copyTGO').removeClass("text-white");
                timetable_week_group.$('tr').find('td .copyTGO').addClass("text-black");

                timetable_week_group.$('tr').find('td button').removeClass("btn-warning");
                timetable_week_group.$('tr').find('td button').addClass("btn-outline-warning");

                $(this).find('td span, button').removeClass("text-black");
                $(this).find('td span, button').addClass("text-white");

                $(this).find('td').removeClass("btn-outline-warning");
                $(this).find('td button').addClass("btn-warning");
            }
        });


        //Выбранная строка при перезугрзке страницы
        if(typeof savedSelected_row !== "undefined" && savedSelected_row.length !== 0){
            timetable_week_group.row(savedSelected_row).select()

            $('#timetable_week_group tbody .selected').find('td .copyTGO').removeClass("text-black");
            $('#timetable_week_group tbody .selected').find('td .copyTGO').addClass("text-white");
            $('#timetable_week_group tbody .selected').find('td span, button').removeClass("text-black");
            $('#timetable_week_group tbody .selected').find('td span, button').addClass("text-white");
            $('#timetable_week_group tbody .selected').find('td').removeClass("btn-outline-warning");
            $('#timetable_week_group tbody .selected').find('td button').addClass("btn-warning");
        } 
        
               
        var columnNames = [];
        $('#timetable_week_group thead th').each(function() {
            columnNames.push($(this).text());
        });

            
        const append_icon_to_pah = '.dataTables_filter'    
        const insert_additional_options_path = '.insert_additional_options_after_path'
        init_additional_options(
            timetable_week_group, append_icon_to_pah, insert_additional_options_path,
             insert_after=true, flag_date=true,
              columns_date=[columnNames.indexOf('С'), columnNames.indexOf('По')],
              excluded_dates_col=columnNames.indexOf('Исключенные даты'), additional_dates_col=columnNames.indexOf('Дополнительные даты'),
        ) 
        

        //Каскадные фильтры
        var selected_val_column = {}
        var column_active = -1
        init_dt_select(timetable_week_group, selected_val_column, column_active)   
        



         // Excel ----------------------------------------------------------------------------
         // Вспомогательные функции остаются без изменений, так как они переиспользуются и выполняют конкретные действия
        function setCellValueStyle(worksheet, row, col, value, style) {
            let cell = worksheet.getCell(row, col);
            cell.value = value;
            cell.style = style;
        }
        function decodeHtmlEntity(str) {
            var textArea = document.createElement("textarea");
            textArea.innerHTML = str;
            return textArea.value;
        }

        // Функция для добавления ячейки в worksheet
        function addCell(worksheet, row, col, value, colspan = 1, rowspan = 1) {
            if (value === '') return;  // Не добавлять ячейку, если значение пустое
            let cell = worksheet.getCell(row, col);
            cell.value = value;
            if (colspan > 1 || rowspan > 1) {
                worksheet.mergeCells(row, col, row + rowspan - 1, col + colspan - 1);
            }
            // Устанавливаем стили для всех ячеек в объединенной группе
            for (let i = row; i < row + rowspan; i++) {
                for (let j = col; j < col + colspan; j++) {
                    let cell = worksheet.getCell(i, j);
                    cell.style = {
                        font: { size: 10, bold: false, name: 'Arial' },
                        alignment: { horizontal: 'center' },
                        border: {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    };
                }
            }
        }

        function getUniqueSheetData() {
            // Этот метод должен возвращать данные, необходимые для создания каждого уникального листа.
            // Он должен обрабатывать исходные данные и извлекать из них информацию для каждого листа.
            let sheetNames = [];
        
            timetable_week_group.rows({ search: "applied" }).data().each(function (data, index) {
                var groupName = data[0];
                var parts = groupName.split(" ");
                if (parts.length > 1) {
                    groupName = parts[1];
                }
                if (sheetNames.indexOf(groupName) === -1) {
                    sheetNames.push(groupName);
                }
            });
        
            // Возвращает массив уникальных имен листов
            return sheetNames;
        }
        function processDataForSheet(worksheet, sheetData) {
        
            // Установка стиля и значения ячейки
            setCellValueStyle(
                worksheet,
                1,
                2,
                sheetData,
                {
                    font: { size: 14, bold: true, name: 'Arial' },
                    alignment: { horizontal: 'left' },
                }
            );

            var rowStart = 3;
            var rowStart_col_2 = 10;
            var colStart = 3;
            var col_2 = 9;
            

            // DataTable--------------------------------------------------
            var header_dataTable = []
            exclude_col = ['День', 'Дни полетов', 'Удалить', 'Изменить', 'ID']

            let rowspanCounters = [];  // Массив для отслеживания оставшихся объединенных строк для каждого столбца
            var word_substring = {
                'Начало Регистрации': 'Нач. рег.',
                'Конец Регистрации': 'Конец рег.',
                'Количество кресел': 'Кол-во крес.',
                'Следующий день': 'След. день',
                'Базовый аэропорт': 'АП',
                'Период (дни)': 'Дни',
            }
            var alignment_col = []

            var set_col_index = {
                'Нач. рег.': 0,
                'Конец рег.': 0,
                'Кол-во крес.': 0,
                'След. день': 0,
            }
            var get_col_index = {
                'Прилет из': 0,
            }
            var aligment_col_name_header = ['Прилет из', 'Вылет в', 'Тип', 'Авиакомпания', 'Комментарий']
            $('#timetable_week_group tfoot tr').each((rowIndex, tr) => {
                let columnCounter = 2;
                $(tr).find('th').each((colIndex, th) => {
                    // Пропустить этот столбец, если он еще объединен с предыдущей строкой
                    while (rowspanCounters[columnCounter] > 0) {
                        rowspanCounters[columnCounter] -= 1;
                        columnCounter += 1;
                    }

                    if(!exclude_col.includes($(th).text())) {
                        let colspan = $(th).attr('colspan') ? parseInt($(th).attr('colspan')) : 1;
                        let rowspan = $(th).attr('rowspan') ? parseInt($(th).attr('rowspan')) : 1;

                        // Обновить массив rowspanCounters
                        for (let i = columnCounter; i < columnCounter + colspan; i++) {
                            rowspanCounters[i] = (rowspanCounters[i] || 0) + rowspan - 1;
                        }

                        var text = $(th).text()

                        // сокращаем текст
                        if(word_substring[text])
                        {
                            text = word_substring[text]
                        }

                        // что центрируем по левому краю
                        if (aligment_col_name_header.includes(text))
                        {
                            alignment_col.push({'col': columnCounter, 'alignment': 'left', })
                        }


                        // берем индексы стобцов ширину которых нужно поменять на определенную
                        if(set_col_index[text]==0)
                        {
                            set_col_index[text] = columnCounter
                        }
                        if(get_col_index[text]==0)
                        {
                            get_col_index[text] = columnCounter
                        }


                        // заносим данные в эксель
                        addCell(worksheet, rowStart + rowIndex, columnCounter, text, colspan, rowspan);

                        columnCounter += colspan;
                    }
                });
            });





            rowStart++;

            

            var exclude_col_index = []
            var get_value_html_columns = ['ТГО']
            var get_value_html_columns_index = []
            timetable_week_group.columns().every(function(index) {
                var column = this;
                var columnHeader = $(column.footer()).text();

                if (exclude_col.includes(columnHeader)) {
                    exclude_col_index.push(index);
                }

                if (get_value_html_columns.includes(columnHeader)) {
                    get_value_html_columns_index.push(index);
                }
            });




            timetable_week_group.rows({ search: 'applied' }).data().each(function (val, rowIndex) {
                var fake_colIndex = 0

                if (val[0].includes(sheetData)) 
                {
                    for (let colIndex = 0; colIndex < val.length; colIndex++) {
                        if (timetable_week_group.column(colIndex).visible())
                        {
                            if (!exclude_col_index.includes(colIndex)) {
                                // Декодирование HTML-сущностей
                                let cellData = decodeHtmlEntity(val[colIndex]);
                   
                                
                                if (get_value_html_columns_index.includes(colIndex)) {
                                    if ($(cellData).text() != '')
                                    {
                                        cellData = $(cellData).text()
                                    } else {
                                        cellData = ''
                                    }
                                }

                                // check_row_data.push({'cellData': cellData, 'rowStart': rowStart})
                                setCellValueStyle(worksheet, rowStart, fake_colIndex + 2, cellData, {
                                    font: { size: 10, bold: false, name: 'Arial' },
                                    alignment: { horizontal: 'center' },
                                    border: {
                                        top: { style: 'thin' },
                                        left: { style: 'thin' },
                                        bottom: { style: 'thin' },
                                        right: { style: 'thin' }
                                    }
                                });
                                fake_colIndex++;
                            }                            
                        } 
                    }
                    rowStart++;
                }
                
            });
            rowStart++;           
            
            // Массив данных для первого блока "Согласовано"

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
            function fillBlockData(worksheet, rowStart, colStart, blockData, style) {
                for (let i = 0; i < blockData.length; i++) {
                    if (blockData[i].text === 'СОГЛАСОВАНО' || blockData[i].text === 'УТВЕРЖДАЮ') {
                        setCellValueStyle(worksheet, rowStart + i, colStart, blockData[i].text, blockData[i].style);
                    } else {
                        setCellValueStyle(worksheet, rowStart + i, colStart, blockData[i].text, style);
                    }
                }
            }
            var data_1 = [
                { text: 'СОГЛАСОВАНО', style: commonStyle},
                { text: 'Должность1', style: my_style },
                { text: 'Компания1', style: my_style },
                { text: 'ФИО1', style: my_style },
                { text: '______________год', style: my_style },
            ];

            // Массив данных для второго блока "Утверждаю"
            var data_2 = [
                { text: 'СОГЛАСОВАНО', style: commonStyle },
                { text: 'Должность2', style: my_style },
                { text: 'Компания2', style: my_style },
                { text: 'ФИО2', style: my_style },
                { text: '______________год', style: my_style },
            ];
            fillBlockData(worksheet, rowStart, 3, data_1, my_style);
            fillBlockData(worksheet, rowStart, 12, data_2, my_style);

            rowStart += data_2.length

            // Установка максимальной ширины для каждого столбца
            var exclude_width_cell = [
                {'row': 4, 'col': 5},
                {'row': 4, 'col': 7},
                {'row': 4, 'col': 11},
                {'row': 4, 'col': 12},
                {'row': 4, 'col': 14},
            ]
            // Функция для проверки, не находится ли текущая ячейка в списке исключений
            function isExcludedCell(rowNumber, colNumber) {
                return exclude_width_cell.some(function(excludeCell) {
                    return excludeCell.row === rowNumber && excludeCell.col === colNumber;
                });
            }

            let maxColumnWidths = {};
            worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                if (rowNumber === 1) return; // Пропускаем первую строку

                // Обход всех ячеек в строке
                row.eachCell((cell, colNumber) => {
                    // Проверка, что текущая ячейка не в списке исключений
                    if (!isExcludedCell(rowNumber, colNumber)) {
                        let width = cell.text.length + 2;  // Предполагаемая ширина столбца в символах

                        // Сохранение максимальной ширины, если она больше предыдущей
                        if (!maxColumnWidths[colNumber] || width > maxColumnWidths[colNumber]) {
                            maxColumnWidths[colNumber] = width;
                        }
                    }
                });
            });
            for (let colNumber in maxColumnWidths) {
                worksheet.getColumn(parseInt(colNumber)).width = maxColumnWidths[colNumber];
            }
                
            // Применяем стиль выравнивания ко всему столбцу сразу, а не к каждой ячейке по отдельности.
            alignment_col.forEach(alignmentSetting => {
                let colNumber = alignmentSetting.col;
                let colAlignment = alignmentSetting.alignment;

                let col = worksheet.getColumn(colNumber);
                col.alignment = { horizontal: colAlignment };  
            });

            // Проверяем, был ли установлен индекс для столбца 'Прилет'
            if (get_col_index['Прилет из'] !== 0) {
                // Получаем ширину столбца 'Прилет', если он существует
                let referenceWidth = worksheet.getColumn(get_col_index['Прилет из']).width;

                // Теперь устанавливаем эту ширину для других столбцов
                for (let key in set_col_index) {
                    if (set_col_index[key] !== 0) { // Убедитесь, что для столбца был установлен индекс
                        worksheet.getColumn(set_col_index[key]).width = referenceWidth;
                    }
                }
            }



            
            worksheet.pageSetup.fitToPage = true;
            worksheet.pageSetup.fitToWidth = 1; // 1 страница по ширине
            worksheet.pageSetup.fitToHeight = 0; // По высоте масштабируется автоматическ
        }
        
        function convert_to_excel() {
            const workbook = new ExcelJS.Workbook();
            // Подготовка данных для листов
            const uniqueSheetData = getUniqueSheetData(); // Функция, которая возвращает уникальные данные для создания листов
            let text = 'Расписание - ' + $('.title_timetable').text() + ' (' + $('.timetableList_date_start').text() + ' - ' + $('.timetableList_date_end').text() + ')';

            uniqueSheetData.forEach(data => {
                const worksheet = workbook.addWorksheet(data);
                // Обработка данных каждого листа в цикле, минимизация повторяющегося кода, используя функции выше
                processDataForSheet(worksheet, data); // Функция, которая обрабатывает данные для листа
            });

            // Сохранение и экспорт рабочей книги
            workbook.xlsx.writeBuffer().then(function(buffer) {
                saveAs(new Blob([buffer], { type: "application/octet-stream" }), text+".xlsx");
            }).catch(function(error) {
                console.error("Error writing excel export", error);
            });
        }
        

        $('.export_excel').on('click', function () {
            convert_to_excel();
        });


        $('.multiple-set-tgo').click(function() {
            getFilteredUniqueValues(timetable_week_group);
        });


        // $('.telegram_btn').on('click', function () {
        //     Toast.setTheme(TOAST_THEME.DARK);
        //     Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
        //     Toast.create("Пожалуйста подождите", 'Идет загрузка страницы', TOAST_STATUS.INFO, 10000);
        // });

        
        var buttonsHtml = $('.buttons_to_dt_navbar').html();
        $('.dataTables_filter').after(buttonsHtml);
        $('#buttons_to_dt_navbar_id').hide();

        $('.table_dt-container').addClass('ml-0');
        $('#timetable_week_group_wrapper').wrap('<div class="table_dt-container" style="max-width: 100%; overflow-x: auto;"></div>');

    // ----------------------------------------------------------------
    }
});