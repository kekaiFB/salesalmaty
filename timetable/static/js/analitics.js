$(document).ready(function () {
    if(window.location.href.search('analitics') >= 0 || window.location.href.search('/timetable/timetable/') >= 0  || 
    window.location.href.search('timetable/timetable_week/') >= 0 || window.location.href.search('timetable/timetable_week_group') >= 0)
    { 
        // Инициализируем начальное состояние
        $('.inputs-range-date, .inputs-single-date').hide();
        $('.resource_list').attr('data-live-search', 'true');
        $('.resource_list').attr('data-hide-disabled', 'true');
        $('.resource_list').attr('title', 'Выберите ресурс');
        $('.resource_list').selectpicker({ 
            noneResultsText:'   Результатов нет',
        });
        
        // Инициализируем график
        chart_analitics_init()
        $('.div-chart-analitics').hide()
        $('.generate_graphic_button').hide()

        $('input[name="date-selection"]').change(function() {       
            if($('#single-date').is(':checked')) { 
                handleSingleDate(); 
            } 
            else if($('#range-date').is(':checked')) { 
                handleRangeDate(); 
            }    
        });

        function handleSingleDate() {
            $('#input-single-date').val(new Date().toJSON().slice(0,10));

            $('.inputs-single-date').show();
            $('.inputs-range-date').hide();
            // Скрываем оба элемента ввода
            $('.meta-date-info').removeClass('mt-2 h6 alert alert-danger');
            $('.meta-date-info').text('');
            $('.generate_graphic_button').show('slow')
            $('#range-date-first, #range-date-second').val('');

            check_visible_geterate_button()
        }
        function getDateAfterDays(days) {
            var date = new Date();  // получаем текущую дату
            date.setDate(date.getDate() + days);  // добавляем нужное количество дней
            return date.toJSON().slice(0,10);  // возвращаем дату в формате YYYY-MM-DD
        }

        function handleRangeDate() {            
            $('#range-date-first').val(new Date().toJSON().slice(0,10));
            $('#range-date-second').val(getDateAfterDays(6));

            $('.inputs-range-date').show();
            $('.inputs-single-date').hide();
            $('#input-single-date').val('');

            checkDateDays()
        }

        function checkDateDays() {
            if ($('#range-date-first').val() != '' && $('#range-date-second').val() != '')
            {
                var dateRange1 = $('#range-date-first').val();
                var dateRange2 = $('#range-date-second').val();
                        
                var diffDays = calculateDateDifference(dateRange1, dateRange2);

                if (diffDays > 6) {
                    $('.meta-date-info').addClass('mt-2 h6 alert alert-danger')
                    $('.meta-date-info').text('Диапазон не может превышать 7 дней');
                    $('.generate_graphic_button').hide()

                } else if (diffDays<0) {
                    $('.meta-date-info').addClass('mt-2 h6 alert alert-danger')
                    $('.meta-date-info').text('Диапазон не может быть отрицательным');
                    $('.generate_graphic_button').hide()
                    
                } else {
                    // Скрываем оба элемента ввода
                    $('.meta-date-info').removeClass('mt-2 h6 alert alert-danger');
                    $('.meta-date-info').text('');
                    
                    if ($('select[name="resource_list"]').val() != '') {
                        $('.generate_graphic_button').show('slow')
                    }
                    
                }
            }
        }     
        // function combineResourcePeaks(resourcePeaks) {
        //     var combinedResourcePeaks = {};
            
        //     // Перебираем дни недели
        //     for (var dayOfWeek in resourcePeaks) {
        //         var dayData = resourcePeaks[dayOfWeek];
                
        //         // Перебираем часы и минуты в текущем дне
        //         for (var hourMinute in dayData) {
        //             var hourData = dayData[hourMinute];
        //             if (!combinedResourcePeaks[hourMinute] || hourData > combinedResourcePeaks[hourMinute]) {
        //                 // Если нет записи для текущего часа или текущее значение больше,
        //                 // то обновляем значение в объединенных данных.
        //                 combinedResourcePeaks[hourMinute] = hourData;
        //             }
        //         }
        //     }
        //     return combinedResourcePeaks;
        // }

        
        function check_visible_geterate_button() {
            
            // Проверяем выбран ли ресурс
            if ($('select[name="resource_list"]').val() == '') {
                $('.generate_graphic_button').hide();
                return;  // Если ресурс не выбран, то завершаем функцию 
            }
        
            // Если "Одиночная дата" выбрана, то проверяем заполнено ли поле ввода
            if($('#single-date').is(':checked')) {
                if($('#input-single-date').val() == ''){
                    $('.generate_graphic_button').hide();
                    return;  // Если поле ввода пустое, то завершаем функцию 
                }
            } 
            else {
                // Иначе проверяем поля ввода для дат диапазона
                if ($('#range-date-first').val() == '' || $('#range-date-second').val() == '') {
                    $('.generate_graphic_button').hide();
                    return;  // Если хотя бы одно из полей пустое, то завершаем функцию 
                } else {
                    checkDateDays()
                    if ($('.generate_graphic_button').is(':visible')) {} else {
                        return; 
                    }
                }
            }
            // Если все требования выполняются, то показываем кнопку
            $('.generate_graphic_button').show('slow');
        }
        $('select[name="resource_list"], #input-single-date, #range-date-first, #range-date-second').change(check_visible_geterate_button);
        


       function getDateArray() {
            var datesArray = [];
            if ($("#single-date").is(":checked")) {
                var singleDate = $('#input-single-date').val();
                if (datesArray.indexOf(singleDate) == -1) {
                    datesArray.push(singleDate);
                }
            } else if ($("#range-date").is(":checked")) {
                var dateFirst = $('#range-date-first').val();
                var dateSecond = $('#range-date-second').val();

                var fromDate = new Date(dateFirst);
                var toDate = new Date(dateSecond);

                if (fromDate <= toDate) {
                    for (var d = fromDate; d <= toDate; d.setDate(d.getDate() + 1)) {
                        var dateToLocalFormat = new Date(d).toISOString().split('T')[0];
                        if (datesArray.indexOf(dateToLocalFormat) == -1) {
                            datesArray.push(dateToLocalFormat);
                        }
                    }
                }
            }
            
            return datesArray;
        }

        function calculateDateDifference(date1, date2) {
            var firstDate = new Date(date1);
            var secondDate = new Date(date2);
            var diff = secondDate - firstDate;
            return Math.floor(diff / (1000 * 60 * 60 * 24));
        }

        const weekdaysDictionary = {
            1: "Пн",
            2: "Вт",
            3: "Ср",
            4: "Чт",
            5: "Пт",
            6: "Сб",
            7: "Вс",
          };

        function getFilteredUniqueValues(columnIndex) {
            var filteredData = analitics_dt.column(columnIndex, { search: 'applied' }).data().toArray();
            
            // Преобразовываем массив в Set для удаления дубликатов
            var uniqueSet = new Set(filteredData);
            
            // Преобразовываем Set обратно в массив
            var uniqueData = Array.from(uniqueSet);
            
            return uniqueData;
        }
        


        $('.generate_graphic_button').on('click', function() {

            const selectedValue = $('select[name="resource_list"]').val()
            const datesArray = getDateArray();
  
            
            // НАДО БРАТЬ ПОСЛЕДНЮЮ КОЛОНКУ analitics_dt
            var timetable_ids = getFilteredUniqueValues(analitics_dt.columns().indexes().length - 1);

            $.ajax({                       
                url: window.location.href,
                method : "post",
                dataType : "json",                 
                data: {
                    'id_ressource': selectedValue,  
                    'datesArray': datesArray,
                    'timetable_ids': timetable_ids,
                    'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val() // Это новый код
                },
                success: function (data) { 
                    if (data.error) {
                        Toast.setTheme(TOAST_THEME.DARK);
                        Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                        Toast.create("Ошибка", data.error, TOAST_STATUS.ERROR, 10000);
                    } else {
                        const dict = data.date_dict
                        const max_count = parseInt(data.max_count) + 2 // потолок графика по Y оси
                        // console.log('dict', dict)
                        var count_datasets = 0;
                        var datasets=[];
                        var dataset=[];

                        var resource_peaks = {};

                        var meta_datasets=[];
                        var meta_dataset=[];
  
                        for (var year in dict) {
                          for (var month in dict[year]) {
                              for (var week_month in dict[year][month]) {
                                  for (var day_week in dict[year][month][week_month]) {
                                    resource_peaks[day_week] = {};
                                      count_datasets+=1
                                      dataset = []
                                      meta_dataset = []
                                      for (var hour in dict[year][month][week_month][day_week]) {
                                          // dataset[hour] = {}
                                          // meta_dataset[hour] = {}
                                        //   resource_peaks[day_week][hour] = {};
                                            // Расчет начального и конечного времени для часа
                                            var start_x = hour * 60;
                                            var end_x = start_x + 59; // Предполагается, что минуты варьируются от 0 до 59

                                            var max_count_hour = 0; // Инициализация значением 0

                                          for (var minute in dict[year][month][week_month][day_week][hour]) {
                                            

                                              // Есть данные
                                              if (countNestedDicts(dict[year][month][week_month][day_week][hour][minute]) != 0)
                                              {
                                                if (dict[year][month][week_month][day_week][hour][minute]["count"] > max_count_hour) {
                                                    max_count_hour = dict[year][month][week_month][day_week][hour][minute]["count"];
                                                }

                                                meta_dataset.push({
                                                    x:  parseInt(hour) * 60 +parseInt(minute), // минуты от 0 до 1440 
                                                    meta: dict[year][month][week_month][day_week][hour][minute]
                                                })
                                                
                                                var finish_minus_count = 0;
                                                meta_dict = dict[year][month][week_month][day_week][hour][minute]["meta"]

                                                for (var i = 0; i < meta_dict.length; i++) {
                                                    if (meta_dict[i].status_doubling === 'false') {
                                                        for (var j = i + 1; j < meta_dict.length; j++) {
                                                            if (
                                                                meta_dict[j].end_time === meta_dict[i].start_time &&
                                                                meta_dict[j].status_doubling === 'false'
                                                            ) {
                                                                finish_minus_count += meta_dict[i].current_count;
                                                                meta_dict[i].status_doubling = 'true';
                                                                meta_dict[j].status_doubling = 'true';
                                                            } else if (
                                                                meta_dict[i].end_time === meta_dict[j].start_time &&
                                                                meta_dict[j].status_doubling === 'false'
                                                            ) {
                                                                finish_minus_count += meta_dict[j].current_count;
                                                                meta_dict[i].status_doubling = 'true';
                                                                meta_dict[j].status_doubling = 'true';
                                                            }
                                                        }
                                                    }
                                                }
                                                  dataset.push({
                                                          x:  parseInt(hour) * 60 + parseInt(minute),// минуты от 0 до 1440 
                                                          y: parseInt(dict[year][month][week_month][day_week][hour][minute]["count"]) - parseInt(finish_minus_count)
                                                  })
                                              } else {
                                                dataset.push({
                                                        x: parseInt(hour) * 60 + parseInt(minute),// минуты от 0 до 1440 
                                                        y: null
                                                })
                                              }
                                          }   
                                          resource_peaks[day_week][start_x] = max_count_hour
                                          resource_peaks[day_week][end_x] = max_count_hour
                                      } 
                                      //создать словарь resource_peaks
                                      // для resource_peaks[day_week]= словарь из словарей start_x = начало часа, end_x = конец часа, max_count = максимальное значение dict[year][month][week_month][day_week][hour][minute]["count"] за определенные час
                                    //   то есть для каждого resource_peaks[day_week] будет 23 словаря 
                                      datasets.push({
                                          label: weekdaysDictionary[parseInt(day_week)],
                                          data: dataset,
                                          fill: true,
                                          tension: 0,
                                          backgroundColor: 'rgba(0, 0, 255, 0.2)', // Установили синий цвет столбцов
                                        //   barSpacing: 0, // Убрали отступы между столбцами
                                        //   barPercentage: 1, // Убрали расстояние между столбцами
  
                                      }) 
                                      meta_datasets.push(meta_dataset)
                                  }    
                              }
                          }
                        }
    
                        const current_res = $('select[name="resource_list"]').find(":selected").text()
                        
                        // console.log('datasets', datasets)
                        // console.log('meta_datasets', meta_datasets)
                        // console.log('current_res', current_res)

                        chart_analitics_update(datasets, meta_datasets, max_count, current_res)
                        allocation(meta_datasets)
  
                    }
                },
                error: function (error) {
                    Toast.setTheme(TOAST_THEME.DARK);
                    Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
                    Toast.create("Ошибка", 'Ошибка на стороне сервера', TOAST_STATUS.ERROR, 3000);
                }
            });
        });
        
        
        // Получение ошибок из HTML
        const errorElements = document.querySelectorAll('.error-list li');
        const errors = Array.from(errorElements).map(element => element.textContent);

        const errorsPerPage = 13;
        const errorListContainer = document.querySelector('.error-list');
        const paginationContainer_errors = document.getElementById('pagination');

        function renderErrorsPage(pageNumber) {
            const start = (pageNumber - 1) * errorsPerPage;
            const end = start + errorsPerPage;
            const pageErrors = errors.slice(start, end);

            errorListContainer.innerHTML = '';
            pageErrors.forEach(error => {
                errorListContainer.innerHTML += `<li>${error}</li>`; // Keep the original style of adding list items
            });

            updatePagination_errors(pageNumber, Math.ceil(errors.length / errorsPerPage));
        }
        function updatePagination_errors(currentPage, pageCount) {
            paginationContainer_errors.innerHTML = '';

            // Добавить первую страницу и эллипсисы, если нужно
            if (currentPage > 3) {
                paginationContainer_errors.appendChild(createPaginationItem_erros(1));
                if (currentPage > 4) {
                    paginationContainer_errors.appendChild(createPaginationEllipsis_erros());
                }
            }

            // Добавить страницы вокруг текущей страницы
            for (let i = Math.max(1, currentPage - 2); i <= Math.min(pageCount, currentPage + 2); i++) {
                paginationContainer_errors.appendChild(createPaginationItem_erros(i, currentPage === i));
            }

            // Добавить эллипсисы и последнюю страницу, если нужно
            if (currentPage < pageCount - 2) {
                if (currentPage < pageCount - 3) {
                    paginationContainer_errors.appendChild(createPaginationEllipsis_erros());
                }
                paginationContainer_errors.appendChild(createPaginationItem_erros(pageCount));
            }
        }

        function createPaginationItem_erros(page, isActive = false) {
            const li = document.createElement('li');
            li.className = 'page-item' + (isActive ? ' active' : '');
            const a = document.createElement('a');
            a.className = 'page-link';
            a.textContent = page;
            a.href = '#';
            a.addEventListener('click', (event) => {
                event.preventDefault();
                renderErrorsPage(page);
            });
            li.appendChild(a);
            return li;
        }

        function createPaginationEllipsis_erros() {
            const li = document.createElement('li');
            li.className = 'page-item disabled';
            const span = document.createElement('span');
            span.className = 'page-link';
            span.textContent = '...';
            li.appendChild(span);
            return li;
        }

        // Добавляем обработчик события на контейнер пагинации для делегирования
        paginationContainer_errors.addEventListener('click', function(event) {
            event.preventDefault();
            const pageItem = event.target.closest('.page-item');
            if (pageItem && !pageItem.classList.contains('active') && !pageItem.classList.contains('disabled')) {
                const pageNumber = parseInt(event.target.textContent);
                if (pageNumber) {
                    renderErrorsPage(pageNumber);
                }
            }
        });

        // Инициализация первой страницы
        renderErrorsPage(1);
                
        
        
        
        // Получаем все элементы с классом 'card_li' в контейнере 'timetablesContainer'
        const timetableElements = document.querySelectorAll('.timetablesContainer .card_li');

        // Конвертируем NodeList в массив
        const timetables = Array.from(timetableElements);

        const timetablesPerPage = 1;
        const timetableListContainer = document.querySelector('.timetablesContainer');
        const paginationContainer_timetables = document.getElementById('timetablesPagination');

        function rendertimetablesPage(pageNumber) {
            const start = (pageNumber - 1) * timetablesPerPage;
            const end = start + timetablesPerPage;
            const pageTimetables = timetables.slice(start, end);

            // Очищаем контейнер перед добавлением новых элементов
            timetableListContainer.innerHTML = '';

            // Добавляем элементы текущей страницы в контейнер
            pageTimetables.forEach(timetable => {
                timetableListContainer.appendChild(timetable.cloneNode(true));
            });

            // Обновляем пагинацию
            updatePagination(pageNumber, Math.ceil(timetables.length / timetablesPerPage));
        }

        function updatePagination(currentPage, pageCount) {
            paginationContainer_timetables.innerHTML = '';
            
            // Добавить первую страницу и эллипсисы, если нужно
            if (currentPage > 3) {
                paginationContainer_timetables.appendChild(createPaginationItem(1));
                if (currentPage > 4) {
                    paginationContainer_timetables.appendChild(createPaginationEllipsis());
                }
            }
            
            // Добавить страницы вокруг текущей страницы
            for (let i = Math.max(1, currentPage - 2); i <= Math.min(pageCount, currentPage + 2); i++) {
                paginationContainer_timetables.appendChild(createPaginationItem(i, currentPage === i));
            }
            
            // Добавить эллипсисы и последнюю страницу, если нужно
            if (currentPage < pageCount - 2) {
                if (currentPage < pageCount - 3) {
                    paginationContainer_timetables.appendChild(createPaginationEllipsis());
                }
                paginationContainer_timetables.appendChild(createPaginationItem(pageCount));
            }
        }

        function createPaginationItem(page, isActive = false) {
            const li = document.createElement('li');
            li.className = 'page-item' + (isActive ? ' active' : '');
            const a = document.createElement('a');
            a.className = 'page-link';
            a.textContent = page;
            a.href = '#';
            a.addEventListener('click', (event) => {
                event.preventDefault();
                rendertimetablesPage(page);
            });
            li.appendChild(a);
            return li;
        }

        function createPaginationEllipsis() {
            const li = document.createElement('li');
            li.className = 'page-item disabled';
            const a = document.createElement('a');
            a.className = 'page-link';
            a.textContent = '...';
            a.href = '#';
            li.appendChild(a);
            return li;
        }

        // Инициализируем первую страницу
        rendertimetablesPage(1);

        
        
        // var dateTgoDataElement = document.getElementById("dateTgoData");
        // var dateTgoData = JSON.parse(dateTgoDataElement.getAttribute("data-date-tgo"));
        $('.div-chart-analitics').hide() 
        $('.div_data_analitics_meta').hide() 

        $('.analitics_edit_div').on('click', function() {
            $('.div_data_analitics_meta').toggle('slow')

        });
    } 
});

function countNestedDicts(obj) {
    var count = 0;
  
    for (var key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        count++; // Увеличиваем счетчик, если значение является объектом
  
        // Рекурсивно вызываем функцию для подсчета вложенных словарей
        count += countNestedDicts(obj[key]);
      }
    }
  
    return count;
  }





