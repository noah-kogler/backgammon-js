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
// onTargetSelected(selectedStoneData, selectedTargetSlotData)
Game.prototype.addEventListener = function(type, listener) {
    if (!this.listeners[type]) {
        this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
};

Game.prototype.fireEvent = function(type, ...eventArgs) {
    debugMsg('fireEvent: ' + type + ' ' + (eventArgs ? JSON.stringify(eventArgs) : ''));
    this.listeners[type].forEach((listener) => { listener(...eventArgs); });
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

Game.prototype.selectTarget = function(selectedStoneData, selectedTargetSlotData) {
    this.fireEvent('onTargetSelected', selectedStoneData, selectedTargetSlotData);

    // TODO move stone in Data.move !!!
    // then push a new move!
    this.move.player = this._opponent();

    this.fireEvent('onRollDice');
};

Game.prototype.isStoneMovable = function(fromStoneData, toFieldData) {
    let player = this.move.player;
    let opponent = this._opponent();

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

Game.prototype._opponent = function() {
    return this.move.player === 'white' ? 'black' : 'white';
};
