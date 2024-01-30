$('.delete_confirm').on('click', function(event) {
    var form =  $(this).closest("form");
    event.preventDefault();
    Swal.fire({
        title: 'Удалить?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '',
        confirmButtonText: 'Да, удалить!',
        cancelButtonText: 'Отмена',
      }).then((result) => {
        if (result.isConfirmed) {
            form.submit();
        }
      })
});