


$('#xml').click(function(){
    alert($(this).data('action'));
})

$('#alerts_datepicker1').datetimepicker({
    format: 'YYYY-MM-DD',
    defaultDate: new Date().setDate(new Date().getDate() - 1)
});
$('#alerts_datepicker2').datetimepicker({
    format: 'YYYY-MM-DD',
    defaultDate: new Date().setDate(new Date().getDate())
});
$(document).find('#find').submit(function(e){
    $(document).find('#search_results').load('/alerts/results', $(this).serializeArray(), function(){
        $('#search_results').find('.list-group-item').click(function(){

            $(document).find('#modal_content').load('/alert/xml', {id: $(this).data('alerts_id')}, function(){
                $(document).find('form').submit(function(e){
                    $.post('/alert/update', $(this).serializeArray()).done(function(data){
                        alert(data.message);
                    });
                    e.preventDefault();
                });
            });
        });
    });
    e.preventDefault();
});