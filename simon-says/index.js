/********* RENDERING LOGIC **********/
var render3D = true;

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

    $('wheel-shadow').css('box-shadow', '0 0 100px 50px rgba(0,0,0,0.75)');

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

_3dPrinter.remove3d = function() {
    $('wheel').css('transform', '');
    $('wheel').css('-webkit-transform', '');
    $('wheel').css('-mz-transform', '');

    $('wheel-shadow').css('box-shadow', '');

    $('wheel').css('box-shadow', '');
    $('game-start').css('box-shadow', '');
    $('controls').css('box-shadow', '');
    $('screen').css('box-shadow', '');
    $('hard-button').css('box-shadow', '');

    $('circle.top-left').css('box-shadow', '');
    $('circle.top-right').css('box-shadow', '');
    $('circle.bottom-left').css('box-shadow', '');
    $('circle.bottom-right').css('box-shadow', '');
}

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
var AudioCtx = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioCtx();

var createAudioObject = function(hz) {
    return {
        play: function() {
            var osc = audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = hz; 
            osc.connect(audioCtx.destination);
            osc.start(0);
            setTimeout(function() {
                osc.stop();
                osc.disconnect();
                delete osc;
            }, 250);
        }
    };
};

var Sounds = {
    'top-left': createAudioObject(288.33),
    'top-right': createAudioObject(342.88),
    'bottom-left': createAudioObject(457.69),
    'bottom-right': createAudioObject(432.00)
};

var Game = function(){
    this.hardmode = false;
    this.hardmodeRatio = 0.66;
    this.waitFactor = 3;
    this.maxSpeed = 300;
    this.startSpeed = 1000;
    this.maxStep = 20;

    this.sequence = Array.apply(null, Array(5)).map(function(){
        return 'top-left'
    })
    .concat(Array.apply(null, Array(5)).map(function(){
        return 'top-right'
    }))
    .concat(Array.apply(null, Array(5)).map(function(){
        return 'bottom-left'
    }))
    .concat(Array.apply(null, Array(5)).map(function(){
        return 'bottom-right'
    }));
};

Game.prototype.start = function() {
    $('game-start').html('Stop');
    this.reset();
    this.takeStep();
}

Game.prototype.stop = function() {
    clearInterval(this.player);
    clearInterval(this.timeoutRejector);
    this.player == undefined;
    this.timeoutRejector == undefined;
    $('screen').html('');
    $('game-start').html('Start');
}


Game.prototype.reset = function() {
    this.sequence.sort(function(){ return Math.random() - 0.5;});
    this.step = 1;
    this.actualSpeed = this.startSpeed;
    this.ended = false;
};


Game.prototype.toggleMode = function() {
    this.hardmode = !this.hardmode;
}

Game.prototype.currentSpeed = function() {
    var ratio = this.hardmode ? this.hardmodeRatio : 1;
    return this.actualSpeed * ratio;
}

