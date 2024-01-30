$(document).ready(function () {

    if(window.location.href.search('/import_check_input_status/comment/') >= 0 )
    {    
        const $tableBody = $('#data-table-comment tbody');
        var original_records = []
        const comment_index = 3
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
                <td>${row.record}</td>
                <td>${actionsHtml}</td>
                </tr>
            `;
            
            $tableBody.append(rowHtml);
        });
 
 

        $('.create-btn').on('click', function() {
            let $currentRow = $(this).closest('tr');
            
            let comment_text = $currentRow.find('td').eq(comment_index).text().trim();
            $('#textEditor').val(comment_text);
            $('#textEditorModal').modal('show');
            
            $('#saveTextEditor').off('click').on('click', function() {
                let comment_text = $('#textEditor').val().trim();
                $currentRow.find('td').eq(comment_index).text(comment_text);           
                $('#textEditorModal').modal('hide');
            });
        });

        $('#applyChanges').click(function() {
            let comment_records = [];
        
            // Собираем все записи из столбца "запись"
            $('#data-table-comment tbody tr').each(function() {
                let comment_record = $(this).find('td').eq(comment_index).text();
                comment_records.push(comment_record);
                
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
                    'field': 'comment',
                    'records': JSON.stringify(comment_records) ,
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