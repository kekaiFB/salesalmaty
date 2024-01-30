$(document).ready(function () {

    if(window.location.href.search('/import_check_input_status/date/') >= 0 )
    {    
        const $tableBody = $('#data-table-date tbody');
        var original_records = []
        const date_start_index = 3
        const length_time_index = 4
        const date_end_index = 5
        data.rows.forEach(function(row) {
            let actionsHtml = '';
            actionsHtml = `
                <div class="d-flex align-items-center">
                    <button class="btn btn-outline-primary create-btn mr-3">Изменить</button>
                </div>
            `;
            let rowHtml = `
                <tr>
                <td>${row.office}</td>
                <td>${row.post}</td>
                <td>${row.fio}</td>
                <td>${row.date_start}</td>
                <td>${row.length_time}</td>
                <td>${row.date_end}</td>
                <td>${actionsHtml}</td>
                </tr>
            `;
            
            $tableBody.append(rowHtml);
        });
 
     function change_date(e)
     {
        $('#meta').addClass('alert alert-warning h6')
        $('#meta').text('Если вычислены все 3 поля для даты, и нужно заново найти значение какого-нибудь из полей, сделайте значения нескольких полей для дат ПУСТЫМИ')
        if ($(e).val() != '')
        {
            if ($('#date-start').val() != '' && $('#length_time').val() != '')
            {
            //нужно найти date-end      
            $('#date-end').val(moment( $('#date-start').val(), 'YYYY-MM-DD').add(parseInt($('#length_time').val()), 'days').subtract(1, 'days').format('YYYY-MM-DD'));
            }
            else if ($('#date-start').val() != '' && $('#date-end').val() != '')
            {
            var startDate = moment($('#date-start').val(), 'YYYY-MM-DD');
            var endDate = moment($('#date-end').val(), 'YYYY-MM-DD');
            var dayDifference = endDate.diff(startDate, 'days');
    
            if (dayDifference > 0) {
                // Если разница положительна, добавляем один день
                dayDifference += 1;
            } else if (dayDifference < 0) {
                // Если разница отрицательна, отнимаем один день
                dayDifference -= 1;
            }
    
            $('#length_time').val(dayDifference);
            }
            else if ($('#date-end').val() != '' && $('#length_time').val() != '')
            {
            //нужно найти date-start
            $('#date-start').val(moment( $('#date-end').val(), 'YYYY-MM-DD').subtract(parseInt($('#length_time').val()), 'days').add(1, 'days').format('YYYY-MM-DD'));
            }
        }
     }
       



        $('.create-btn').on('click', function() {
            let $currentRow = $(this).closest('tr');
            
            let date_start_text = $currentRow.find('td').eq(date_start_index).text().trim();
            let length_time_text = $currentRow.find('td').eq(length_time_index).text().trim();
            let date_end_text = $currentRow.find('td').eq(date_end_index).text().trim();
            

             // Конвертировать формат даты
            let formattedDateStart = formatDate(date_start_text);
            let formattedDateEnd = formatDate(date_end_text);

            $('#date-start').val(formattedDateStart);
            $('#length_time').val(length_time_text);
            $('#date-end').val(formattedDateEnd);
            
            $('#textEditorModal').modal('show');
            
            $('#saveTextEditor').off('click').on('click', function() {
                let date_start_input = $('#date-start');
                let length_time_input = $('#length_time');
                let date_end_input = $('#date-end');
                
                let date_start_text = formatDate_afterInput(date_start_input.val().trim());
                $currentRow.find('td').eq(date_start_index).text(date_start_text);
            
                let length_time_text = length_time_input.val().trim();
                $currentRow.find('td').eq(length_time_index).text(length_time_text);
            
                let date_end_text = formatDate_afterInput(date_end_input.val().trim());
                $currentRow.find('td').eq(date_end_index).text(date_end_text);  
                             
         
                $('#textEditorModal').modal('hide');

            });

            $('#length_time, #date-start, #date-end').change(function () {
                change_date(this)
            });
            
            $('#textEditor').on('input', function() {      
            });
        });

        $('#applyChanges').click(function() {
            let date_start_records = [];
            let length_time_records = [];
            let date_end_records = [];
        
            // Собираем все записи из столбца "запись"
            $('#data-table-date tbody tr').each(function() {
                let date_start_record = $(this).find('td').eq(date_start_index).text();
                date_start_records.push(date_start_record);
                
                let length_time_record = $(this).find('td').eq(length_time_index).text(); 
                length_time_records.push(length_time_record);
                
                let date_end_record = $(this).find('td').eq(date_end_index).text(); 
                date_end_records.push(date_end_record);
            });
            Toast.setTheme(TOAST_THEME.DARK);
            Toast.setPlacement(TOAST_PLACEMENT.TOP_RIGHT);
            Toast.create("Информация", 'Пожалуйста подождите)', TOAST_STATUS.SUCCESS, 10000);
            $('#applyChanges').prop('disabled', true);

            // Отправляем запрос AJAX
            $.ajax({
                url: window.location.href,
                type: 'POST',
                data: {
                    'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val(),
                    'action': 'update',
                    'field': 'date',
                    'date_start': JSON.stringify(date_start_records) ,
                    'length_time': JSON.stringify(length_time_records) ,
                    'date_end': JSON.stringify(date_end_records) ,
                },
                success: function(data) {
                    if (data.redirect_url) {
                        window.location.href = data.redirect_url;
                    }
                    setTimeout(function() {
                        $('#applyChanges').prop('disabled', false);  // Включаем кнопку с задержкой в 1 секунду
                    }, 1000);
                },
                error: function() {
                    alert('Произошла ошибка при отправке запроса.');
                    setTimeout(function() {
                        $('#applyChanges').prop('disabled', false);  // Включаем кнопку с задержкой в 1 секунду
                    }, 1000);
                }
            });
        });


        function formatDate(rawDate) {
            try {
              let dateFormats = [
                /\d{2}.\d{2}.\d{4} \d{2}:\d{2}:\d{2}/,  // dd.mm.yyyy hh:mm:ss
                /\d{4}.\d{2}.\d{2} \d{2}:\d{2}:\d{2}/,  // yyyy.mm.dd hh:mm:ss
                /\d{2}.\d{2}.\d{4} \d{2}:\d{2}:\d{2}/,  // dd-mm-yyyy hh:mm:ss
                /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/,  // yyyy-mm-dd hh:mm:ss
                /\d{2}.\d{2}.\d{4}/,                      // dd.mm.yyyy
                /\d{4}.\d{2}.\d{2}/,                      // yyyy.mm.dd
                /\d{2}-\d{2}-\d{4}/,                      // dd-mm-yyyy
                /\d{4}-\d{2}-\d{2}/                       // yyyy-mm-dd
              ];
          
              for (let format of dateFormats) {
                if (format.test(rawDate)) {
                  let parts = rawDate.split(/[ T]/)[0].replace(/\./g, '-').split('-');
                  if (parts[0].length == 4) {
                    return parts.join('-');
                  } else {
                    return parts.reverse().join('-');
                  }
                }
              }
          
              // Если не удалось найти подходящий формат, вернуть оригинальное значение
              return rawDate.split(/[ T]/)[0].replace(/\./g, '-');
            } catch (error) {
              console.error(`Ошибка при форматировании даты: ${error.message}`);
              return rawDate;
            }
          }

          
          
          $('.calculate_date').click(function() {
            $('#data-table-date tbody tr').each(function() {
                let date_start_record = formatDate($(this).find('td').eq(date_start_index).text());
                let length_time_record = $(this).find('td').eq(length_time_index).text(); 
                let date_end_cell = $(this).find('td').eq(date_end_index);
                let date_end_record = formatDate(date_end_cell.text()); 
                
                if (date_start_record != '' && length_time_record != '') {
                    // Рассчитываем date-end
                    let calculatedDateEnd = moment(date_start_record, 'YYYY-MM-DD').add(parseInt(length_time_record), 'days').subtract(1, 'days').format('DD.MM.YYYY');
        
                    // Обновляем значение в ячейке для date-end
                    date_end_cell.text(calculatedDateEnd);
                }
                else if (date_start_record != '' && date_end_record != '') {
                    var startDate = moment(date_start_record, 'YYYY-MM-DD');
                    var endDate = moment(date_end_record, 'YYYY-MM-DD');
                    var dayDifference = endDate.diff(startDate, 'days');
        
                    if (dayDifference > 0) {
                        // Если разница положительна, добавляем один день
                        dayDifference += 1;
                    } else if (dayDifference < 0) {
                        // Если разница отрицательна, отнимаем один день
                        dayDifference -= 1;
                    }
        
                    // Обновляем значение в ячейке для length_time
                    let length_time_cell = $(this).find('td').eq(length_time_index);
                    length_time_cell.text(dayDifference);
                }
                else if (date_end_record != '' && length_time_record != '') {
                    // Рассчитываем date-start
                    let calculatedDateStart = moment(date_end_record, 'YYYY-MM-DD').subtract(parseInt(length_time_record), 'days').add(1, 'days').format('DD.MM.YYYY');
        
                    // Обновляем значение в ячейке для date-start
                    $(this).find('td').eq(date_start_index).text(calculatedDateStart);
                }
            });
        });
        
        // Функция для форматирования даты
        function formatDate_afterInput(rawDate) {
            try {
                let dateFormats = [
                    /\d{2}.\d{2}.\d{4}/,  // dd.mm.yyyy
                    /\d{4}-\d{2}-\d{2}/   // yyyy-mm-dd
                ];

                for (let format of dateFormats) {
                    if (format.test(rawDate)) {
                        return rawDate.split(/[ T]/)[0].split('-').reverse().join('.');
                    }
                }

                // Если не удалось найти подходящий формат, вернуть оригинальное значение
                return rawDate;
            } catch (error) {
                console.error(`Ошибка при форматировании даты: ${error.message}`);
                return rawDate;
            }
}
    // ----------------------------------------------------------------
    }
});