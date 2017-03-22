$.fn.modal.prototype.constructor.Constructor.DEFAULTS.backdrop = 'static';
$.fn.modal.prototype.constructor.Constructor.DEFAULTS.keyboard = false;



function modalEvents(button, modal, page ) {
    switch (button.data('action')) {
        case "new_user":
            modal.find('.modal-title').text('Registrar usuario');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/user/new', { }, function(){
                modal.find('form').submit(function (e) {
                    $.post('/user/signup/', $(this).serializeArray()).done(function (data) {
                        alert(data.message);
                        if (data.status== 'Ok'){
                            modal.modal('hide');
                        }
                    });
                    e.preventDefault();
                });
            });
            break;
    }
}