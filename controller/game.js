let Game = function (args) {
    this.move = Data.moves[0];
    this.listeners = {}; // { type: [listeners] }
};

// onStart(stones)
// onRollDice()
// onDiceRolled(result)
// onSelectStone(optional: selectedStoneData)
// onStoneSelected(selectedStoneData)
// onSelectTarget(selectedStoneData)
// onTargetSelected
// onMoveStoneToTarget
Game.prototype.addEventListener = function(type, listener) {
    if (!this.listeners[type]) {
        this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
};

Game.prototype.fireEvent = function(type, eventObj) {
    debugMsg('fireEvent: ' + type + ' ' + (eventObj ? JSON.stringify(eventObj) : ''));
    this.listeners[type].forEach((listener) => { listener(eventObj); });
};

Game.prototype.start = function() {
    this.fireEvent('onStart', this.move.stones);
    this.fireEvent('onRollDice');
};

Game.prototype.currentPlayerColor = function() {
    return this.move.player;
};

Game.prototype.rollDice = function() {
    this.move.dice = [
        this._rollSingleDice(),
        this._rollSingleDice(),
    ];
    this.fireEvent('onDiceRolled', this.move.dice);
    this.fireEvent('onSelectStone');
};

Game.prototype.isStoneSelectable = function(stoneData) {
    return stoneData.color == this.currentPlayerColor()
        && stoneData.slotIndex == (this.move.stones[stoneData.fieldIndex][stoneData.color] - 1);
};

Game.prototype.selectStone = function(selectedStoneData) {
    this.fireEvent('onStoneSelected', selectedStoneData);
    this.fireEvent('onSelectTarget', selectedStoneData);
};

Game.prototype.deselectStone = function(selectedStoneData) {
    this.fireEvent('onSelectStone', selectedStoneData);
};

Game.prototype.isStoneMovable = function(fromStoneData, toFieldData) {
    let player = this.move.player;
    let opponent = this.move.player === 'white' ? 'black' : 'white';

    if (fromStoneData.fieldIndex === toFieldData.fieldIndex) { // this wouldn't be a move
        return false;
    }

    let currentStones = this.move.stones[toFieldData.fieldIndex];
    if (currentStones[player] < 5 && currentStones[opponent] <= 1) {
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
