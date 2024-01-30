 //ДОБАВЛЕНИЕ и ИЗМЕНЕНИЕ
 $(".modalButton").each(function () {
    $(this).modalForm({formURL: $(this).data("form-url")});
});
    
  // Загрузочный вид если долгая загрузка   
  $(".modalButton").click(function () {
    var url = $(this).data("form-url") 


    $.each(['add_flight', 'edit_flight', 'add_timetable_flight', 'add_timetable_list', 'edit_timetable_list',], function( i, val ) {
        if (url.includes(val))
        {
            $('body').addClass('opacity-75')
            $('#loader_airplane').addClass('opacity-100')
            $('#loader_airplane').removeClass('opacity-75')
            $('#loader_airplane').toggle()

            let timerId = setInterval(function tick() {
                if ($('#modal').hasClass('show'))
                {
                    $('body').removeClass('opacity-75')
                    $('#loader_airplane').removeClass('opacity-100')
                    $('#loader_airplane').hide()

                    clearInterval() 
                } 
            }, 10);
        }
    });
});
       

//УДАЛЕНИЕ
$(".delete").each(function () {
    $(this).modalForm({formURL: $(this).data("form-url"), isDeleteForm: true});
});

// ['add_timetable', 'add_timetable_week', 'add_timetable_week_group', ]