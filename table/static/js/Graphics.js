
function chartData(table, reason='') {
    var counts = {};
    table.rows({ search: 'applied' }).data().each(function (val) {
        if (!counts[val[4]]) {
            counts[val[4]] = 0;
        } 
    });

    table.rows({ search: 'applied' }).data().each(function (val) { 
        if (reason != ''){
            if (val[5] == reason) {
                counts[val[4]] += parseInt(val[7]);
            }
        }
    });

    return $.map(counts, function (val, key) {
        return {
            label: key,
            value: val,
        };
    });
}

function chartDataNotReason(table) {
    var counts = {};
    table.rows({ search: 'applied' }).data().each(function (val) {
        if (!counts[val[4]]) {
            counts[val[4]] = 0;
        } 
    });

    table.rows({ search: 'applied' }).data().each(function (val) {
        counts[val[4]] += parseInt(val[7]);
    });
    
    return $.map(counts, function (val, key) {
        return {
            label: key,
            value: val,
        };
    });
}

function chartDataOffice(table) {
    var counts = {};
    var human;
    human = table.column(4).data().unique().toArray();

    //находим уникальных сотрундников, их офис, и считаем повторения такого офиса
    table.rows({ search: 'applied' }).data().each(function (val) {
        if ( human.includes(val[4]))
        {
            if (counts[val[2]]) {
                counts[val[2]] += 1;
            } else {
                counts[val[2]] = 1;
            }
           human = human.filter(function(f) { return f !== val[4] })
        };   
    });

    return $.map(counts, function (val, key) {
        return {
            label: key,
            value: val,
        };
    });
}

function chartDataOfficeDay(table) {
    var counts = {};
 
    // Count the number of entries for each office
    table.rows({ search: 'applied' }).data().each(function (val) {
        if (counts[val[2]]) {
            counts[val[2]] += parseInt(val[7]);
        } else {
            counts[val[2]] = parseInt(val[7]);
        }
    });
 
    // And map it to the format highcharts uses
    return $.map(counts, function (val, key) {
        return {
            label: key,
            value: val,
        };
    });
}

//Пропуски по каждому дню
function chartDataDate(table) {
    var date = [];

    // Получение минимальной и максимальной дат
    var dateRange = findMinMaxDates(table);

    // Инициализация объектов Moment
    var startDate = moment(dateRange.minDate).subtract(1, 'days').utc();
    var endDate = moment(dateRange.maxDate).add(1, 'days').utc();

    for (var m = startDate; m.isBefore(endDate); m.add(1, 'days')) {
        date.push(m.format('YYYY-MM-DD'));
    }

    
    var counts = {};
    var countsReason = {};

    for (var i = 0; i<date.length; i++) {
        counts[date[i]] = 0;
        countsReason[date[i]] = 0;
    };

    for (var i = 0; i<date.length; i++) {
        table.rows({ search: 'applied' }).data().each(function (val) {
            var thisdate = date[i];

            if (thisdate >= parseDates_to_yyyymmdd(val[8], toMoment=false) && thisdate <= parseDates_to_yyyymmdd(val[9], toMoment=false)){
                counts[thisdate] += 1; 
            } 
        });

    }    
    return $.map(counts, function (val, key) {
        return {
            label: key,
            value: val,
        };
    });
}


