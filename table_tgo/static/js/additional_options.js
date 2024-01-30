
function get_option_filterDate_column_html(table_dt, columns_date, html_to_option, excluded_dates, additional_dates)
{
    createColDateHTML(html_to_option);
    editDateInputChange(table_dt)
    createChangeDate(table_dt, columns_date, excluded_dates, additional_dates);
}

function createColDateHTML(html_to_option) {
    // Создание основных элементов фильтрации дат
    var dateFilterHtml = `
        <div class="col">
            <div class="">
                <div class="form-group">
                    <label>От</label>
                    <input type="date" id="minDate" class="form-control" >
                </div>
                <div class="form-group">
                    <label>До</label>
                    <input type="date" id="maxDate" class="form-control">
                </div>  
                <button id="ButtonDateFilter" type="button" class="btn btn-secondary btn-xs mt-2" style="width: 100%;">Применить фильтры дат</button>
                <button id="ButtonDateResetFilter" type="button" class="btn btn-secondary btn-xs mt-2" style="width: 100%;">Снять фильтры дат</button>
                
            </div>
        </div>
        <div class="col relativeDate">
            <br>
            <button type="button" class="btn btn-date mt-2" value="1" name="isoWeek">Прошлая неделя</button><br>
            <button type="button" class="btn btn-date mt-2" value="1" name="month">Прошлый месяц</button><br>
            <button type="button" class="btn btn-date mt-2" value="1" name="quarter">Прошлый квартал</button><br>
            <button type="button" class="btn btn-date mt-2" value="1" name="year">Прошлый год</button><br>
        </div>
        <div class="col relativeDate">
            <br>
            <button type="button" class="btn btn-date mt-2" value="0" name="isoWeek">Текущая неделя</button><br>
            <button type="button" class="btn btn-date mt-2" value="0" name="month">Текущий месяц</button><br>
            <button type="button" class="btn btn-date mt-2" value="0" name="quarter">Текущий квартал</button><br>
            <button type="button" class="btn btn-date mt-2" value="0" name="year" id="thisYearButton">Текущий год</button><br>
        </div>
        <div class="col relativeDate">
            <br>
            <button type="button" class="btn btn-date mt-2" value="2" name="isoWeek">След. неделя</button><br>
            <button type="button" class="btn btn-date mt-2" value="2" name="month">След. месяц</button><br>
            <button type="button" class="btn btn-date mt-2" value="2" name="quarter">След. квартал</button><br>
            <button type="button" class="btn btn-date mt-2" value="2" name="year">След. год</button><br>
        </div>`;

    // Добавляем HTML напрямую в divSetting
    html_to_option.append(dateFilterHtml);
}

function editDateInputChange(table) {
    // Добавление класса к кнопкам для визуального оформления
    $(".relativeDate button").addClass("btn-secondary"); 

    // Обработчик клика для кнопок выбора дат
    $(".relativeDate button").click(function () {
        var currentOrNotDate = parseInt($(this).val());
        var typeDate = $(this).attr('name');
        
        var minDate, maxDate;

        // Вычисление минимальной и максимальной дат в зависимости от выбранного периода
        if (currentOrNotDate === 0) {
            minDate = moment().startOf(typeDate).format('YYYY-MM-DD');
            maxDate = moment().endOf(typeDate).format('YYYY-MM-DD');
        } else if (currentOrNotDate === 1) {
            minDate = moment().subtract(1, typeDate).startOf(typeDate).format('YYYY-MM-DD');
            maxDate = moment().subtract(1, typeDate).endOf(typeDate).format('YYYY-MM-DD');
        } else if (currentOrNotDate === 2) {
            minDate = moment().add(1, typeDate).startOf(typeDate).format('YYYY-MM-DD');
            maxDate = moment().add(1, typeDate).endOf(typeDate).format('YYYY-MM-DD');
        }
        
        // Установка значений минимальной и максимальной дат
        $("#minDate").val(minDate);
        $("#maxDate").val(maxDate);

        var tableId = table.table().node().id;

        // Сохранение значений фильтра в localStorage
        localStorage.setItem(window.location.href + '_' + tableId + '_minDateFilter', minDate);
        localStorage.setItem(window.location.href + '_' + tableId + '_maxDateFilter', maxDate);
        localStorage.setItem(window.location.href + '_' + tableId + '_relativeDate', $(this).text());


        // Обновление визуального оформления кнопок
        $(".relativeDate button").removeClass("btn-warning").addClass("btn-secondary");
        $(this).removeClass("btn-secondary").addClass("btn-warning");

        // Перерисовка таблицы
        $("#ButtonDateFilter").click()
    });

   
}

