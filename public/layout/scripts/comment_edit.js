$(document).ready(function(){
   $('.more').click(function(){
     if($('.more').hasClass('more')){
        $('.more').addClass('close').removeClass('more');
        $('.board').css('visibility', 'visible');
     }else if($('.close').hasClass('close')){
        $('.close').addClass('more').removeClass('close');  
        $('.board').css('visibility', 'hidden');
     }
   });
 });