
if(window.location.href.search('analitics') >= 0 || window.location.href.search('/timetable/timetable/') >= 0  || 
    window.location.href.search('timetable/timetable_week/') >= 0 || window.location.href.search('timetable/timetable_week_group') >= 0)
{ 
    const weekdaysDictionary_allocation  = {
        "1": "Понедельник",
        "2": "Вторник",
        "3": "Среда",
        "4": "Четверг",
        "5": "Пятница",
        "6": "Суббота",
        "7": "Воскресенье",
    };

    function allocation (meta_datasets=[]) {
        // Создаем пустой объект для хранения уникальных элементов
        const uniqueElements = {};
        const maxCount = {};
        
        $('.ressurce_time_list').empty();
        
        // Итерируемся по элементам массива
        for (const data of meta_datasets) {
            for (const item of data) {
                if ('meta' in item) {
                    const metaList = item.meta.meta;
                    for (const meta of metaList) {
                        if ('day_num' in meta) {
                            const dayNum = meta.day_num;
                            const start_time = meta.start_time;
                            const end_time = meta.end_time;

                            if (!uniqueElements[dayNum]) {
                                uniqueElements[dayNum] = {};
                            }

                            // Если элемент с таким dayNum еще не существует
                            if (!maxCount[dayNum]) {
                                maxCount[dayNum] = {};
                            }

                            if (!maxCount[dayNum][start_time]) {
                                maxCount[dayNum][start_time] = meta.count;
                            } else {
                                maxCount[dayNum][start_time] = Math.max(maxCount[dayNum][start_time], meta.count);
                            }
                            
                            // Если элемент с таким dayNum уже существует, проверяем уникальность start_time и end_time
                            if (uniqueElements[dayNum][start_time]) {

                                uniqueElements[dayNum][start_time] ={
                                    start_time: start_time,
                                    end_time: end_time,
                                    ressource: meta.ressource,
                                    count: maxCount[dayNum][start_time],
                                    flight: meta.flight,
                                    tgo: meta.tgo,
                                };
                            } else {
                                uniqueElements[dayNum][start_time] = [{
                                    start_time: start_time,
                                    end_time: end_time,
                                    ressource: meta.ressource,
                                    count: meta.count,
                                    flight: meta.flight,
                                    tgo: meta.tgo,
                                }];
                            }
                        }
                    }
                }
            }
        }

       
        const resultArray = Object.entries(uniqueElements).map(([key, value]) => [key, ...Object.values(value)]);
        resultArray.forEach(([dayNum, ...elements]) => {
            const container = $("<div class='mb-3 border-rounded allocation-day-module p-3'></div>"); // Добавляем отступы между контейнерами
            container.append($(`<h3>${weekdaysDictionary_allocation[dayNum]}</h3>`)); // Используем h3 для "Дня"
        
            elements.forEach(element => {
                var date = new Date(element.start_time);
                var start_time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                var date = new Date(element.end_time);
                var end_time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            

                const elementDiv = $("<div class='row m-2 border p-2 bg-white'></div>"); // Добавляем рамку и отступы
                elementDiv.append($(`<h4>Начало: <span class="font-weight-bold border-bottom border-success h3">${start_time}</span> | Окончание: <span class="font-weight-bold border-bottom border-success h3">${end_time}</span></h4>`));
                elementDiv.append($(`<h5>Ресурс: ${element.ressource}</h5>`)); // Используем h5 для "Ресурса"
                elementDiv.append($(`<h5>Количество: ${element.count}</h5>`)); // Используем h5 для "Количества"
                elementDiv.append($(`<h5>Рейс: ${element.flight}</h5>`)); // Используем h5 для "Рейса"
                elementDiv.append($(`<h5>ТГО: ${element.tgo}</h5>`)); // Используем h5 для "ТГО"
                // elementDiv.append($(`<h5>Модуль для присоединения людей если есть доступ, если нет просто показывать исполняюще или что их нету</h5>`)); // Используем h5 для "ТГО"
                container.append(elementDiv);
            });
        
            $('.ressurce_time_list').append(container);
        });
        
            // как это закончу менять цвета графика и поставит эти определения в инструкции (красный значит нет ни одного целовека на выполнение данного ресурса, желтый обозначает то что количество людей которые выполняют меньше нужного, синий обозначает что все круто)

    }
}