//Пропуски по количеству сотрудников на каждый день
function chartDataDateEmployee(table) {
    var date = [];

    // Получение минимальной и максимальной дат
    var dateRange = findMinMaxDates(table);

    // Инициализация объектов Moment для диапазона дат
    var startDate = moment(dateRange.minDate).subtract(1, 'days');
    var endDate = moment(dateRange.maxDate).add(1, 'days');

    // Перебор дат в заданном диапазоне
    for (var m = moment(startDate); m.isBefore(endDate); m.add(1, 'days')) {
        date.push(m.format('YYYY-MM-DD'));
    }
    var employee = [];

    for (var i = 0; i<date.length; i++) {
        var elem_employes = []
        var thisdate = date[i];

        table.rows({ search: 'applied' }).data().each(function (val) {
            
            if (thisdate >= parseDates_to_yyyymmdd(val[8], toMoment=false) && thisdate <= parseDates_to_yyyymmdd(val[9], toMoment=false)){
                if(elem_employes.length >0){
                    var flag = false
                    for (var i = 0; i<elem_employes.length; i++) {
                        if (elem_employes[i].includes(val[4])) {
                            for (var i = 0; i<elem_employes.length; i++) {
                                if (elem_employes[i][1] == val[4]){
                                    elem_employes[i][2] += 1 
                                    flag = true
                                }
                            };                  
                        }
                    }; 
                    if (flag == false)
                    {
                        var elem_employe = []
                        elem_employe[0] = thisdate
                        elem_employe[1] = val[4]
                        elem_employe[2] = 1
                        elem_employes.push(elem_employe)
                    }
                } else {
                    var elem_employe = []
                    elem_employe[0] = thisdate
                    elem_employe[1] = val[4]
                    elem_employe[2] = 1
                    elem_employes.push(elem_employe)    
                }
            } 
           
        });
        employee.push(elem_employes)
        
    }   
    return employee
}

function findMinMaxDates(table) {
    var dateArray = [];
    table.rows({ search: 'applied' }).data().each(function (val) {
        var startDate = parseDates_to_yyyymmdd(val[8], toMoment=false);
        var endDate = parseDates_to_yyyymmdd(val[9], toMoment=false); 
        
        startDate = new Date(startDate);
        endDate = new Date(endDate);

        if (!isNaN(startDate.getTime())) {

            dateArray.push(startDate.getTime());
        }
        if (!isNaN(endDate.getTime())) {
            dateArray.push(endDate.getTime());
        }
    });

    dateArray.sort();

    var minDate = dateArray[0];
    var maxDate = dateArray[dateArray.length - 1];

    return { minDate: minDate, maxDate: maxDate };
}

//Находим сотрудников по офису
function getEmployeeOffice(table) {
    var counts = {};

    // Count the number of entries for each office
    table.rows({ search: 'applied' }).data().each(function (val) {
        if (counts[val[2]]) {
            if (counts[val[2]].includes(val[4]) == false)
            counts[val[2]].push(val[4])
        } else {
            counts[val[2]] = [val[4]];
        }
    });
 
    // And map it to the format highcharts uses
    return $.map(counts, function (val, key) {     
           
        var employee_count_date = {}
        for (var i = 0; i<val.length; i++) {
            employee_count_date[val[i]] = 0

            table.rows({ search: 'applied' }).data().each(function (value) {
                if (val[i] == [value[4]]) {
                employee_count_date[value[4]] += parseInt(value[7]);
                }
            });
        };

        return {
            label: key,
            value: employee_count_date,
        };
    });
}

function month(table, reason) {
    // Получение минимальной и максимальной дат
    var dateRange = findMinMaxDates(table);

    // Форматирование дат с использованием Moment.js
    var startDate = moment(dateRange.minDate).format('YYYY-MM-DD');
    var endDate = moment(dateRange.maxDate).add(1, 'days').format('YYYY-MM-DD');
    



    var date = [];

    for (var m = moment(startDate); m.isBefore(endDate); m.add(1, 'days')) {
        date.push(m.format('YYYY-MM-DD'));
    }
    var counts = {};
    for (var i = 0; i<date.length; i++) {
        counts[date[i]] = 0;
    };

    for (var i = 0; i<date.length; i++) {
        table.rows({ search: 'applied' }).data().each(function (val) {
            var thisdate = date[i];
            if (reason != '') {
                if (val[5] == reason) {
                    if (thisdate >= parseDates_to_yyyymmdd(val[8], toMoment=false) && thisdate <= parseDates_to_yyyymmdd(val[9], toMoment=false)){
                        counts[thisdate] += 1; 
                    } 
                }
            } else {
                if (thisdate >= parseDates_to_yyyymmdd(val[8], toMoment=false) && thisdate <= parseDates_to_yyyymmdd(val[9], toMoment=false)){
                    counts[thisdate] += 1; 
                } 
            }
            
        });

    }
    

    return $.map(counts, function (val, key) {
        return {
            label: key.slice(0, -3),
            value: val,
        };
    });
    
}



