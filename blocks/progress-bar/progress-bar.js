

$(document).ready( function() {
    let i = 0;
    function move() {
        if (i == 0) {
            i = 1;
            let $elem = $('.progress-bar > div');
            $elem.each(function (index) {
                let width = 0;
                let barWidth = $(this).find('p').html();
                let id = setInterval(frame, 10);
                function frame() {
                    if (width >= barWidth) {
                        clearInterval(id);
                        i = 0;
                    } else {
                        width++;
                        $elem.eq(index).find('p').css('width', width + '%');
                        $elem.eq(index).find('p').html(width + '%');
                    }
                }
            });           
        }
    }
    move();
});