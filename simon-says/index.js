/********* RENDERING LOGIC **********/

var _3dPrinter = {
    MAX_DEPTH: 30,
    ROTATE_CONSTANT: 0.25,
    ROTATE_X: 45,
    ROTATE_Z: -10,
}

_3dPrinter.print = function($element, color, shadowHeight, rotateDeg, inset, opt_extraRotate) {
    shadowHeight = shadowHeight || 0;
    rotateDeg = rotateDeg || 0;
    inset = inset ? 'inset' : '';

    var base = color;
    var shadow = inset + ' 0 0 0 0 black';
    for(var i = 0; i < _3dPrinter.MAX_DEPTH; i++) {
        var step = i / _3dPrinter.MAX_DEPTH;

        var posHeight = step * shadowHeight;
        var posRotate = step * rotateDeg * _3dPrinter.ROTATE_CONSTANT;
        shadow += ', ' + inset + ' ' + posRotate + 'px ' + posHeight + 'px 0px 0px ' + base.decrement().getCss();
    
        if(opt_extraRotate) {
            posRotate = step * opt_extraRotate * _3dPrinter.ROTATE_CONSTANT;
            shadow += ', ' + inset + ' ' + posRotate + 'px ' + posHeight + 'px 0px 0px ' + base.getCss();
        }
    }

    $element.css('box-shadow', shadow);
}

_3dPrinter.apply3d = function() {
    var rotation = 'rotateX(' + _3dPrinter.ROTATE_X + 'deg) rotateZ(' + _3dPrinter.ROTATE_Z + 'deg)';

    $('wheel').css('transform', rotation);
    $('wheel').css('-webkit-transform', rotation);
    $('wheel').css('-mz-transform', rotation);

    _3dPrinter.print($('wheel'), new Rgb(50, 50, 50), 50, _3dPrinter.ROTATE_Z * 3);
    _3dPrinter.print($('game-start'), new Rgb(255, 50, 50), 10, _3dPrinter.ROTATE_Z);
    _3dPrinter.print($('controls'), new Rgb(50, 50, 50), 10, _3dPrinter.ROTATE_Z);
    _3dPrinter.print($('screen'), new Rgb(50, 50, 50), 7.5, _3dPrinter.ROTATE_Z, true);
    _3dPrinter.print($('hard-button'), new Rgb(50, 50, 50), 5, _3dPrinter.ROTATE_Z / 2);


    _3dPrinter.print($('circle.top-left'), new Rgb(50, 50, 50), 15, -1 * _3dPrinter.ROTATE_Z, true, _3dPrinter.ROTATE_Z * 3);
    _3dPrinter.print($('circle.top-right'), new Rgb(50, 50, 50), 15, _3dPrinter.ROTATE_Z * 3, true);
    _3dPrinter.print($('circle.bottom-left'), new Rgb(50, 50, 50), 15, _3dPrinter.ROTATE_Z * 3, true);
    _3dPrinter.print($('circle.bottom-right'), new Rgb(50, 50, 50), 15, _3dPrinter.ROTATE_Z * 3, true);
};

var Rgb = function(r,g,b) {
    this.r = r;
    this.g = g;
    this.b = b;

    this.rx = r / _3dPrinter.MAX_DEPTH;
    this.gx = g / _3dPrinter.MAX_DEPTH;
    this.bx = b / _3dPrinter.MAX_DEPTH;
}

Rgb.prototype.getCss = function() {
    return 'rgb(' + parseInt(this.r, 10) + ',' + parseInt(this.g, 10) + ',' + parseInt(this.b, 10) + ')';
}

Rgb.prototype.decrement = function() {
    this.r -= this.rx;
    this.g -= this.gx;
    this.b -= this.bx;

    return this;
};


/********* GAME LOGIC **********/

/**** Initialization ****/

var tlSound = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3');
var trSound = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3');
var blSound = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3');
var brSound = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3');
var hardmode = false;








$(function(){
    _3dPrinter.apply3d();
    
    $('hard-button').click(function(){
        hardmode = !hardmode;
        if(hardmode) {
            $('screen').addClass('hard');
            $(this).addClass('active');
        } else {
            $('screen').removeClass('hard');
            $(this).removeClass('active');
        }
    });

    $('circle.top-left').mousedown(function(){
        var $element = $(this);
        _3dPrinter.print($element, new Rgb(50, 50, 50), 25, -1 * _3dPrinter.ROTATE_Z * 3, true, _3dPrinter.ROTATE_Z * 4);  
        $element.mouseup(function(){
            _3dPrinter.print($element, new Rgb(50, 50, 50), 15, -1 * _3dPrinter.ROTATE_Z, true, _3dPrinter.ROTATE_Z * 3);  
            $element.unbind('mouseup');
        });
    });

    $('circle:not(.top-left').mousedown(function(){
        var $element = $(this);
        _3dPrinter.print($element, new Rgb(50, 50, 50), 25, _3dPrinter.ROTATE_Z * 5, true);
        $element.mouseup(function(){
            _3dPrinter.print($element, new Rgb(50, 50, 50), 15, _3dPrinter.ROTATE_Z * 3, true);
            $element.unbind('mouseup');
        });
    });
});