function createChangeDate(table, columns_date, excluded_dates, additional_dates) {
    // Функция фильтрации
    var customDateFilter = function (settings, data, dataIndex) {
        var valid = true;
        var min = moment($("#minDate").val(), 'YYYY-MM-DD', true);
        var max = moment($("#maxDate").val(), 'YYYY-MM-DD', true);
        

        if (!min.isValid()) { min = null; }
        if (!max.isValid()) { max = null; }
 
        var startDateRange = parseDates_to_yyyymmdd(data[columns_date[0]])
        var endDateRange = parseDates_to_yyyymmdd(data[columns_date[1]])

        let excluded_dates_list = []   
        let additional_dates_list = []   
        if (additional_dates!=-1)
        {
            additional_dates_list = parseDates_to_yyyymmdd(data[additional_dates]);
        } 
        if (excluded_dates!=-1)
        {
            excluded_dates_list = parseDates_to_yyyymmdd(data[excluded_dates]);
        } 
        if (min !== null || max !== null) {
            // Проверка дополнительных дат
            if (Array.isArray(additional_dates_list) && additional_dates_list.some(date => {
                // let momentDate = moment(date, 'YYYY-MM-DD', true);
                return momentDate.isValid() && momentDate.isBetween(min, max, undefined, '[]');
            })) {
                return true;
            }

            
            // Предположим, что startDateRange и endDateRange - это объекты Moment.js,
            // а min и max - это также объекты Moment.js или другие данные, которые нужно проверить
            // console.log(startDateRange, endDateRange)
            if (
                (
                    startDateRange !== null && endDateRange !== null && startDateRange !== '' && endDateRange !== '' && // Оба диапазона присутствуют и не равны null
                    (
                        !startDateRange.isBetween(min, max, undefined, '[]') &&
                        !endDateRange.isBetween(min, max, undefined, '[]') &&
                        (!min.isBetween(startDateRange, endDateRange, undefined, '[]') &&
                        !max.isBetween(startDateRange, endDateRange, undefined, '[]'))
                    )
                ) || (
                    startDateRange !== null && endDateRange === null && startDateRange !== '' && // Только startDateRange присутствует и не равен null
                    !startDateRange.isBetween(min, max, undefined, '[]')
                ) || (
                    startDateRange === null && endDateRange !== null && endDateRange !== '' && // Только endDateRange присутствует и не равен null
                    !endDateRange.isBetween(min, max, undefined, '[]')
                )
            ) {
                valid = false;
            }

            // Проверка исключенных дат
            if (
                Array.isArray(excluded_dates_list) &&
                excluded_dates_list.some(date => {
                    // Ваша логика проверки для исключенных дат
                })
            ) {
                return false;
            }
        }
        // if (startDateRange.toString().includes('2023') ||  endDateRange.toString().includes('2023') )
        // console.log(valid, startDateRange, endDateRange)
        
        return valid;
    };

    // Добавление фильтра
    $.fn.dataTable.ext.search.push(customDateFilter);

    var tableId = table.table().node().id;

    // Обработчик для кнопки применения фильтра
    $("#ButtonDateFilter").click(function () {
        $(this).addClass('btn-success');
        $("#ButtonDateResetFilter").removeClass('btn-success');

        
        localStorage.setItem(window.location.href + '_' + tableId + '_ButtonDateFilter', 'ButtonDateFilter');
        localStorage.setItem(window.location.href + '_' + tableId + '_minDateFilter', $("#minDate").val());
        localStorage.setItem(window.location.href + '_' + tableId + '_maxDateFilter', $("#maxDate").val()); 
        localStorage.setItem(window.location.href + '_' + tableId + '_activebuttonfilterId', 'ButtonDateFilter');

        // Перерисовка таблицы с применением фильтра
        table.draw();
        init_dt_select(table, {}, -1);
    });

    // Обработчик для кнопки сброса всех фильтров
    $("#ButtonDateResetFilter").click(function () {
        // Удаление класса btn-success
        $(this).addClass('btn-success');
        $("#ButtonDateFilter").removeClass('btn-success');
        $(".relativeDate button").removeClass("btn-warning").addClass("btn-secondary");

 
        // Сброс значений фильтра дат
        $("#minDate").val('');
        $("#maxDate").val('');


        // Сохранение значений фильтра в localStorage
        localStorage.setItem(window.location.href + '_' + tableId + '_minDateFilter', '');
        localStorage.setItem(window.location.href + '_' + tableId + '_maxDateFilter', '');
        localStorage.setItem(window.location.href + '_' + tableId + '_relativeDate', '');
        localStorage.setItem(window.location.href + '_' + tableId + '_activebuttonfilterId', 'ButtonDateResetFilter');


        // Перерисовка таблицы без применения фильтра дат
        table.draw();

        init_dt_select(table, {}, -1);

    });
    // init_dt_select(dataTable, {}, -1)   


    // Первоначальная отрисовка таблицы
    table.draw();
    init_dt_select(table, {}, -1);

}



function get_option_hide_column_html(table_dt) {
    var ths = []; // Инициализируем массив для хранения данных о столбцах

    // Перебираем все столбцы и собираем данные
    table_dt.columns().every(function () {
        var column = this;
        var header = column.header(); // Получаем заголовок столбца
        var index = column.index(); // Получаем индекс столбца
        var visible = column.visible(); // Получаем видимость столбца

        // Добавляем объект с данными о столбце в массив
        ths.push({ header: header, index: index, visible: visible });
    });

    // Создаем HTML для каждого столбца
    var colGroupHTML = createColGroupHTML(ths, table_dt);

    return colGroupHTML;
}