function chartDataMonth(table, reason = '') {
    var data = month(table, reason);

    var count = {};

    data.map( function( value, key ) {
        var key = value['label']
        var value = value['value']
        
        if (count.hasOwnProperty(key)) {
        } else {
            count[key] = 0;
        }
    });

    data.map( function( value, key ) {
        var key = value['label']
        var value = value['value']
        count[key] += value;    
    });

    var monthNames = [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ]; 

    return $.map(count, function (val, key) {
        key = key.substring(5, 7)
        key = parseInt(key, 10)  
  
        key = monthNames[key-1]
        return {
            label: key,
            value: val,
        };
    });
}


var rgbaColor;

const rgba_color = [
    'rgba(255, 99, 132, 0.8)',    // Розовый
    'rgba(54, 162, 235, 0.8)',    // Синий
    'rgba(255, 206, 86, 0.8)',    // Желтый
    'rgba(75, 192, 192, 0.8)',    // Бирюзовый
    'rgba(153, 102, 255, 0.8)',   // Фиолетовый
    'rgba(255, 159, 64, 0.8)',    // Оранжевый
    'rgba(22, 160, 133, 0.8)',    // Зеленый морской волны
    'rgba(241, 196, 15, 0.8)',    // Ярко-желтый
    'rgba(211, 84, 0, 0.8)',      // Темно-оранжевый
    'rgba(52, 73, 94, 0.8)',      // Темно-синий
    'rgba(155, 89, 182, 0.8)',    // Лавандовый
    'rgba(26, 188, 156, 0.8)',    // Бирюзовый
    'rgba(46, 204, 113, 0.8)',    // Изумрудный
    'rgba(52, 152, 219, 0.8)',    // Голубой
    'rgba(192, 57, 43, 0.8)',     // Красный
    'rgba(127, 140, 141, 0.8)'    // Серый
];

var rgba_color_used = rgba_color.slice(); // Создаем копию массива
shuffleArray(rgba_color_used); // Перемешиваем элементы массива

// Функция для перемешивания массива
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Генерация гармоничных цветов в формате RGBA
function getRGBA() {
    if (rgba_color_used.length > 0) {
        const color = rgba_color_used[0];
        rgba_color_used.shift(); // Удаляем первый элемент
        return color;
    } else {
        rgba_color_used = rgba_color.slice(); // Восстанавливаем исходный массив
        shuffleArray(rgba_color_used); // Перемешиваем элементы массива
        return getRGBA();
    }
}

// Датасет для графика
function getDataset(title, data) {
    const backgroundColor = getRGBA();
    return { 
        label: title,
        data: data,
        backgroundColor: backgroundColor, // Увеличиваем прозрачность
        borderColor: backgroundColor, // Увеличиваем прозрачность
        borderWidth: 1, 
    }; 
}

function reasonGraphicMonth(table) {
    var datasets = []
    var value;

    //ищем все причины пропуска работы
    var reason =  table
    .column(5)
    .data()
    .unique();

    //ищем для каждой причины количество пропусков и добавляем в датасет
    reason.map( function(reas) {
        value = chartDataMonth(table, reas).map( function( value ) {
            return value['value']
        }) 
        datasets.push(getDataset(reas, value));     
    });

    return datasets
}



function reasonGraphicHuman(table) {
    var datasets_this = []
    var value;

    //ищем все причины пропуска работы
    var reason =  table
    .column(5)
    .data()
    .unique();
    
    //ищем для каждой причины количество пропусков по сотруднику и добавляем в датасет
    reason.map( function(reas) {
        value = chartData(table, reas).map( function( value ) {
            return value['value']
        }) 
        var dataset = getDataset(reas, value);
        datasets_this.push(JSON.parse(JSON.stringify(dataset)));
    });

    return datasets_this
    
}

function sortMultiDatasets(datasets) {
    return datasets
}


function addMonthOfDay(elem) {
    var monthNames = [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ]; 
    var month= new Date(elem).getMonth();
    return elem + ';' + monthNames[month]
}

function getMonthOfDayArray(array) {
    return array.map(addMonthOfDay);   
}













