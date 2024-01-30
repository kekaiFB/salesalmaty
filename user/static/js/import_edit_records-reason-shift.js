$(document).ready(function () {

    if(window.location.href.search('/import_check_input_status/reason/') >= 0 || window.location.href.search('/import_check_input_status/shift/') >= 0 )
    {          
        const $tableBody = $('#data-table-reason-shift tbody');
        const modifyColumn = 3;
        const filed_name_input = $('.filed_name_input').val();
        const filed_name_original = $('.field_name_original').val();
 

        data.rows.forEach(function(row) {
            let actionsHtml = '';     

            actionsHtml = `
                <div class="d-flex align-items-center">
                    <select name="existing_option" class="form-control selectpicker mr-2" data-live-search="true" data-hide-disabled="true" title="${filed_name_input}...">
                        ${[`<option value="">------</option>`].concat(row.options.map(option => `<option value="${option}">${option}</option>`)).join('')}
                    </select>
                </div>
            `;
            let rowHtml = `
                <tr>
                    <td>${row.office}</td>
                    <td>${row.post}</td>
                    <td>${row.fio}</td>
                    <td>${row.record}</td>
                    <td>${actionsHtml}</td>
                </tr>
            `;
            
            $tableBody.append(rowHtml);
        });



        // Обработчик события change для select
        $('select[name="existing_option"]').on('change', function() {
            let $row = $(this).closest('tr');
            let chosenOption = $(this).val();
            
            $row.find('td').eq(modifyColumn).text(chosenOption);
        });

        $('.calculate_universal').click(function() {
            // Получаем выбранное значение из выпадающего списка
            let selectedOption = $('select[name="existing_option"]').val();
      
            // Обходим все строки в таблице
            $('#data-table-reason-shift tbody tr').each(function() {
              // Находим ячейку в столбце "Причины"
              let recordCell = $(this).find('td').eq(3);
      
              // Заменяем значение в ячейке на выбранную опцию
              recordCell.text(selectedOption);
            });
          });


        $('#applyChanges').click(function() {
            let records = [];
        
            if(window.location.href.search('/import_check_input_status/shift/') >= 0 )
            {  
                // Собираем все записи из столбца "запись"
                $('#data-table-reason-shift tbody tr').each(function() {
                    let office = $(this).find('td:nth-child(1)').text();    
                    let post = $(this).find('td:nth-child(2)').text();    
                    let fio = $(this).find('td:nth-child(3)').text();    
                    let shift = $(this).find('td:nth-child(4)').text();                     

                    records.push({
                        office: office,
                        post: post,
                        fio: fio,
                        shift: shift
                    });
                }); 
            }
            if(window.location.href.search('/import_check_input_status/reason/') >= 0 )
            {
                // Собираем все записи из столбца "запись"
                $('#data-table-reason-shift tbody tr').each(function() {
                    let record = $(this).find('td:nth-child(4)').text(); 
                    records.push(record);
                }); 
            }
       
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
                    'field': filed_name_original,
                    'records': JSON.stringify(records) ,
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


       

    // ----------------------------------------------------------------
    }
});