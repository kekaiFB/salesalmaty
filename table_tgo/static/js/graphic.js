var timeFormatGraph = (function (){
    return function (ms){
        var sec = ms / 1000
          , minutes = Math.floor(sec / 60)
          , seconds = sec % 60
        ;
        if (Math.abs(sec)<10)
        {
            return  ('0:0' + seconds);
        } else if (Math.abs(sec)<60) {
            return  ('0:' + seconds);
        } else {
            if (Math.abs(seconds)<10)
            {
                return (minutes + ":0" + seconds);

            } else {
                return (minutes + ":" + seconds);
            }
        }
    };
})();

function toSeconds(minutes, seconds) {
    return  minutes * 60 + seconds;
}

if (window.location.href.search('/tgo/') >= 0)
{
    var myChart1;
    var labels=[], time_start_op=[], time_end_op=[]; 
    var time_start_res=[], time_end_res=[]; 
    var ctx1 = document.getElementById('oneChart').getContext('2d');
    var index_op = [], index_res = []
    var punkt_index = {}
    var NaN_status
    function draw_tgo_table(table) {
        if (typeof myChart1 != 'undefined') 
        {   
            myChart1.destroy();
        }
        labels=[], time_start_op=[], time_end_op=[]; 
        time_start_res=[], time_end_res=[]; 
        index_op = [], index_res = []

        //ПЕРВЫЙ ГРАФИК
        var length = table.getColumnData([0]).length

        //ПОДГОТОВКА ДАННЫХ
        var e = 'F'
        var f = 'G'

        my_backgroundColor_op = []
        my_backgroundColor_op_none = []
        my_backgroundColor_res = []
        my_backgroundColor_res_none = []
        punkt_index = {}
        NaN_status = 0
        for (let i = 0; i < length; i++) {

            if (!$($('.jexcel_overflow tbody tr')[i])[0].style.cssText.includes('none')){
                
                res = table.getRowData(i);
                var x = i+1
                if (table.getLabel('B' + x) != '') // операция
                {
                    time_start_op.push(table.getLabel(e + x))
                    time_end_op.push(table.getLabel(f + x))

                    
                    my_backgroundColor_op.push('red') 
                    // my_backgroundColor_op_none.push('transparent')
                    my_backgroundColor_op_none.push('orange')
                    index_op.push((res[0]+'.0'))
                    labels.push(res[0]+'.0')
                    punkt_index[res[0]+'.0']=i
                }
                else { // ресурс
                    if (table.getLabel('D' + x) != '')
                    {
                        time_start_res.push(table.getLabel(e + x))
                        time_end_res.push(table.getLabel(f + x))

                        my_backgroundColor_res.push('black')
                        // my_backgroundColor_res_none.push('transparent')
                        my_backgroundColor_res_none.push('orange')

                        index_res.push((res[0]))
                        labels.push((res[0]))
                        punkt_index[res[0]]=i
                    }
                }
            }
        }

        //приводим данные к читабельному виду для chart.js
        time_start_op = time_start_op.map(function(x){ if (!x.includes(':')) {return x+':00' } else { return x}});
        time_end_op = time_end_op.map(function(x){ if (!x.includes(':')) {return x+':00' } else { return x}});
        time_start_res = time_start_res.map(function(x){ if (!x.includes(':')) {return x+':00' } else { return x}});
        time_end_res = time_end_res.map(function(x){ if (!x.includes(':')) {return x+':00' } else { return x}});

        time_start_op = time_start_op.map(function(x){ return x.split(':') });
        time_end_op = time_end_op.map(function(x){ return x.split(':') });
        time_start_res = time_start_res.map(function(x){ return x.split(':') });
        time_end_res = time_end_res.map(function(x){ return x.split(':') });

        time_start_op = time_start_op.map(function(x){ return toSeconds(parseInt(x[0], 10), parseInt(x[1], 10)) });
        time_end_op = time_end_op.map(function(x){ return toSeconds(parseInt(x[0], 10), parseInt(x[1], 10)) });
        time_start_res = time_start_res.map(function(x){ return toSeconds(parseInt(x[0], 10), parseInt(x[1], 10)) });
        time_end_res = time_end_res.map(function(x){ return toSeconds(parseInt(x[0], 10), parseInt(x[1], 10)) });

    
   
        // if (Math.max.apply(Math, time_end_op) > Math.max.apply(Math, time_end_res)|| time_end_res.length == 0) {
        //     time_end_op = time_end_op.map(function(val, i) {
        //         if (time_end_op.indexOf(Math.max.apply(Math, time_end_op)) != i )
        //         {
        //             return time_end_op[i] - time_start_op[i]
        //         } else {
        //             return time_end_op[i]
        //         }
        //     })
        //     time_end_res = time_end_res.map(function(val, i) {
        //         return time_end_res[i] - time_start_res[i]
        //     })
            
        // } else if (Math.max.apply(Math, time_end_op) ==  Math.max.apply(Math, time_end_op)) {
        //     time_end_op = time_end_op.map(function(val, i) {
        //         if (time_end_op.indexOf(Math.max.apply(Math, time_end_op)) != i )
        //         {
        //             return time_end_op[i] - time_start_op[i]
        //         } else {
        //             return time_end_op[i]
        //         }
        //     })
        //     time_end_res = time_end_res.map(function(val, i) {
        //         if (time_end_res.indexOf(Math.max.apply(Math, time_end_res)) != i )
        //         {
        //             return time_end_res[i] - time_start_res[i]
        //         } else {
        //             return time_end_res[i]
        //         }
        //     })

        // }
        // else {
        //     time_end_op = time_end_op.map(function(val, i) {
        //         return time_end_op[i] - time_start_op[i]
        //     })
        //     time_end_res = time_end_res.map(function(val, i) {
        //         if (time_end_res.indexOf(Math.max.apply(Math, time_end_res)) != i )
        //         {
        //             return time_end_res[i] - time_start_res[i]
        //         } else {
        //             return time_end_res[i]
        //         }
        //     })
        // }
        
        //для x: stacke=true  Перевел все в секунды
        time_start_op.forEach(function(x){ if (isNaN(x)) NaN_status = 1 });
        time_end_op.forEach(function(x){ if (isNaN(x)) NaN_status = 1 });
        time_start_res.forEach(function(x){ if (isNaN(x)) NaN_status = 1 });
        time_end_res.forEach(function(x){ if (isNaN(x)) NaN_status = 1 });

        // console.log("Время начала операции (time_start_op):", time_start_op);
        // console.log("Время окончания операции (time_end_op):", time_end_op);
        // console.log("Время начала ресурса (time_start_res):", time_start_res);
        // console.log("Время окончания ресурса (time_end_res):", time_end_res);
        // console.log("Индексы операций (index_op):", index_op);
        // console.log("Индексы ресурсов (index_res):", index_res);
        // console.log("Метки (labels):", labels);
        

        if (NaN_status == 1)
        {
            $(".NaN_status").html('График не отображается, потому что в таблице есть неккоректные значения(Error, NaN или др.)')
            $(".NaN_status")[0].className = 'NaN_status h4 alert alert-danger'
        } else {
            $(".NaN_status").html()
            $(".NaN_status")[0].className = 'NaN_status h4'
            

            // for (var i = 0; i < time_end_op.length; i++) {
            //     if (time_start_op[i] < 0) {
            //         if (time_end_op[i] > 0) {
            //             // my_backgroundColor_op_none[i] = my_backgroundColor_op[i];
            //         } else {
            //             [time_start_op[i], time_end_op[i]] = [time_end_op[i], time_start_op[i]];
            //             time_end_op[i] -= time_start_op[i]
            //         }
            //     }
            // }
            // for (var i = 0; i < time_end_res.length; i++) {
            //     if (time_start_res[i] < 0) {
            //         if (time_end_res[i] > 0) {
            //             // my_backgroundColor_res_none[i] = my_backgroundColor_res[i];
            //         } else {
            //             [time_start_res[i], time_end_res[i]] = [time_end_res[i], time_start_res[i]];
            //         }
            //     }
            // }

            // time_start_op = time_start_op.map(function(x){ return new Date(x  * 1000).toISOString() });
            // time_end_op = time_end_op.map(function(x){ return new Date(x  * 1000).toISOString() });  
            // time_start_res = time_start_res.map(function(x){ return new Date(x  * 1000).toISOString() });
            // time_end_res = time_end_res.map(function(x){ return new Date(x  * 1000).toISOString() }); 
            
            // console.log("Преобразованное время начала операции (time_start_op):", time_start_op);
            // console.log("Преобразованное время окончания операции (time_end_op):", time_end_op);
            // console.log("Преобразованное время начала ресурса (time_start_res):", time_start_res);
            // console.log("Преобразованное время окончания ресурса (time_end_res):", time_end_res);


            // time_start_op.forEach((val, i)=>(console.log({y:index_op[i],x:''+val})))
            // time_end_op.forEach((val, i)=>(console.log({y:index_op[i],x:''+val})))
            // time_start_res.forEach((val, i)=>(console.log({y:index_res[i],x:''+val})))    
            // time_end_op.forEach((val, i)=>(console.log({y:index_op[i],x:''+val})))

            init(table);
        }
    }
        

    function init(table) {

        myChart1 = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'длительность операции (мин.)',
                        data: time_end_op.map((val, i) => ({
                            y: index_op[i].toString(),
                            x: [time_start_op[i], val]  // Создаем массив с начальным и конечным временем
                          })),
                        backgroundColor: my_backgroundColor_op,
                        borderColor: 'transparent',
                        borderWidth: 2,
                        stack: 2,
                        color: 'blue'
                    },
                    {
                        label: 'длительность ресурса (мин.)',
                        data: time_end_res.map((val, i) => ({
                            y: index_res[i].toString(),
                            x: [time_start_res[i], val]  // Создаем массив с начальным и конечным временем
                          })),
                        backgroundColor: my_backgroundColor_res,
                        borderColor: 'transparent',
                        borderWidth: 2,
                        stack: 2,
                    }, 
                ],
            },   
            spanGaps: false,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                elements: {
                    bar: {
                        borderWidth: 2,
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: function(context) {},
                            label: function(context) {
                                if (context.dataset.backgroundColor != 'transparent')
                                {
                                    var index = punkt_index[context.label]
                                    index = index+1
                                    if ( table.getLabel('D' + index) != '') //это ресурс
                                    {
                                        while (table.getLabel('D' + index) != '')
                                        {
                                            index -= 1
                                        }
                                        return context.label + ' ' + table.getLabel('B' + index)
                                    } else { // операция
                                        return parseInt(context.label) + ' ' + table.getLabel('B' + index)
                                    }
                                }
                            },
                            afterLabel: function(context) {
                                if (context.dataset.backgroundColor != 'transparent')
                                {
                                var data = []
                                var index = punkt_index[context.label]
                                index = index+1
                                var res = table.getRowData([index-1])
                                if ( res[3] != '') //это ресурс
                                {
                                    data.push(res[2] + ' (' + res[3] + ' ед.) - ' + res[8])
                                    var text = res[4]
                                    var step = 0
                                    var start_position = 0
                                    for (i=0; i<text.length; i++) //примечание
                                    {
                                        step += 1
                                        if((step >=30 && text[i] == ' ') || i+1 == text.length)
                                        {
                                            data.push(text.slice(start_position, i+1))
                                            step = 0
                                            start_position = i+1
                                        }
                                    } 
                                    data.push([table.getLabel('F' + index) + '-' + table.getLabel('G' + index) + ' (' + table.getLabel('H' + index) + ')' ])
                                    data.push('Ячейка: '+ 'C'+index)
                                    
                                } else { // операция
                                    var text = res[4]
                                    var step = 0
                                    var start_position = 0
                                    for (i=0; i<text.length; i++) //примечание
                                    {
                                        step += 1
                                        if((step >=30 && text[i] == ' ') || i+1 == text.length)
                                        {
                                            data.push(text.slice(start_position, i+1))
                                            step = 0
                                            start_position = i+1
                                        }
                                    } 
                                    data.push([table.getLabel('F' + index) + '-' + table.getLabel('G' + index) + ' (' + table.getLabel('H' + index) + ')' ])
                                    data.push('Ячейка: '+ 'C'+index)
                                }
                                return data
                                }
                            }
                        }
                    },
                    enabled: false,
                    legend: {
                        position: 'bottom',
                    },

                    title: {
                        display: true,
                        text: 'Технологический график обслуживания'
                    }
                },
                scales: {
                    x: {    
                        title: { display: true, text: 'Время'},
                        type: 'linear', // Используем линейную ось
                        ticks: {
                            stepSize: 60,
                            // Метки каждую минуту (60 секунд)
                            // Форматируем метки, чтобы они отображали минуты и секунды
                            callback: function(value) {
                                // Получаем абсолютное значение для времени, чтобы работать с положительными числами
                                let absoluteValue = Math.abs(value);
                                const minutes = Math.floor(absoluteValue / 60);
                                const seconds = absoluteValue % 60;
                            
                                // Форматируем строки для минут и секунд
                                let formattedMinutes = minutes.toString();
                                let formattedSeconds = seconds < 10 ? '0' + seconds : seconds.toString();
                            
                                // Добавляем знак минус для отрицательных значений только перед всем временем
                                return (value < 0 ? "-" : "") + formattedMinutes + ":" + formattedSeconds;
                            }
                        },
                        beginAtZero: false 
                    },
                    
                    y: {        
                        beginAtZero: false,
                        title: { display: true, text: 'Пункт'},
                        ticks: {
                            autoSkip: false 
                          }
                    }
                }
            },     
        })


            // // console.log(labels)
            // if ( labels.length > 3)
            // {
            //     myChart1.canvas.style.height = labels.length*30 +'px'; 
            // } else {
            //     myChart1.canvas.style.height = '110%'; 
            // }
            
        // Инициализация высоты холста
        const minLineWidth = 19; // минимальная ширина линии
        console.log(labels.length, labels)

        updateCanvasHeight(myChart1, minLineWidth, labels);
     

    } 
    
    // Функция для обновления высоты холста
    function updateCanvasHeight(chart, minLineWidth, labels) {
        const minHeight = labels.length * minLineWidth; // Вычисляем минимальную высоту
        const minCanvasHeight = 300; // Установим минимальную высоту холста, например, 100 пикселей

        // Используем большее из двух значений: вычисленной высоты или минимальной высоты холста
        chart.canvas.parentNode.style.height = Math.max(minHeight, minCanvasHeight) + 'px';
        chart.resize(); // Перерисовываем график
    }

    


}