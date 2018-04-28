let Game = function (args) { // args: data
    this.data = args.data;
    this.move = this.data.moves[0];
    this.dicePossibilites = [];
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
    Log.debugMsg('fireEvent: ' + type + ' ' + (eventArgs ? JSON.stringify(eventArgs) : ''));
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
    this.dicePossibilites = this.move.dice[0] === this.move.dice[1]
        ? [ this.move.dice[0], this.move.dice[1], this.move.dice[0], this.move.dice[1] ]
        : [ this.move.dice[0], this.move.dice[1] ];

    this.fireEvent('onDiceRolled', this.move.dice);
    this.fireEvent('onSelectStone');
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

    // TODO validation!

    let player = this.move.player;

    this.move.stones[selectedStoneData.fieldIndex][player] -= 1;
    this.move.stones[selectedTargetSlotData.fieldIndex][player] += 1;

    if (this.dicePossibilites.length === 1) { // last possibility left
        let newMove = DataManipulation.deepCopy(this.move);
        newMove.player = this._opponent();
        newMove.dice = [ undefined, undefined ];
        this.data.moves.push(newMove);

        this.dicePossibilites = [];

        this.move = newMove;
        Log.debugMsg('started new move: ' + JSON.stringify(this.move));

        this.fireEvent('onRollDice');
    }
    else {
        let usedDiceIndex = this.dicePossibilites.findIndex(
            (possibility) => possibility === this._fieldIndexDifference(
                player, selectedStoneData.fieldIndex, selectedTargetSlotData.fieldIndex
            )
        );

        this.dicePossibilites.splice(usedDiceIndex, 1);

        this.fireEvent('onSelectStone');
    }
};

Game.prototype.isStoneSelectable = function(stoneData) {
    return stoneData.color == this.currentPlayerColor()
        && stoneData.slotIndex == (this.move.stones[stoneData.fieldIndex][stoneData.color] - 1)
        && this.dicePossibilites.findIndex(
            possibility => {
                let possibleTargetFieldIndex = this._possibleTargetFieldIndex(
                    stoneData.color, stoneData.fieldIndex, possibility
                );
                return (
                    this._validFieldIndex(possibleTargetFieldIndex)
                    && possibleTargetFieldIndex !== undefined
                    && this.isStoneMovable(
                        stoneData.fieldIndex, possibleTargetFieldIndex
                    )
                );
            }
        ) >= 0;
};

Game.prototype.isStoneMovable = function(fromFieldIndex, toFieldIndex) {
    if (!this._validFieldIndex(fromFieldIndex)) {
        Log.errorMsg("isStoneMovable called with invalid fromFieldIndex: " + fromFieldIndex);
        return false;
    }
    if (!this._validFieldIndex(toFieldIndex)) {
        Log.errorMsg("isStoneMovable called with invalid toFieldIndex: " + toFieldIndex);
        return false;
    }

    if (fromFieldIndex === toFieldIndex) { // this wouldn't be a move
        return false;
    }

    let player = this.move.player;
    let opponent = this._opponent();
    let fieldDifference = this._fieldIndexDifference(player, fromFieldIndex, toFieldIndex);
    let currentStones = this.move.stones[toFieldIndex];

    let result = (
        currentStones[player] < 5
        && currentStones[opponent] <= 1
        && this.dicePossibilites.findIndex(possibility => possibility === fieldDifference) >= 0
    );

    return result;
};

Game.prototype._rollSingleDice = function() {
    var min = 1;
    var max = 6;
    return Math.floor(Math.random() * (max - min)) + min;
};

Game.prototype._opponent = function() {
    return this.move.player === 'white' ? 'black' : 'white';
};

Game.prototype._fieldIndexDifference = function(player, fromFieldIndex, toFieldIndex) {
    return player === 'white'
        ? toFieldIndex - fromFieldIndex
        : fromFieldIndex - toFieldIndex;
};

Game.prototype._possibleTargetFieldIndex = function(player, fieldIndex, difference) {
    return player === 'white'
        ? fieldIndex + difference
        : fieldIndex - difference;
};

Game.prototype._validFieldIndex = function(fieldIndex) {
    return fieldIndex >= 0 && fieldIndex < 24;
};
