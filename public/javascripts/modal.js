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
                $('#info_datepicker').datetimepicker({
                    format: 'YYYY-MM-DD',
                    defaultDate: new Date().setDate(new Date().getDate() - 1)
                });
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

        // Resources
        case "new_resource":
            modal.find('.modal-title').text('Registrar recurso');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/resource/new', {}, function(){
                modal.find('form').submit(function(e){
                    $.post('/resource/register', $(this).serializeArray()).done(function(data){
                        alert(data.message);
                        if(data.status == 'Ok'){
                            modal.modal('hide');
                        }
                    });
                    e.preventDefault();
                });
            });
            break;

        // Area
        case "new_area":
            modal.find('.modal-title').text('Registrar area');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/area/new', {}, function(){
                modal.find('form').submit(function(e){
                    $.post('/area/register', $(this).serializeArray()).done(function(data){
                        alert(data.message);
                        if(data.status == 'Ok'){
                            modal.modal('hide');
                        }
                    });
                    e.preventDefault();
                });
            });
            break;

        // Individuals
        case "new_ind":
            modal.find('.modal-title').text('Registrar individuo');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/ind/options', {}, function(){
                modal.find('form').submit(function(e){
                    var ind_type = $('input[name=optradio]:checked').val();
                    modal.find('form').load('/ind/select-form', {ind_type: ind_type}, function(data){
                        $('#ind_datepicker').datetimepicker({
                            format: 'YYYY-MM-DD',
                            defaultDate: new Date().setDate(new Date().getDate() - 1)
                        });
                        modal.find('form').submit(function(e){
                            $.post('/ind/register', $(this).serializeArray()).done(function(data){
                                alert(data.message);
                                if(data.status == 'Ok'){
                                    modal.modal('hide');
                                }
                            });
                            e.preventDefault();
                        });
                    });
                    e.preventDefault();
                });
            });
            break;

        // Events
        case "new_event":
            modal.find('.modal-title').text('Registrar evento');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/event/new', {}, function(){
                $('#event_datepicker1').datetimepicker({
                    format: 'YYYY-MM-DD',
                    defaultDate: new Date().setDate(new Date().getDate() - 1)
                });
                $('#event_datepicker2').datetimepicker({
                    format: 'YYYY-MM-DD',
                    defaultDate: new Date().setDate(new Date().getDate() - 1)
                });
                modal.find('form').submit(function(e){
                    $.post('/event/register', $(this).serializeArray()).done(function(data){
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
                                });
                            });
                        });
                    });
                    e.preventDefault();
                });
            });
            break;

        // Usuarios
        case "edit_user":
            modal.find('.modal-title').text('Buscar usuario');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/user/find-users-view', {}, function(){
                modal.find('#find').submit(function(e){
                   modal.find('#search_results').load('/user/results', $(this).serializeArray(), function(){
                       $('#search_results').find('.list-group-item').click(function(){
                           modal.find('#modal_content').load('/user/edit', {id: $(this).data('users_id')}, function(){
                               modal.find('form').submit(function(e){
                                   $.post('/user/update', $(this).serializeArray()).done(function(data){
                                       alert(data.message);
                                       if(data.status == 'Ok'){
                                           modal.modal('hide');
                                       }
                                   });
                                   e.preventDefault();
                               });
                           });
                       });
                   });
                    e.preventDefault();
                });
            });
            break;

        // Alerts
        case "edit_alert":
            modal.find('.modal-title').text('Buscar alerta');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/alert/find-alerts-view', {page: page}, function(){
                $('#alerts_datepicker1').datetimepicker({
                    format: 'YYYY-MM-DD',
                    defaultDate: new Date().setDate(new Date().getDate() - 1)
                });
                $('#alerts_datepicker2').datetimepicker({
                    format: 'YYYY-MM-DD',
                    defaultDate: new Date().setDate(new Date().getDate())
                });
                // If selected directly
                $('#search_results').find('.list-group-item').click(function(){
                    modal.find('#modal_content').load('/alert/edit', {id: $(this).data('alertas_id')}, function(){
                        modal.find('form').submit(function(e){
                            $.post('/alert/update', $(this).serializeArray()).done(function(data){
                                alert(data.message);
                                if(data.status == 'Ok'){
                                    modal.modal('hide');
                                }
                            });
                            e.preventDefault();
                        });
                    });
                });
                modal.find('#find').submit(function(e){
                    modal.find('#search_results').load('/alerts/results', $(this).serializeArray(), function(){
                        $('#search_results').find('.list-group-item').click(function(){
                            modal.find('#modal_content').load('/alert/edit', {id: $(this).data('alerts_id')}, function(){
                                modal.find('form').submit(function(e){
                                    $.post('/alert/update', $(this).serializeArray()).done(function(data){
                                        alert(data.message);
                                        if(data.status == 'Ok'){
                                            modal.modal('hide');
                                        }
                                    });
                                    e.preventDefault();
                                });
                            });
                        });
                    });
                    e.preventDefault();
                });
            });
            break;

        // Infos
        case "edit_info":
            modal.find('.modal-title').text('Buscar alerta');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/alert/find-alerts-view', {page: page}, function(){
                $('#alerts_datepicker1').datetimepicker({
                    format: 'YYYY-MM-DD',
                    defaultDate: new Date().setDate(new Date().getDate() - 1)
                });
                $('#alerts_datepicker2').datetimepicker({
                    format: 'YYYY-MM-DD',
                    defaultDate: new Date().setDate(new Date().getDate())
                });
                // If direct click
                $('#search_results').find('.list-group-item').click(function(){
                    // Infos
                    $('#search_results').load('/info/results', {id: $(this).data('alertas_id')}, function(){
                        $('#search_results').find('.list-group-item').click(function(){
                            modal.find('#modal_content').load('/info/edit', {id: $(this).data('infos_id')}, function(){
                                modal.find('form').submit(function(e){
                                    $.post('/info/update', $(this).serializeArray()).done(function(data){
                                        alert(data.message);
                                        if(data.status == 'Ok'){
                                            modal.modal('hide');
                                        }
                                    });
                                    e.preventDefault();
                                });
                            });
                        })
                    })
                });
                // If Lookup
                modal.find('#find').submit(function(e){
                    modal.find('#search_results').load('/alerts/results', $(this).serializeArray(), function(){
                        $('#search_results').find('.list-group-item').click(function(){
                            // Infos
                            $('#search_results').load('/info/results', {id: $(this).data('alerts_id')}, function(){
                                $('#search_results').find('.list-group-item').click(function(){
                                    modal.find('#modal_content').load('/info/edit', {id: $(this).data('infos_id')}, function(){
                                        modal.find('form').submit(function(e){
                                            $.post('/info/update', $(this).serializeArray()).done(function(data){
                                                alert(data.message);
                                                if(data.status == 'Ok'){
                                                    modal.modal('hide');
                                                }
                                            });
                                            e.preventDefault();
                                        });
                                    });
                                })
                            })
                        });
                    });
                    e.preventDefault();
                });
            });
            break;

        // Resource
        case "edit_resource":
            modal.find('.modal-title').text('Buscar alerta');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/alert/find-alerts-view', {page: page}, function(){
                $('#alerts_datepicker1').datetimepicker({
                    format: 'YYYY-MM-DD',
                    defaultDate: new Date().setDate(new Date().getDate() - 1)
                });
                $('#alerts_datepicker2').datetimepicker({
                    format: 'YYYY-MM-DD',
                    defaultDate: new Date().setDate(new Date().getDate())
                });
                // If direct click
                $('#search_results').find('.list-group-item').click(function(){
                    // Resources
                    $('#search_results').load('/resource/results', {id: $(this).data('alertas_id')}, function(){
                        $('#search_results').find('.list-group-item').click(function(){
                            modal.find('#modal_content').load('/resource/edit', {id: $(this).data('resources_id')}, function(){
                                modal.find('form').submit(function(e){
                                    $.post('/resource/update', $(this).serializeArray()).done(function(data){
                                        alert(data.message);
                                        if(data.status == 'Ok'){
                                            modal.modal('hide');
                                        }
                                    });
                                    e.preventDefault();
                                });
                            });
                        })
                    })
                });
                // If lookup
                modal.find('#find').submit(function(e){
                    modal.find('#search_results').load('/alerts/results', $(this).serializeArray(), function(){
                        $('#search_results').find('.list-group-item').click(function(){
                            // Resources
                            $('#search_results').load('/resource/results', {id: $(this).data('alerts_id')}, function(){
                                $('#search_results').find('.list-group-item').click(function(){
                                    modal.find('#modal_content').load('/resource/edit', {id: $(this).data('resources_id')}, function(){
                                        modal.find('form').submit(function(e){
                                            $.post('/resource/update', $(this).serializeArray()).done(function(data){
                                                alert(data.message);
                                                if(data.status == 'Ok'){
                                                    modal.modal('hide');
                                                }
                                            });
                                            e.preventDefault();
                                        });
                                    });
                                })
                            })
                        });
                    });
                    e.preventDefault();
                });
            });
            break;

        // Area
        case "edit_area":
            modal.find('.modal-title').text('Buscar alerta');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/alert/find-alerts-view', {page: page}, function () {
                $('#alerts_datepicker1').datetimepicker({
                    format: 'YYYY-MM-DD',
                    defaultDate: new Date().setDate(new Date().getDate() - 1)
                });
                $('#alerts_datepicker2').datetimepicker({
                    format: 'YYYY-MM-DD',
                    defaultDate: new Date().setDate(new Date().getDate())
                });
                // If direct click
                $('#search_results').find('.list-group-item').click(function(){
                    $('#search_results').load('/area/results', {id: $(this).data('alertas_id')}, function(){
                        $('#search_results').find('.list-group-item').click(function(){
                            modal.find('#modal_content').load('/area/edit', {id: $(this).data('areas_id')}, function(){
                                modal.find('form').submit(function(e){
                                    $.post('/area/update', $(this).serializeArray()).done(function(data){
                                        alert(data.message);
                                        if(data.status == 'Ok'){
                                            modal.modal('hide');
                                        }
                                    });
                                    e.preventDefault();
                                });
                            });
                        });
                    });
                });
                // If lookup
                modal.find('#find').submit(function(e){
                    modal.find('#search_results').load('/alerts/results', $(this).serializeArray(), function(){
                        $('#search_results').find('.list-group-item').click(function(){
                            $('#search_results').load('/area/results', {id: $(this).data('alerts_id')}, function(){
                                $('#search_results').find('.list-group-item').click(function(){
                                    modal.find('#modal_content').load('/area/edit', {id: $(this).data('areas_id')}, function(){
                                        modal.find('form').submit(function(e){
                                            $.post('/area/update', $(this).serializeArray()).done(function(data){
                                                alert(data.message);
                                                if(data.status == 'Ok'){
                                                    modal.modal('hide');
                                                }
                                            });
                                            e.preventDefault();
                                        });
                                    });
                                });
                            });
                        });
                    });
                    e.preventDefault();
                });
            });
            break;
        // Individuals
        case "edit_ind":
            modal.find('.modal-title').text('Buscar individuo');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/ind/find-ind-view', {}, function () {
                modal.find('#find').submit(function(e){
                    modal.find('#search_results').load('/ind/results', $(this).serializeArray(), function(){
                        $('#search_results').find('.list-group-item').click(function(){
                            modal.find('#modal_content').load('/ind/edit', {id: $(this).data('inds_id'), type: $(this).data('type')}, function(){
                                modal.find('form').submit(function(e){
                                    $.post('/ind/update', $(this).serializeArray()).done(function(data){
                                        alert(data.message);
                                        if(data.status == 'Ok'){
                                            modal.modal('hide');
                                        }
                                    });
                                    e.preventDefault();
                                });
                            });
                        });
                    });
                    e.preventDefault();
                });
            });
            break;
        // Events
        case "edit_event":
            modal.find('.modal-title').text('Buscar alerta');
            modal.find('#modal_content').html("");
            modal.find('#modal_content').load('/alert/find-alerts-view', {page: page}, function () {
                $('#alerts_datepicker1').datetimepicker({
                    format: 'YYYY-MM-DD',
                    defaultDate: new Date().setDate(new Date().getDate() - 1)
                });
                $('#alerts_datepicker2').datetimepicker({
                    format: 'YYYY-MM-DD',
                    defaultDate: new Date().setDate(new Date().getDate())
                });
                modal.find('#find').submit(function(e){
                    modal.find('#search_results').load('/alerts/results', $(this).serializeArray(), function(){
                        $('#search_results').find('.list-group-item').click(function(){
                            $('#search_results').load('/events/results', {id: $(this).data('alerts_id')}, function(){
                                $('#search_results').find('.list-group-item').click(function(){
                                    modal.find('#modal_content').load('/event/edit', {id: $(this).data('events_id')}, function(){
                                        modal.find('form').submit(function(e){
                                            $.post('/event/update', $(this).serializeArray()).done(function(data){
                                                alert(data.message);
                                                if(data.status == 'Ok'){
                                                    modal.modal('hide');
                                                }
                                            });
                                            e.preventDefault();
                                        });
                                    });
                                });
                            });
                        });
                    });
                    e.preventDefault();
                });
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
