'use strict';

// CONSTRAINT:
// Game and data attributes must be updated in event-listeners.
// Never update game attributes in state change triggers!
// So it's possible to replay a game to a certain state with goToState.

// Events

// onStart(game, stones)
// onRollDice(game)
// onDiceRolled(game, result)
// onSelectStone(game[, selectedStoneData])
// onStoneSelected(game, selectedStoneData)
// onSelectTarget(game, selectedStoneData)
// onTargetSelected(game, selectedStoneData, selectedTargetSlotData)

const createGame = (spec) => {
    let api;

    const { log, data } = spec;

    let move = data.moves[0];

    let dicePossibilites = [];

    const listeners = {}; // { type: [listeners] }

    const fireEvent = (type, ...eventArgs) => {
        log.debug('fireEvent: ' + type + ' ' + (eventArgs ? JSON.stringify(eventArgs) : ''));
        listeners[type].forEach((listener) => { listener(api, ...eventArgs); });
    };

    const getOpponent = () => move.player === 'white' ? 'black' : 'white';

    const fieldIndexDifference = (player, fromFieldIndex, toFieldIndex) => player === 'white'
        ? toFieldIndex - fromFieldIndex
        : fromFieldIndex - toFieldIndex;

    const rollSingleDice = () => {
        var min = 1;
        var max = 6;
        return Math.floor(Math.random() * (max - min)) + min;
    };

    const getPossibleTargetFieldIndex = (player, fieldIndex, difference) =>
        player === 'white'
            ? fieldIndex + difference
            : fieldIndex - difference;

    const validFieldIndex = (fieldIndex) => fieldIndex >= 0 && fieldIndex < 24;

    // This doesn't preserve type-information and non-derializable attributes.
    const deepCopyObj = (obj) => JSON.parse(JSON.stringify(obj));

    api = {
        addEventListeners: (toObj, types) => {
            types.forEach(type => {
                if (!listeners[type]) {
                    listeners[type] = [];
                }
                if (toObj[type]) {
                    listeners[type].push(toObj[type]);
                }
                else {
                    log.error(
                        'Missing event handler definition in '
                        + toObj.toString() + ' for ' + type + '.'
                    );
                }
            });
        },

        // Event listeners

        onDiceRolled: (game, result) => {
            move.dice = deepCopyObj(result);

            dicePossibilites = result[0] === result[1]
                ? [ result[0], result[1], result[0], result[1] ]
                : [ result[0], result[1] ];
        },

        onTargetSelected: (game, selectedStoneData, selectedTargetSlotData) => {
            let player = move.player;

            // check if an opponents stone was hit
            let opponent = getOpponent();
            let targetOpponentStones = move.stones[selectedTargetSlotData.fieldIndex][opponent];
            if (targetOpponentStones === 1) {
                move.stones[selectedTargetSlotData.fieldIndex][opponent] -= 1;
                move.out[opponent] += 1;
            }
            else {
                move.stones[selectedStoneData.fieldIndex][player] -= 1;
                move.stones[selectedTargetSlotData.fieldIndex][player] += 1;
            }

            if (dicePossibilites.length === 1) { // last possibility left
                let newMove = deepCopyObj(move);
                newMove.player = opponent;
                newMove.dice = [ undefined, undefined ];
                data.moves.push(newMove);

                dicePossibilites = [];

                move = newMove;
                log.debug('started new move: ' + JSON.stringify(move));
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
            fireEvent('onStart', move.stones);
            fireEvent('onRollDice');
        },

        rollDice: () => {
            fireEvent('onDiceRolled', [
                rollSingleDice(),
                rollSingleDice(),
            ]);
            fireEvent('onSelectStone');
        },

        selectStone: (selectedStoneData) => {
            fireEvent('onStoneSelected', selectedStoneData);
            fireEvent('onSelectTarget', selectedStoneData);
        },

        deselectStone: (selectedStoneData) => {
            fireEvent('onSelectStone', selectedStoneData);
        },

        selectTarget: (selectedStoneData, selectedTargetSlotData) => {
            // TODO validation!
            fireEvent('onTargetSelected', selectedStoneData, selectedTargetSlotData);
            if (dicePossibilites.length === 0) {
                fireEvent('onRollDice');
            }
            else {
                fireEvent('onSelectStone');
            }
        },

        // Util methods

        currentPlayerColor: () => move.player,

        isStoneSelectable: (stoneData) =>
            stoneData.color === api.currentPlayerColor()
                && stoneData.slotIndex == (move.stones[stoneData.fieldIndex][stoneData.color] - 1)
                && dicePossibilites.findIndex(
                    possibility => {
                        let possibleTargetFieldIndex = getPossibleTargetFieldIndex(
                            stoneData.color, stoneData.fieldIndex, possibility
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

            let player = move.player;
            let opponent = getOpponent();
            let fieldDifference = fieldIndexDifference(player, fromFieldIndex, toFieldIndex);
            let currentStones = move.stones[toFieldIndex];

            return (
                currentStones[player] < 5
                && currentStones[opponent] <= 1
                && dicePossibilites.findIndex(possibility => possibility === fieldDifference) >= 0
            );
        },

        goToState: (eventDefinitions) => {
            eventDefinitions.forEach(eventDefinition => {
                fireEvent(eventDefinition.event, ...eventDefinition.params);
            });
        },

        toString: () => 'Game',
    };

    api.addEventListeners(api, ['onDiceRolled', 'onTargetSelected']);

    return Object.freeze(api);
};
