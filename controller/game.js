let Game = function (args) {
    this.board = args.board;
    this.move = Data.moves[0];
};

Game.prototype.start = function() {
    this.board.drawStatics({ to: document.body });
    this.board.drawStones(this.move.stones);
};
