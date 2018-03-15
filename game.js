let Game = function (args) {
    this.board = args.board;
    this.move = Data.moves[0];
    // this.players = this._buildPlayers();
};

Game.prototype.start = function() {
    this.board.drawStones(this.move.fields);
};

// Game.prototype._buildPlayers = function() {
//     return [
//         new Player(),
//         new Player(),
//     ];
// };

// let Player = function (args) {
//     this.stones = this._buidStones();
// };

// Player.prototype._buildStones = function() {
//     // body...
// };