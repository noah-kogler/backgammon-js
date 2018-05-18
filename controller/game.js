'use strict';

// CONSTRAINT:
// Game and data attributes must be updated in event-listeners.
// Never update game attributes in state change triggers!
// So it's possible to replay a game to a certain state with goToState.

const GameEvent = { // value: methodName
    onStart: 'onStart', // (game, stones, out, done)
    onRollDice: 'onRollDice', // (game)
    onDiceRolled: 'onDiceRolled', // (game, result)
    onSelectStone: 'onSelectStone', // (game[, selectedStoneData])
    onStoneSelected: 'onStoneSelected',// (game, selectedStoneData)
    onSelectTarget: 'onSelectTarget',// (game, selectedStoneData)
    onTargetSelected: 'onTargetSelected', // (game, selectedStoneData, selectedTargetSlotData)
    onThrownOut: 'onThrownOut', // (game, fromSlotData)
};

const createGameController = (spec) => {
    let api;

    const { log, data } = spec;

    let dicePossibilites = [];

    const listeners = {}; // { type: [listeners] }

    const fireEvent = (type, ...eventArgs) => {
        let methodName = GameEvent[type];
        if (listeners[methodName]) {
            log.debug('fireEvent: ' + methodName + ' ' + (eventArgs ? JSON.stringify(eventArgs) : ''));
            listeners[methodName].forEach((listener) => { listener(api, ...eventArgs); });
        }
        else {
            log.debug('fireEvent: ' + methodName + ' has no listeners. Event is ignored.');
        }
    };

    const fieldIndexDifference = (player, fromFieldIndex, toFieldIndex) => player.equals(Player.WHITE)
        ? toFieldIndex - fromFieldIndex
        : fromFieldIndex - toFieldIndex;

    const rollSingleDice = () => {
        var min = 1;
        var max = 6;
        return Math.floor(Math.random() * (max - min)) + min;
    };

    const getPossibleTargetFieldIndex = (player, fieldIndex, difference) =>
        player.equals(Player.WHITE)
            ? fieldIndex + difference
            : fieldIndex - difference;

    const validFieldIndex = (fieldIndex) => fieldIndex >= 0 && fieldIndex < 24;

    api = {
        addEventListeners: (toObj, types) => {
            types.forEach(type => {
                let methodName = GameEvent[type];
                if (!listeners[methodName]) {
                    listeners[methodName] = [];
                }
                if (toObj[methodName]) {
                    listeners[methodName].push(toObj[methodName]);
                }
                else {
                    log.error(
                        'Missing event handler definition in '
                        + toObj.toString() + ' for ' + methodName + '.'
                    );
                }
            });
        },

        // Event listeners

        onDiceRolled: (game, result) => {
            data.dice(result);

            dicePossibilites = result[0] === result[1]
                ? [ result[0], result[1], result[0], result[1] ]
                : [ result[0], result[1] ];
        },

        onTargetSelected: (game, selectedStoneData, selectedTargetSlotData) => {
            let player = data.player();
            let opponent = data.opponent();

            // check if an opponents stone was hit
            let targetOpponentStones = data.stoneCount(selectedTargetSlotData.fieldIndex, opponent);
            if (targetOpponentStones === 1) {
                data.decrementStoneCount(selectedTargetSlotData.fieldIndex, opponent);
                data.incrementOutCount(opponent);
                api.throwOut(
                    createSlotData({
                        fieldIndex: selectedTargetSlotData.fieldIndex,
                        slotIndex: selectedTargetSlotData.slotIndex - 1,
                        type: SlotType.REGULAR // can only be thrown out from a regular slot
                    })
                );
            }
            else {
                data.decrementStoneCount(selectedStoneData.fieldIndex, player);
                data.incrementStoneCount(selectedTargetSlotData.fieldIndex, player);
            }

            if (dicePossibilites.length === 1) { // last possibility left
                dicePossibilites = [];
                data.nextMove();
            }
            else {
                let usedDiceIndex = dicePossibilites.findIndex(
                    (possibility) => possibility === fieldIndexDifference(
                        player, selectedStoneData.fieldIndex, selectedTargetSlotData.fieldIndex
                    )
                );

                dicePossibilites.splice(usedDiceIndex, 1);
            }
        },

        // State change triggers: Never update data here! Only throw events!

        start: () => {
            fireEvent(GameEvent.onStart, data.stones(), data.out(), data.done());
            fireEvent(GameEvent.onRollDice);
        },

        rollDice: () => {
            fireEvent(GameEvent.onDiceRolled, [
                rollSingleDice(),
                rollSingleDice(),
            ]);
            fireEvent(GameEvent.onSelectStone);
        },

        selectStone: (selectedStoneData) => {
            fireEvent(GameEvent.onStoneSelected, selectedStoneData);
            fireEvent(GameEvent.onSelectTarget, selectedStoneData);
        },

        deselectStone: (selectedStoneData) => {
            fireEvent(GameEvent.onSelectStone, selectedStoneData);
        },

        selectTarget: (selectedStoneData, selectedTargetSlotData) => {
            // TODO validation!
            fireEvent(GameEvent.onTargetSelected, selectedStoneData, selectedTargetSlotData);
            if (dicePossibilites.length === 0) {
                fireEvent(GameEvent.onRollDice);
            }
            else {
                fireEvent(GameEvent.onSelectStone);
            }
        },

        throwOut: (fromSlotData) => {
            fireEvent(GameEvent.onThrownOut, fromSlotData);
        },

        // Util methods

        isStoneSelectable: (stoneData) =>
            stoneData.player.equals(data.player())
                && stoneData.slotIndex === (data.stoneCount(stoneData.fieldIndex, stoneData.player) - 1)
                && dicePossibilites.findIndex(
                    possibility => {
                        let possibleTargetFieldIndex = getPossibleTargetFieldIndex(
                            stoneData.player, stoneData.fieldIndex, possibility
                        );
                        return (
                            validFieldIndex(possibleTargetFieldIndex)
                            && possibleTargetFieldIndex !== undefined
                            && api.isStoneMovable(
                                stoneData.fieldIndex, possibleTargetFieldIndex
                            )
                        );
                    }
                ) >= 0,

        isStoneMovable: (fromFieldIndex, toFieldIndex) => {
            if (!validFieldIndex(fromFieldIndex)) {
                log.error("isStoneMovable called with invalid fromFieldIndex: " + fromFieldIndex);
                return false;
            }
            if (!validFieldIndex(toFieldIndex)) {
                log.error("isStoneMovable called with invalid toFieldIndex: " + toFieldIndex);
                return false;
            }

            if (fromFieldIndex === toFieldIndex) { // this wouldn't be a move
                return false;
            }

            let player = data.player();
            let fieldDifference = fieldIndexDifference(player, fromFieldIndex, toFieldIndex);
            let playerStoneCount = data.stoneCount(toFieldIndex, player);
            let opponentStoneCount = data.stoneCount(toFieldIndex, data.opponent());

            return (
                playerStoneCount < 5
                && opponentStoneCount <= 1
                && dicePossibilites.findIndex(possibility => possibility === fieldDifference) >= 0
            );
        },

        goToState: (eventDefinitions) => {
            eventDefinitions.forEach(eventDefinition => {
                fireEvent(eventDefinition.event, ...eventDefinition.params);
            });
        },

        currentPlayer: data.player,
        currentOpponent: data.opponent,

        toString: () => 'Game',
    };

    api.addEventListeners(api, [GameEvent.onDiceRolled, GameEvent.onTargetSelected]);

    return Object.freeze(api);
};