Game.prototype.takeStep = function() {
    var that = this;
    var playedAll = new Promise(function(resolve, reject){ that.played = resolve});

    var i = 0;
    this.player = setInterval(function(){
        if(i >= that.step) {
            that.played();
            clearInterval(that.player);
        } else {
            var $circle = $('circle.' + that.sequence[i++]);
            $circle.addClass('light');
            $circle.click();

            setTimeout(function(){
                $circle.removeClass('light')
            }, that.currentSpeed() / 2);
        }
        $('screen').html(that.step);
    }, this.currentSpeed());


    playedAll
        .then(function() {
            return new Promise(function(resolve, reject) {
                var hasResolved = false;

                that.timeoutRejector = setTimeout(function() {
                    !hasResolved && reject('Late');
                    hasResolved = true;       
                }, that.currentSpeed() * that.step * that.waitFactor);

                var playerSteps = 0;
                var clickHandler = function() {
                    var $circle = $(this);
                    var pressed = $circle.attr('class').split(' ')[0];

                    if (pressed == that.sequence[playerSteps]) {
                        playerSteps++;
                        if(playerSteps == that.step) {
                            hasResolved = true;
                            $('circle').unbind('click', clickHandler);
                            setTimeout(resolve, 1000);
                        } 
                    } else {
                        hasResolved = true;    
                        $('circle').unbind('click', clickHandler);
                        reject('Inv');
                    }
                }

                $('circle').bind('click', clickHandler);
            });
        })
        .then(function() {
            that.step++;

            if(that.step >= that.maxStep) {
                that.ended = true;

                Sounds['top-left'].play();
                Sounds['bottom-left'].play();
                Sounds['top-right'].play();

                setTimeout(function() {
                    Sounds['top-left'].play();
                    Sounds['bottom-left'].play();
                    Sounds['top-right'].play();
                }, 300);

                setTimeout(function() {
                    Sounds['top-left'].play();
                    Sounds['bottom-left'].play();
                    Sounds['top-right'].play();
                }, 600);

                $('screen').html('Win');
                setTimeout(that.stop.bind(that), 2000);
            } else {
                that.actualSpeed = that.maxSpeed + (that.startSpeed - that.maxSpeed) * (that.maxStep - that.step + 1) / that.maxStep;
                that.takeStep();
            }
        })
        .catch(function(reason) {
            $('screen').html(reason);

            Sounds['top-left'].play();
            Sounds['bottom-right'].play();
            setTimeout(function() {
                Sounds['top-left'].play();
                Sounds['bottom-right'].play();
            }, 300);

            if(that.hardmode) {
                that.ended = true;
                $('screen').html('End');
                setTimeout(that.stop.bind(that), 2000);
            } else {
                setTimeout(that.takeStep.bind(that), 1000);
            }
        });
};


$(function(){
    var game = new Game();

    render3D && _3dPrinter.apply3d();

    $('switch').click(function() {
        render3D = !render3D;
        if(render3D) {
            _3dPrinter.apply3d();
            $(this).html('3D');
        }
        else {
            _3dPrinter.remove3d();
            $(this).html('2D');
        }
    });
    
    $('hard-button').click(function(){
        game.toggleMode();
        if(game.hardmode) {
            $('screen').addClass('hard');
            $(this).addClass('active');
            $('hard-text').html('Hardcore');
        } else {
            $('screen').removeClass('hard');
            $(this).removeClass('active');
            $('hard-text').html('easy mode');
        }
    });

    $('circle').click(function(){
        Sounds[$(this).attr('class').split(' ')[0]].play();
    });

    $('circle.top-left').mousedown(function(){
        var $element = $(this);
        render3D && _3dPrinter.print($element, new Rgb(50, 50, 50), 25, -1 * _3dPrinter.ROTATE_Z * 3, true, _3dPrinter.ROTATE_Z * 4);  
        $('body').mouseup(function(){
            render3D && _3dPrinter.print($element, new Rgb(50, 50, 50), 15, -1 * _3dPrinter.ROTATE_Z, true, _3dPrinter.ROTATE_Z * 3);  
            $('body').unbind('mouseup');
        });
    });

    $('circle.top-right, circle.bottom-left, circle.bottom-right').mousedown(function(){
        var $element = $(this);
        render3D && _3dPrinter.print($element, new Rgb(50, 50, 50), 25, _3dPrinter.ROTATE_Z * 5, true);
        $('body').mouseup(function(){
            render3D && _3dPrinter.print($element, new Rgb(50, 50, 50), 15, _3dPrinter.ROTATE_Z * 3, true);
            $('body').unbind('mouseup');
        });
    });

    $('game-start').click(function(){
        if($(this).html() == 'Start') game.start();
        else game.stop();
    });
});


var doSomethingWithTimeout = function() {
    return new Promise(function(resolve, reject){
        setTimeout(function() {
            //lets do timeout stuff here, do async calls etc, 
            //and then return 'Hallelujah'
            
            ..doing....stuff...;

            if (everything == 'OK')
                resolve('Hallelujah')
            else 
                reject(404);
        }, 100000);
    });
}


var main = function() {
    //main execution thread. you call the setTimeout here for example.
    //with the Promise system ->

    doSomethingWithTimeout()
        .then(function(resolved){
            console.log(resolved) // Hallelujah
        })
        .catch(function(error){
            console.log(error) //404
        })
        .then(function(){...});
}

