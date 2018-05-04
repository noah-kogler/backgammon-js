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

    let dicePossibilites = [];

    const listeners = {}; // { type: [listeners] }

    const fireEvent = (type, ...eventArgs) => {
        log.debug('fireEvent: ' + type + ' ' + (eventArgs ? JSON.stringify(eventArgs) : ''));
        listeners[type].forEach((listener) => { listener(api, ...eventArgs); });
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
            fireEvent('onStart', data.stones());
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

        currentPlayer: () => data.player(),

        toString: () => 'Game',
    };

    api.addEventListeners(api, ['onDiceRolled', 'onTargetSelected']);

    return Object.freeze(api);
};
