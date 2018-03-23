let Game = function (args) { // args: board
    this.board = args.board;
    this.move = Data.moves[0];

    this.board.game = this;
};

Game.prototype.start = function() {
    this.board.drawStatics({ to: document.body });
    this.board.drawStones(this.move.stones);
    this.board.drawStats({ to: document.body });

    this.board.requestDice()
        .then((result) => {
            this.board.startStoneSelection();
        });
};

Game.prototype.currentPlayerColor = function() {
    return this.move.player;
};

Game.prototype.rollDice = function() {
    this.move.dice = [
        this._rollSingleDice(),
        this._rollSingleDice(),
    ];
    return this.move.dice;
};

Game.prototype.isMovable = function(args) { // args: from[, to]
    let player = this.move.player;
    let opponent = this.move.player === 'white' ? 'black' : 'white';

    if (args.to === undefined) {
        return true; // TODO is any move possible?
    }

    if (args.from === args.to) { // this wouldn't be a move
        return false;
    }

    if (this.move.stones[args.to][player] < 5 && this.move.stones[args.to][opponent] <= 1) {
        return true;
    }
    else {
        return false;
    }
};

Game.prototype._rollSingleDice = function() {
    var min = 1;
    var max = 6;
    return Math.floor(Math.random() * (max - min)) + min;
};
