var acc = 0;
var operation = null;
var operated = false;
var negate = false;


var operate = function(rightHand) {
    switch(operation) {
        case '%': acc = acc % rightHand;
                    break;
        case '/': acc = acc / rightHand;
                    break;
        case 'x': acc = acc * rightHand;
                    break;
        case '-': acc = acc - rightHand;
                    break;
        case '+': acc = acc + rightHand;
                    break;
    }
    operated = true;
};


var operand = function(val) {
    var rightHand = parseFloat($('screen').html());
    if(operation == null)
        if(isNaN(rightHand))
            if(val != '-') return;
            else return negate = true;
        else acc = rightHand;

    operate(rightHand);

    operation = val != '=' ? val : null;
    var display = acc.toString().length <= 12 ? acc.toString() : acc.toPrecision(2);
    $('screen').html(display);
}


var numVal = function(value) {
    if(operated) {
        $('screen').html('');
        operated = false;
    }

    if(value == '.' && $('screen').html().indexOf(value) != -1) return;
    if($('screen').html().length >= 12) return;

    var prep = negate ? '-' : '';
    negate = false;

    var newValue = prep + $('screen').html() + value;
    $('screen').html(newValue);
}


var accumulator = function(val) {
    if(val == 'C') {
        acc = 0;
        operation = null;
        $('screen').html('');
    }

    if(val.charCodeAt(0) == 8314) {
        var newVal = -1 * parseFloat($('screen').html());
        $('screen').html(newVal);
    }
}


$(function(){
    $('calc-col.operand').click(function() {
        operand($(this).html());
    });

    $('calc-col:not(.operand):not(.accumulator)').click(function() {
        numVal($(this).html());
    });

    $('calc-col.accumulator').click(function() {
        accumulator($(this).html());
    });
});