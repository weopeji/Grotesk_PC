$(document).ready( function() {
    groteskLogo();
})


function groteskLogo() {
    var numberSplit = 0;
    setInterval( function() {
        if(numberSplit == 7) {
            numberSplit = 0;
        }
        $('span').removeClass('selected');
        $(`span:eq(${numberSplit})`).addClass('selected');
        numberSplit = numberSplit + 1;
    }, 700);
}