
$(document).ready(function () {
    if (window.location.href.search('/historyTimetable/') >= 0 )
    {
        $('tbody tr').each(function() {
            var rowDataArray = [];
            var actualData = $(this).find('td');
            if (actualData.length > 0) {
                actualData.each(function() {
                    rowDataArray.push($(this).html());
                });
                if (rowDataArray[1] == '' || rowDataArray[2] == '' || rowDataArray[10] == '')
                {
                 console.log($(this).find('.exists').html(''))   
                }
            }
        });
        
    }
});