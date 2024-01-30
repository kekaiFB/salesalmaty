
$(document).ready(function () {
     // Заявки по модулям показать\скрыть
    //  if (window.location.href.search('/instructions/') >= 0 ){
        $(".row_instructions").hover(
            function() {
              $(this).find(".col_instructions").addClass("border-dark");
              $(this).find(".col_instructions_1").addClass("border-success");
            },
            function() {
              $(this).find(".col_instructions").removeClass("border-dark");
              $(this).find(".col_instructions_1").removeClass("border-success");
            }
            );
        // }
});