// Исправленная функция createColGroupHTML
function createColGroupHTML(ths, table_dt) {
    var colElements = [];

    ths.forEach(function (th) {
        var thText = $(th.header).text().trim(); // Получаем текст заголовка
        var isVisible = th.visible; // Видимость столбца
        var rowspan = $(th.header).attr('rowspan'); // Атрибут rowspan

        var checkedAttribute = isVisible ? ' checked' : '';
        var rowHtml = '<div class="row"><label><input type="checkbox" class="toggle-vis-input-checkbox" data-column="' + 
                    th.index + '"'+ checkedAttribute +' data-name ="' + thText + '" data-rowspan="' + 
                    rowspan + '">' + thText + '</label></div>';

        colElements.push(rowHtml);
    });

    return colElements;
}

function init_additional_options(
    table_dt, append_icon_to_pah, insert_additional_options_path, 
    insert_after=false, flag_date=false, columns_date=[], 
    excluded_dates=-1, additional_dates=-1,) {
    // table_dt, path куда вставляем ⚙️, path куда вставляем option_html
    // если insert_after = false то вставка html будет before, то есть до элемента путь к которому мы прописали 

    // example excluded_dates or additional_dates ['2023-11-29', '2023-11-17', '2023-12-30', '2023-12-08', '2023-12-24', '2023-12-31']
    
    var icon = $('<span>').addClass('ml-2 h4');
    icon.attr('id', 'icon_option_dt');
    icon.html('⚙️');
    
    $(append_icon_to_pah).append(icon);

    var divSetting = $('<div class="container-fluid alert alert-primary settingDivPlugin">');
    var html_to_option  = $('<div class="row">')

    var colGroupHTML = get_option_hide_column_html(table_dt);

    
    // Делим массив на группы по 7 элементов
    var groups = [];
    for (var i = 0; i < colGroupHTML.length; i += 8) {
        groups.push(colGroupHTML.slice(i, i + 8));
    }

    // Добавляем каждую группу в html_to_option
    for (var j = 0; j < groups.length; j++) {
        var colGroup = $('<div class="col ml-2">').html(groups[j].join('')); // Добавляем разделитель <br> между элементами
        html_to_option.append(colGroup);
    }
    
    divSetting.append(html_to_option);

    // вставка элемента
    $(insert_additional_options_path)[insert_after ? 'after' : 'before'](divSetting);
   
 
    $('.toggle-vis-input-checkbox').click(function() {
        var columnName = $(this).data('column');
     
        // Переключение видимости фильтров и ячеек колонки
        var column = table_dt.column(columnName);
        column.visible(!column.visible());
        
    });
    
    // Получение id таблицы (предполагается, что у вас есть таблица с id="myTable")
    var tableId = table_dt.table().node().id;

    // Кэширование объекта .settingDivPlugin
    var $settingDivPlugin = $(".settingDivPlugin");

    // Скрывать/показывать панель параметров при клике на элемент с id="icon_option_dt"
    $("#icon_option_dt").click(function () {
        // Переключение видимости панели и обновление состояния в localStorage
        $settingDivPlugin.slideToggle(function () {
            localStorage.setItem(window.location.href + '_' + tableId + '_settingDivPluginVisible', $settingDivPlugin.is(":visible"));
        });
    });

    // Проверка и восстановление состояния видимости панели при загрузке страницы
    var isVisibleInLocalStorage = localStorage.getItem(window.location.href + '_' + tableId + '_settingDivPluginVisible');
    if (isVisibleInLocalStorage === "true") {
        $settingDivPlugin.show();
    } else {
        $settingDivPlugin.hide();
    }

    // Установка начальных значений для фильтра даты
    if ($("#minDate").val() === '' && $("#maxDate").val() === '' && !$("#ButtonDateResetFilter").hasClass('btn-success')) {
        $('button[value="0"][name="year"]').click();
    }

    if (flag_date=true )
    {
        // Восстановление значений фильтра из localStorage
        var savedMinDate = localStorage.getItem(window.location.href + '_' + tableId + '_minDateFilter');
        var savedMaxDate = localStorage.getItem(window.location.href + '_' + tableId + '_maxDateFilter');
        var savedButtonDate = localStorage.getItem(window.location.href + '_' + tableId + '_relativeDate');
        var activeButtonId = localStorage.getItem(window.location.href + '_' + tableId + '_activebuttonfilterId');

        get_option_filterDate_column_html(table_dt, columns_date, html_to_option, excluded_dates, additional_dates)

        if (activeButtonId ) {
            $('.btn-filter').removeClass('btn-success'); // предполагается, что у всех кнопок фильтра есть класс .btn-filter
            $('#' + activeButtonId).addClass('btn-success');
          }

        if (savedButtonDate) {
            $(".relativeDate button").removeClass("btn-warning");
            $(".relativeDate button").filter(function() {
                return $(this).text() === savedButtonDate;
            }).addClass("btn-warning").click();
        }

        if (savedMinDate ) {
            $("#minDate").val(savedMinDate);
        }
        if (savedMaxDate) {
            $("#maxDate").val(savedMaxDate);
        }
    }
  

}

