
if(window.location.href.search('analitics') >= 0 || window.location.href.search('/timetable/timetable/') >= 0  || 
    window.location.href.search('timetable/timetable_week/') >= 0 || window.location.href.search('timetable/timetable_week_group') >= 0)
{ 
  var meta_data_tollip;
  var current_ressource;

  const weekdaysDictionary = {
    1: "Пн",
    2: "Вт",
    3: "Ср",
    4: "Чт",
    5: "Пт",
    6: "Сб",
    7: "Вс",
  };
  const swappedWeekdaysDictionary = {
    "Пн": "Понедельник",
    "Вт": "Вторник",
    "Ср": "Среда",
    "Чт": "Четверг",
    "Пт": "Пятница",
    "Сб": "Суббота",
    "Вс": "Воскресенье"
  };


    var isMouseOverChart = false;

    document.getElementById('chart-analitics').addEventListener('mouseover', function() {
        isMouseOverChart = true;
    });

    document.getElementById('chart-analitics').addEventListener('mouseout', function() {
        isMouseOverChart = false;
    });

 


  function chart_analitics_init(datasets=[], meta_datasets=[], max_count=10, selectedValue='') {
    meta_data_tollip = meta_datasets;
    current_ressource = selectedValue;
    var chart_id = 'chart-analitics'
    var ctx = document.getElementById(chart_id).getContext('2d');
    chartAnalitics = new Chart(ctx, {
    type: 'line',    
    data: {
        datasets: datasets 
    },
    options: { 
        elements: {
            line: {
              tension: 0 
            }
        },
        plugins: {
        zoom: {
            zoom: {
                // wheel: {
                //     enabled: true,
                // },
                pinch: {
                    enabled: true,
                },
                mode: 'x',
            },
            pan: {
                enabled: true,
                mode: 'x',
            },
        },
        
        tooltip: {
            callbacks: {
            label: function(context) {
                var yValue = context.parsed.y;
                var xValue = context.parsed.x;
                var result = []
                
                meta_data_tollip.forEach(function(array) {
                    
                    array.forEach(function(item) {
                        if (item.hasOwnProperty("x") && item.x === xValue) {
                            result.push(item.meta);
                        }
                    });
                 
                });
                resturn_data = []
                resturn_data.push(swappedWeekdaysDictionary[context.dataset.label])

                result.forEach(function(data) {
                   // Перебор всех элементов в словаре данных
                    for (var item of data["meta"]) {
   
                        if (weekdaysDictionary[item['day_num']] == context.dataset.label)
                        {
                            var date = new Date(item['start_time']);
                            var start_time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            
                            var date = new Date(item['end_time']);
                            var end_time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            
                            var string = item['current_count'] + 'шт. ' + start_time + '-' + end_time + ' ' + item['flight'] + ' - ' + item['tgo'] + ' - ' +  item['operation'] 
                            resturn_data.push(string)
                        }
                    }
                });
                resturn_data.push([])

                return resturn_data;
            },

            title: function(tooltipItems) {
                var xValue = tooltipItems[0].parsed.x;
                var hours = Math.floor(xValue / 60);
                var minutes = xValue % 60;
                return `Время: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}. ${current_ressource} ${tooltipItems[0].parsed.y}шт.`;
            },
            },
        },
        },
        scales: {
        x: {
            type: 'linear',
            position: 'bottom',
            // min: 0,
            // max: 60 * 24,
            // убираем явное мин и макс чтобы чарт сам определил, но так как у нас зум это бессмысленно
            ticks: {
                autoSkip: true,
                stepSize: 1, 
                maxTicksLimit: 48,
                callback: function (value, index, values) {
                    var hours = Math.floor(value / 60);
                    var minutes = value % 60;
                    var label = hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            
                    if (minutes % 1 === 0) {
                        return label;
                    }
                    return '';
                },
                color: function(context) {
                    // Убедитесь, что `context` содержит необходимые данные
                    if (!context || !context.tick || context.tick.value === undefined) {
                        return '#666'; // Возвращаем цвет по умолчанию, если данные недоступны
                    }

                    let value = context.tick.value;
                    let hours = Math.floor(value / 60);
                    let minutes = value % 60;
                    return minutes === 0 ? '#000' : '#666'; // черный для часов, серый для остальных
                },
                font: function(context) {
                    if (!context || !context.tick || context.tick.value === undefined) {
                        return { size: 12 }; // Возвращаем размер по умолчанию, если данные недоступны
                    }

                    let value = context.tick.value;
                    let hours = Math.floor(value / 60);
                    let minutes = value % 60;
                    return minutes === 0 ? { weight: 'bold', size: 16 } : { size: 12 };
                },
            },
        },
        y: {
            beginAtZero: true, // Начинать ось Y с нуля
            max: max_count+1, // Максимальное значение оси Y
            min: 0, 
            ticks: {
                stepSize: 1, 
                callback: function (value, index, values) {
                    // Округляем значения на оси Y
                    return Math.round(value);
                },
            },
        },
        },
    },
    });



    
    function moveChart(percentage) {
        var currentMin = chartAnalitics.options.scales.x.min;
        var currentMax = chartAnalitics.options.scales.x.max;
        var range = currentMax - currentMin;
        var offset = range * (percentage / 100);

        var newMin = currentMin + offset;
        var newMax = currentMax + offset;

        chartAnalitics.options.scales.x.min = Math.max(0, newMin);
        chartAnalitics.options.scales.x.max = newMax;
        chartAnalitics.update();
    }
    



    function zoomChart(zoomIn) {
        var currentMin = chartAnalitics.options.scales.x.min;
        var currentMax = chartAnalitics.options.scales.x.max;
        var range = currentMax - currentMin;
        var zoomFactor = zoomIn ? 0.9 : 1.1; // Уменьшаем или увеличиваем масштаб

        var newMin = currentMin + range * (1 - zoomFactor) / 2;
        var newMax = currentMax - range * (1 - zoomFactor) / 2;

        var newRange = newMax - newMin;
    
       

         // Проверяем, разрешено ли уменьшение масштаба
         if (newRange < 1600) {
            chartAnalitics.options.scales.x.min = Math.max(0, newMin);
            chartAnalitics.options.scales.x.max = newMax;
            currentRange = newRange;
            chartAnalitics.update();
        }
    }

    document.addEventListener('keydown', function (event) {
        if (isMouseOverChart)
        {
            event.preventDefault(); // Предотвращаем стандартное поведение прокрутки
        } else {
            return; // Не выполняем масштабирование, если мышь не над графиком
        }

        if (event.key === 'ArrowLeft') {
            moveChart(-10); // Смещение влево на 10
        } else if (event.key === 'ArrowRight') {
            moveChart(10); // Смещение вправо на 10
        } else if (event.key === 'ArrowUp') {
            zoomChart(true); // Увеличение масштаба
        } else if (event.key === 'ArrowDown') {
            zoomChart(false); // Уменьшение масштаба
        }
    }, { passive: false }); 

    document.addEventListener('wheel', function(event) {
        if (isMouseOverChart)
        {
            event.preventDefault(); // Предотвращаем стандартное поведение прокрутки
        } else {
            return; // Не выполняем масштабирование, если мышь не над графиком
        }

        if (event.deltaY > 0) { // Уменьшение масштаба
            zoomChart(false);
        } else if (event.deltaY < 0) { // Увеличение масштаба
            zoomChart(true);
        }
    }, { passive: false }); // Установка passive: false необходима для вызова preventDefault


  }
  
  


  function chart_analitics_update(datasets=[], meta_datasets=[], max_count=0, selectedValue='') {
    meta_data_tollip = meta_datasets;
    current_ressource = selectedValue;

    $('.div-chart-analitics').show();
    
    // Обновляем данные
    // Фильтруем массив dataset, исключая объекты с пустым значением y
    chartAnalitics.data.datasets = datasets;
    
    // Границы для осей Y, X
    chartAnalitics.options.scales.y.max = max_count;

    // Найти min, max значение x из датасета
    const min_x = Math.min(...datasets[0].data.map(item => item.x));
    const max_x = Math.max(...datasets[0].data.map(item => item.x));

    // Ставим значение чуть больше для удобства просмотра
    chartAnalitics.options.scales.x.min = min_x-3;
    chartAnalitics.options.scales.x.max = max_x+3;

    const xValues = datasets.flatMap(dataset => dataset.data.map(data => data.x));


    chartAnalitics.update(); // Обновите график, чтобы отобразить новые данные
  }



}