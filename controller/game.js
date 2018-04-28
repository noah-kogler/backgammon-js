// CONSTRAINT:
// Game and data attributes must be updated in event-listeners.
// Never update game attributes in state change triggers!
// So it's possible to replay a game to a certain state with goToState.

let Game = function (args) { // args: data
    this.data = args.data;
    this.move = this.data.moves[0];
    this.dicePossibilites = [];
    this.listeners = {}; // { type: [listeners] }

    this.addEventListener('onDiceRolled', this.onDiceRolled.bind(this));
    this.addEventListener('onTargetSelected', this.onTargetSelected.bind(this));
};

// Events

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

// Event listeners

Game.prototype.onDiceRolled = function(result) {
    this.move.dice = DataManipulation.deepCopy(result);

    this.dicePossibilites = result[0] === result[1]
        ? [ result[0], result[1], result[0], result[1] ]
        : [ result[0], result[1] ];
};

Game.prototype.onTargetSelected = function(selectedStoneData, selectedTargetSlotData) {
    let player = this.move.player;

    // check if an opponents stone was hit
    let opponent = this._opponent();
    let targetOpponentStones = this.move.stones[selectedTargetSlotData.fieldIndex][opponent];
    if (targetOpponentStones === 1) {
        this.move.stones[selectedTargetSlotData.fieldIndex][opponent] -= 1;
        this.move.out[opponent] += 1;
    }
    else {
        this.move.stones[selectedStoneData.fieldIndex][player] -= 1;
        this.move.stones[selectedTargetSlotData.fieldIndex][player] += 1;
    }

    if (this.dicePossibilites.length === 1) { // last possibility left
        let newMove = DataManipulation.deepCopy(this.move);
        newMove.player = this._opponent();
        newMove.dice = [ undefined, undefined ];
        this.data.moves.push(newMove);

        this.dicePossibilites = [];

        this.move = newMove;
        Log.debugMsg('started new move: ' + JSON.stringify(this.move));
    }
    else {
        let usedDiceIndex = this.dicePossibilites.findIndex(
            (possibility) => possibility === this._fieldIndexDifference(
                player, selectedStoneData.fieldIndex, selectedTargetSlotData.fieldIndex
            )
        );

        this.dicePossibilites.splice(usedDiceIndex, 1);
    }
};

// State change triggers: Never update data here! Only throw events!

Game.prototype.start = function() {
    this.fireEvent('onStart', this.move.stones);
    this.fireEvent('onRollDice');
};

Game.prototype.rollDice = function() {
    this.fireEvent('onDiceRolled', [
        this._rollSingleDice(),
        this._rollSingleDice(),
    ]);
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
    // TODO validation!
    this.fireEvent('onTargetSelected', selectedStoneData, selectedTargetSlotData);
    if (this.dicePossibilites.length === 0) {
        this.fireEvent('onRollDice');
    }
    else {
        this.fireEvent('onSelectStone');
    }
};

// Util methods

Game.prototype.currentPlayerColor = function() {
    return this.move.player;
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

Game.prototype.goToState = function (eventDefinitions) {
    eventDefinitions.forEach(eventDefinition => {
        this.fireEvent(eventDefinition.event, ...eventDefinition.params);
    });
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
