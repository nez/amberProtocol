$.fn.modal.prototype.constructor.Constructor.DEFAULTS.backdrop = 'static';
$.fn.modal.prototype.constructor.Constructor.DEFAULTS.keyboard = false;



function modalEvents(button, modal, page ) {
    switch (button.data('action')) {

        /*
         * -----------------------------------------------
         *  Create Registers
         * -----------------------------------------------
         */

        // Users
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

        // Deps
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

        // Alerts
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

        // Infos
        case "new_info":
            modal.find('.modal-title').text('Registrar información');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/info/new', {}, function(){
                modal.find('form').submit(function(e){
                    $.post('/info/register', $(this).serializeArray()).done(function(data){
                        alert(data.message);
                        if(data.status == 'Ok'){
                            modal.modal('hide');
                        }
                    });
                    e.preventDefault();
                });
            });
            break;

        /*
         * -----------------------------------------------
         *  Edit Registers
         * -----------------------------------------------
         */

        // Deps
        case "edit_dep":
            modal.find('.modal-title').text('Buscar dependencia');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/dep/find-deps-view', {}, function(){
                modal.find('#find').submit(function(e){
                    modal.find('#search_results').load('/dep/results', $(this).serializeArray(), function(){
                        $('#search_results').find('.list-group-item').click(function(){
                            modal.find('#modal_content').load('/dep/edit', {id: $(this).data('deps_id')}, function(){
                                modal.find('form').submit(function(e){
                                    $.post('/dep/update', $(this).serializeArray()).done(function(data){
                                        alert(data.message);
                                        if(data.status == 'Ok'){
                                            modal.modal('hide');
                                        }
                                    });
                                    e.preventDefault();
                                })
                            });
                        });
                    });
                    e.preventDefault();
                })
            });
            break;

        // Alerts
        case "edit_alert":
            modal.find('.modal-title').text('Buscar alerta');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/alert/find-alerts-view', {}, function(){

            })
    }
}



$('#genericModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var modal = $(this);

    var page = 0;
    modalEvents(button, modal, page);
});
