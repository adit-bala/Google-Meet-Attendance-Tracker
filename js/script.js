$(window).load(function () {
    $(".svg").click(function(){
       $('.hover_button').show();
    });
    $('.hover_button').click(function(){
        $('.hover_button').hide();
    });
    $('.popupCloseButton').click(function(){
        $('.hover_button').hide();
    });
});