var minMargin = 3, maxMargin = 287,
    minTimer = 1, maxTimer = 90;

var maxTime = 45,
    clockValue = 0,
    clockInSeconds = 0;

var clockTick = new Audio('https://www.freesound.org/data/previews/174/174721_3034894-lq.mp3'),
    breakRing = new Audio('http://www.freesfx.co.uk/rx2/mp3s/9/11125_1393961468.mp3'),
    finishRing = new Audio('http://www.freesfx.co.uk/rx2/mp3s/9/11124_1393961468.mp3'),
    finished = true;

clockTick.volume = 0.01;
breakRing.volume = 0.2;
finishRing.volume = 0.2;


var playAudio = function() {
    clockTick.play();

    if(Math.floor(clockInSeconds) == 0) {
        finishRing.play();
        finished = true;
        return;
    }

    var displayed = $('timer').html();
    var markers = Array.prototype.slice.call($('marker').map(function() {
        var displayed = $(this).html();
        if(displayed.indexOf(':') == -1) displayed = ('00' + displayed).slice(-2) + ':00';
        else displayed = ('0' + displayed).slice(-5);
        return displayed;
    }), 0);

    if(markers.indexOf(displayed) != -1) breakRing.play();    
}

var setClockValue = function(newValue) {
    clockValue = Math.max(0, Math.min(newValue, 1));
    clockInSeconds = clockValue * (maxTime * 60);

    var newStyle = 'rotateZ(' + (clockValue * 270) + 'deg)';
    
    $('clock').css('-webkit-transform', newStyle);
    $('clock').css('transform', newStyle);
};


var updateTimer = function() {
    var minutes = ('00' + parseInt(clockInSeconds / 60, 10)).slice(-2);
    var seconds = ('00' + parseInt(clockInSeconds % 60, 10)).slice(-2);

    $('timer').html(minutes + ':' + seconds);
}

var startTime;

var countDown = setInterval(function() {
    startTime = startTime || Date.now();
    var elapsedSeconds = (Date.now() - startTime) / 1000;

    setClockValue((clockInSeconds - elapsedSeconds) / (maxTime * 60));
    updateTimer();
    !finished && playAudio();

    startTime = Date.now();
}, 1000);


var writeMarkers = function() {
    $('tick').each(function(){
        var $tick = $(this);

        var angle = $tick.data('angle');
        var style = 'rotateZ(' + angle + 'deg)';
        $tick.css('-webkit-transform', style);
        $tick.css('transform', style);

        if(angle % 30 == 0) {
            var marker = (angle / (270 / maxTime));
            var mark = '';

            var remainder = (marker % 1) * 60;
            if (remainder == 0) mark = marker.toString();
            else mark = parseInt(marker, 10).toString() + ':' + 
                        ('00' + parseInt(remainder, 10)).slice(-2);

            $tick.prepend('<marker class="angular' + mark.replace(':', '-') + '"">' + mark + '</marker'); 
            $('.angular' + mark.replace(':', '-')).css('-webkit-transform', 'rotateZ(-' + angle + 'deg)');
            $('.angular' + mark.replace(':', '-')).css('transform', 'rotateZ(-' + angle + 'deg)');
        }
    });
};


$(function(){
    $('clock, logo').mousedown(function(e){
        var $clock = $('clock');
        var $logo = $('logo');

        var oldX = e.originalEvent.clientX;
        var oldY = e.originalEvent.clientY;

        $clock.css('cursor', 'grabbing');
        $clock.css('cursor', '-webkit-grabbing');
        $logo.css('cursor', 'grabbing');
        $logo.css('cursor', '-webkit-grabbing');

        $('body').mouseup(function(){
            $('body').unbind('mouseup');
            $('body').unbind('mousemove');

            $clock.css('cursor', 'grab');
            $clock.css('cursor', '-webkit-grab');
            $logo.css('cursor', 'grab');
            $logo.css('cursor', '-webkit-grab');

            finished = false;
        });

        $('body').mousemove(function(e){
            setClockValue(clockValue - ((oldX + oldY) - (e.originalEvent.clientX + e.originalEvent.clientY)) / 500);
            updateTimer();
            oldX = e.originalEvent.clientX;
            oldY = e.originalEvent.clientY;
        });
    });

    writeMarkers();

    $('handle').mousedown(function(e) {
        var $handle = $(this);

        var oldX = e.originalEvent.clientX;

        $handle.css('cursor', 'grabbing');
        $handle.css('cursor', '-webkit-grabbing');

        $('body').mouseup(function() {
            $('body').unbind('mouseup');
            $('body').unbind('mousemove');

            $handle.css('cursor', 'grab');
            $handle.css('cursor', '-webkit-grab');
        });

        $('body').mousemove(function(e) {
            var oldMargin = parseFloat($handle.css('margin-left').slice(0, -2));
            var newMargin = Math.min(maxMargin, Math.max(minMargin, (oldMargin + e.originalEvent.clientX - oldX)));
            $handle.css('margin-left', newMargin + 'px');

            var handleValue = (newMargin - minMargin) / (maxMargin - minMargin);
            maxTime = 1 + Math.floor(handleValue * (maxTimer - 1));
          
            oldX = e.originalEvent.clientX;

            $('marker').remove();
            writeMarkers();

            setClockValue(clockInSeconds / (maxTime * 60));
        });
    });

    $('muter').click(function() {
        var $icon = $(this).children();
        var muting = $icon.hasClass('fa-volume-up');

        if(muting) {
            $icon.removeClass('fa-volume-up');
            $icon.addClass('fa-volume-off');
            clockTick.volume = 0;
            breakRing.volume = 0;
            finishRing.volume = 0;
        } else {
            $icon.removeClass('fa-volume-off');
            $icon.addClass('fa-volume-up');
            clockTick.volume = 0.01;
            breakRing.volume = 0.2;
            finishRing.volume = 0.2;
        }    
    });

    setClockValue(0.5554);
});