$(document).ready(function () {
    if(window.location.href.search('/shift-office/') >= 0  )
    {   
  
        $("#step-two").hide();
        $("#step-three").hide();
        $("#len_full_cicle").attr('readonly', true);

       

        // Добавляем обработчик события change с делегированием
        $(document).on('change', '.shift_list', function() {
            var selectedShift = $(this).val();

            // Удалите класс "selected" у всех span
            $("span.cycle_start_date").removeClass("selected");
            
            // Ищем соответствующий элемент с data-shift равным выбранному сдвигу
            var selectedDateSpan_start = $("span[data-shift='" + selectedShift + "'].cycle_start_date");
            var selectedDateSpan_end = $("span[data-shift='" + selectedShift + "'].cycle_end_date");

            // Получаем значение даты из выбранного элемента span
            var selectedDate_start = selectedDateSpan_start.text();
            var selectedDate_end = selectedDateSpan_end.text();
            
            // Задаем значение выбранной даты в input
            $("#selected_start_date").val(selectedDate_start);
            $("#selected_end_date").val(selectedDate_end);
            
            // Добавляем класс "selected" к выбранному span
            selectedDateSpan_start.addClass("selected");
            
            ckeckStepTwo(selectedShift)
            updateFullCycleAndDuration();
        });

        // Функция для вычисления разницы в днях между двумя датами
        function getDaysDifference(startDate, endDate) {
            var start = new Date(startDate);
            var end = new Date(endDate);
            return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
        }

        // Функция для обновления поля 'full_cicle' и расчета длительности цикла
        function updateFullCycleAndDuration() {
            var startDate = $("#selected_start_date").val();
            var endDate = $("#selected_end_date").val();

            if (startDate && endDate) {
                // Установка min, max и readonly для 'full_cicle'
                $("#full_cicle").attr('min', startDate);
                $("#full_cicle").attr('max', endDate);

                // Расчет и отображение длительности цикла
                var duration = getDaysDifference(startDate, endDate);
                $("#len_full_cicle").val(duration);

                // Показываем поля
                $("#full_cicle").closest('div').show();
                $("#len_full_cicle").closest('div').show();
            } else {
                // Скрываем поля и удаляем атрибуты
                $("#full_cicle").closest('div').hide();
                $("#len_full_cicle").closest('div').hide();
                $("#full_cicle").removeAttr('min max readonly');
                $("#len_full_cicle").val('');
            }
            ckeckStepThree()

        }

        // Функция для проверки и отображения поля 'full_cicle'
        function ckeckStepTwo(selectedShift) {
            if (selectedShift == '') {    
                $("#step-two").hide();
            } else {    
                $("#step-two").show();
            } 
        }
        function ckeckStepThree(selectedShift) {
            if ($("#len_full_cicle").val() == '') {    
                $("#step-three").hide();
            } else {    
                $("#step-three").show();
            } 
        }
        
        // Обработчики событий изменения дат
        $("#selected_start_date, #selected_end_date").change(function() {
            updateFullCycleAndDuration();
        });
        $('.shift_list').select2();
        // Установка минимальной ширины для Select2 контейнера
        $('.shift_list').css('min-width', '100px');

        updateFullCycleAndDuration();
        $('.shift_list').val($('#selected_shift_input').val()).change();

        $("#apply_changes").click(function() {
            // Получаем выбранную дату
            var startDate = $("#selected_start_date").val();
            var endDate = $("#selected_end_date").val();
            
            // Получаем ID смены из выбранного элемента span
            var selectedShiftID = $("span.cycle_start_date.selected").data("shift");
            
            // Создаем объект данных для отправки на сервер
            var dataToSend = {
                'action': 'update_shiftOffice',
                'startDate': startDate,
                'endDate': endDate,
                'shiftID': selectedShiftID,
                'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
            };
            
            // Отправляем данные на сервер
            $.ajax({
                url: window.location.href,
                type: 'POST',
                data: dataToSend,
                success: function (data) {
                    // Перезагружаем страницу после успешной отправки
                    location.reload();
                },
                error: function (xhr, status, error) {
                    alert('Произошла ошибка при загрузке данных: ' + error);
                }
            });
        });
    }
});