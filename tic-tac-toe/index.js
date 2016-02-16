var ai, player, 
    game, firstTurn;

var Type = {
    X: 'X',
    O: 'O',
    U: 'U'
};

var Move = function(type, index){
    this.type = type || Type.U;
    this.index = index || -1;
}

var Game = function(){
    this.reset();
};

Game.prototype.reset = function(){
    this.turn = Type.U;
    this.state = [Type.U,Type.U,Type.U,
                  Type.U,Type.U,Type.U,
                  Type.U,Type.U,Type.U];
    this.last = {index: 0, type: Type.U};
};

Game.prototype.move = function(type, slot) {
    this.last = {index: slot, type: this.state[slot]};
    this.state[slot] = type;

    return slot;
};

Game.prototype.putback = function() {
    this.state[this.last.index] = this.last.type;
    this.last = {index: -1, type: Type.U};
};

Game.prototype.rows = function() {
    return [this.state[0] + this.state[1] + this.state[2],
            this.state[3] + this.state[4] + this.state[5],
            this.state[6] + this.state[7] + this.state[8],
            this.state[0] + this.state[3] + this.state[6],
            this.state[1] + this.state[4] + this.state[7],
            this.state[2] + this.state[5] + this.state[8],
            this.state[0] + this.state[4] + this.state[8],
            this.state[2] + this.state[4] + this.state[6]];
};

Game.prototype.getEmptyFromRow = function(row) {
    var rowIndex = this.rows().indexOf(row);
    var place = this.rows()[rowIndex];
    var index = place.indexOf(Type.U);

    var rv = -1;
    switch (rowIndex) {
        case 0: rv = index;
                break;
        case 1: rv = index + 3;
                break;
        case 2: rv = index + 6;
                break;
        case 3: rv = index * 3;
                break;
        case 4: rv = index * 3 + 1;
                break;
        case 5: rv = index * 3 + 2;
                break;
        case 6: rv = index * 4;
                break;
        case 7: rv = index * 2 + 2;
                break;
    }
    return rv;
};

Game.prototype.getTwoInARowWithEmpty = function(type) {
    var rows = this.rows().filter(function(row) {
        if (row.indexOf(type) != -1 &&
            row.indexOf(type) != row.lastIndexOf(type) &&
            row.indexOf(Type.U) != -1) 
            return true;
        return false;
    });

    var that = this;
    if(rows.length) {
        return rows.reduce(function(pre, row) {
            if(pre == -1)
                return that.getEmptyFromRow(row);
            return pre;
        }, -1);
    }

    return -1;
};


Game.prototype.getFork = function(type) {
    var rv = -1;
    this.state.forEach(function(slot, index) {
        if (slot == Type.U) {
            this.move(type, index);

            var rows = this.rows().filter(function(row) {
                if (row.indexOf(type) != -1 &&
                    row.indexOf(type) != row.lastIndexOf(type) &&
                    row.indexOf(Type.U) != -1) 
                    return true;
                return false;
            });

            if (rows.length >= 2) rv = index;

            this.putback();
        }
    }, this);

    return rv;
};


Game.prototype.hasEnded = function() {
    var winnerRow = this.rows().join(',').match(/(X{3}|O{3})/);
    if (!Array.isArray(winnerRow))
        if(this.state.indexOf(Type.U) != -1) 
            return -1;
        else return 9999;

    return this.rows().indexOf(winnerRow[0]);
}

var moveAI = function() {
    var hasTwoInARow = game.getTwoInARowWithEmpty(ai);
    if(hasTwoInARow != -1) return game.move(ai, hasTwoInARow);

    var playerHasTwoInARow = game.getTwoInARowWithEmpty(player);
    if(playerHasTwoInARow != -1) return game.move(ai, playerHasTwoInARow);

    var canFork = game.getFork(ai);
    if(canFork != -1) return game.move(ai, canFork);

    var playerCanFork = game.getFork(player);
    if(playerCanFork != -1) return game.move(ai, playerCanFork);

    if(game.state[4] == Type.U) return game.move(ai, 4);

    return game.move(ai, game.state.indexOf(Type.U));
}

Game.prototype.makeTurn = function(){
    var that = this;

    if(this.hasEnded() != -1) {
        this.paintWinnerRows();

        if(firstTurn == ai) firstTurn = player;
        else firstTurn = ai;

        setTimeout(function(){
            that.reset();
            $('row').html('&nbsp;');
            $('row').addClass('empty');
            $('row').removeClass('winner');

            that.turn = firstTurn;
            that.makeTurn();
        }, 2000); 

        return;  
    }

    if(this.turn == ai) {
        setTimeout(function(){
            var index = moveAI();
            $('#row' + index).html(ai);
            $('#row' + index).removeClass('empty');

            that.turn = player;
            that.makeTurn();
        }, 350);

        return;
    }

    if(this.turn == player) {
        $('row').click(function(){
            if(!$(this).hasClass('empty')) return;
            
            $('row').unbind('click');
            
            game.move(player, $(this).attr('id').slice(-1));
            $(this).html(player);
            $(this).removeClass('empty');

            that.turn = ai;
            that.makeTurn();
        });

        return;
    }
};


Game.prototype.paintWinnerRows = function() {
    var winnerRow = this.hasEnded();
    var id0, id1, id2;

    switch (winnerRow) {
        case 0: 
                id0=0; id1=1; id2=2;
                break;
        case 1: 
                id0=3; id1=4; id2=5;
                break;
        case 2: 
                id0=6; id1=7; id2=8;
                break;
        case 3: 
                id0=0; id1=3; id2=6;
                break;
        case 4: 
                id0=1; id1=4; id2=7;
                break;
        case 5: 
                id0=2; id1=5; id2=8;
                break;
        case 6: 
                id0=0; id1=4; id2=8;
                break;
        case 7: 
                id0=2; id1=4; id2=6;
                break;
        default:
                id0 = id1 = id2 = -1;
    }
    id0 = '#row' + id0;
    id1 = '#row' + id1;
    id2 = '#row' + id2;
    var winners = id0 + ', ' + id1 + ', ' + id2;
    $(winners).addClass('winner');
};


$(function() {
    game = new Game();

    $('choice-x, choice-o').click(function(){
        var type = $(this).data('type');
        player = type;
        if(type == Type.X) ai = Type.O;
        else ai = Type.X;

        if(player == Type.X) game.turn = player;
        else game.turn = ai;

        firstTurn = game.turn;

        $('choice').fadeOut();
        game.makeTurn();
    });
});




/**********
Win:
If you have two in a row, you can place a third to get three in a row.
Block:
If the opponent has two in a row, you must play the third to block the opponent.
Fork:
Create an opportunity where you have two threats to win (two non-blocked lines of 2).
Blocking an opponent's fork:
If there is a configuration where the opponent can fork, you must block that fork.
Center:
You play the center if open.
Opposite corner:
If the opponent is in the corner, you play the opposite corner.
Empty corner:
You play in a corner square.
Empty side:
You play in a middle square on any of the 4 sides.
***********/