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
        case "new_dep":
            modal.find('.modal-title').text('Registrar dependencia');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/dep/new', {}, function(){
                modal.find('form').submit(function(e){
                    $.post('/dep/register', $(this).serializeArray()).done(function(data){
                        alert(data.message);
                        if(data.status == 'Ok'){
                            modal.modal('hide');
                        }
                    });
                    e.preventDefault();
                });
            });
            break;
        case "new_alert":
            modal.find('.modal-title').text('Registrar alerta');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/alert/new', {}, function(){
                modal.find('form').submit(function(e){
                    $.post('/alert/register', $(this).serializeArray()).done(function(data){
                        alert(data.message);
                        if(data.status == 'Ok'){
                            modal.modal('hide');
                        }
                    });
                    e.preventDefault();
                });
            });
            break;
        case "new_info":
            modal.find('.modal-title').text('Registrar información');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/info/new', {}, function(){
                $.post('/info/register', $(this).serializeArray()).done(function(data){
                    alert(data.message);
                    if(data.status == 'Ok'){
                        modal.modal('hide');
                    }
                });
                e.preventDefault();
            });
            break;
    }
}



$('#genericModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var modal = $(this);

    var page = 0;
    modalEvents(button, modal, page);
});
