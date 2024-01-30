$(document).ready(function () {
    var savedSelected;
    var table = $('#bootstrapdatatable').DataTable({
        deferRender: true,
        orderCellsTop: true,
        fixedHeader: true,
        
        //--------------------Память фильторв---------------------------
        stateSave: true,
        dom: 'lfrtip',
        select: true,
        searchPanes: {
            initCollapsed: true,
        },
                
        search: {
            "regex": true
        },
        
        columnDefs: [
            { targets: [0, 11], visible: false },
            { targets: [1, 2, 3, 4, 5], searchPanes: { show: true } },
        ],   
        
        stateSaveParams: function (s, data) {
            
            //выбор строки
            data.selected = this.api().rows({selected:true})[0]
        },

    
        //---------------Конец Память фильторв конец-------------------
        columnDefs: [
            {
                targets: 0,
                visible: false,
            },
            {
                targets: 11,
                visible: false,
            },
            
        ],

        //Для Show
        "aLengthMenu": [[3, 7, 10, 25, -1], [3, 7, 10, 25, "All"]],
        "iDisplayLength": 7,
    
        initComplete: function () {
            var state = this.api().state.loaded();
            if ( state ) {
                savedSelected = state.selected;
            }      
        },

    });


    table.row(savedSelected).select()
    
        
    
    //Сбросить фильтры
    $('#resetFilter').on('click', function (e) {
        resetFilters()
    });

    function resetFilters() {
        table.state.clear();
        var tableId = table.table().node().id;

        for (var i = localStorage.length - 1; i >= 0; i--) {
            var key = localStorage.key(i);
            var pattern = new RegExp('^' + window.location.href + '_' + tableId + '.*');
            if (pattern.test(key)) {
                localStorage.removeItem(key);
            }
        }
        
        location.reload()
    }

    //Выбор строки при наведении 
    $(function() {
        $('#bootstrapdatatable')
        .on('mouseenter', 'tr.mySelect',  function() {
            $(this).css("background-color", "#e5f4ff");
            
        })
        .on('mouseleave', 'tr.mySelect',  function() {
            $(this).css("background-color", "white");
        });
    })

    //Выбор строки при клике 
    $('#bootstrapdatatable tbody').on('click', 'tr.mySelect', function () {
        $('.th.sorting').click();

        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');

            
            $(this).find('td input.delete_confirm').removeClass("btn-danger");
            $(this).find('td input.delete_confirm').addClass("btn-outline-danger");

            $(this).find('td button').removeClass("btn-success");
            $(this).find('td button').addClass("btn-outline-success");
            
            $(this).find('td.notfound').removeClass('notfoundColor');
        } else {
            //удаляю у не выбранных кнопок класс
            table.$('tr.selected').find('td button').removeClass("btn-success");
            table.$('tr.selected').find('td button').addClass("btn-outline-success");

            table.$('tr.selected').find('td input.delete_confirm').removeClass("btn-danger");
            table.$('tr.selected').find('td input.delete_confirm').addClass("btn-outline-danger");

            //удаляю не выбранным и добавляю выбранной строке клас
            table.$('tr.selected').removeClass('selected');
            table.$('td.notfound').removeClass('notfoundColor');
            $(this).addClass('selected');
            $(this).find('td.notfound').addClass('notfoundColor');

            //добавляю выбранной кнопке класс
            $(this).find('td button').removeClass("btn-outline-success");
            $(this).find('td button').addClass("btn-success");

            $(this).find('td input.delete_confirm').removeClass("btn-outline-danger");
            $(this).find('td input.delete_confirm').addClass("btn-danger");

        }
    });

    //Выбранная строка при перезугрзке страницы
    if(typeof savedSelected !== "undefined" && savedSelected.length !== 0){
        table.row(savedSelected).select()

        $(this).find('td.notfound').addClass('notfoundColor');

        //добавляю выбранной кнопке класс
        $('#bootstrapdatatable tbody .selected').find('td button').removeClass("btn-outline-success");
        $('#bootstrapdatatable tbody .selected').find('td button').addClass("btn-success");

        $('#bootstrapdatatable tbody .selected').find('td input.delete_confirm').removeClass("btn-outline-danger");
        $('#bootstrapdatatable tbody .selected').find('td input.delete_confirm').addClass("btn-danger");
    } 


    var columnNames = [];

    var columnNames = table.columns().header().toArray().map(function(header) {
        return $(header).text();
    });
    
    

    const append_icon_to_pah = '.resetDiv'     
    const insert_additional_options_path = '.insert_additional_options_after_path'
    init_additional_options(table, append_icon_to_pah, insert_additional_options_path, insert_after=true, flag_date=true, columns_date=[columnNames.indexOf('Начало'), columnNames.indexOf('Окончание')]) 

    //Каскадные фильтры
    var selected_val_column = {}
    var column_active = -1
    init_dt_select(table, selected_val_column, column_active)   

    // $('#ButtonDateFilter').click(); 
    $("body").css("opacity", 1);


    drawTable(table);
    init();

    table.on('draw', function () {
        drawTable(table);
    });
});





