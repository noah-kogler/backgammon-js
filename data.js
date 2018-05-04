'use strict';

const createPlayerData = (spec) => {

    const {id, color} = spec;

    return Object.freeze({
        id,
        color,
        equals: (otherPlayer) => id === otherPlayer.id,
        name: () => spec.color,
    })
};

const Player = Object.freeze({
    WHITE: createPlayerData({ id: 0, color: 'white' }),
    BLACK: createPlayerData({ id: 1, color: 'black' }),
});

const createGameData = (spec) => {

    const {log} = spec;

    const createPlayerStoneCountData = (whiteStoneCount, blackStoneCount) => {
        let data = {};
        data[Player.WHITE.id] = whiteStoneCount;
        data[Player.BLACK.id] = blackStoneCount;
        return data;
    };

    const moves = [{
        player: Player.WHITE,
        stones: [
            // top left
            createPlayerStoneCountData(2, 0),
            createPlayerStoneCountData(0, 0),
            createPlayerStoneCountData(0, 0),
            createPlayerStoneCountData(0, 0),
            createPlayerStoneCountData(0, 0),
            createPlayerStoneCountData(0, 5),
            // top right
            createPlayerStoneCountData(0, 0),
            createPlayerStoneCountData(0, 3),
            createPlayerStoneCountData(0, 0),
            createPlayerStoneCountData(0, 0),
            createPlayerStoneCountData(0, 0),
            createPlayerStoneCountData(5, 0),
            // bottom right
            createPlayerStoneCountData(0, 5),
            createPlayerStoneCountData(0, 0),
            createPlayerStoneCountData(0, 0),
            createPlayerStoneCountData(0, 0),
            createPlayerStoneCountData(3, 0),
            createPlayerStoneCountData(0, 0),
            // bottom left
            createPlayerStoneCountData(5, 0),
            createPlayerStoneCountData(0, 0),
            createPlayerStoneCountData(0, 0),
            createPlayerStoneCountData(0, 0),
            createPlayerStoneCountData(0, 0),
            createPlayerStoneCountData(0, 2),
        ],
        out: createPlayerStoneCountData(0, 0),
        done: createPlayerStoneCountData(0, 0),
        dice: [
            undefined,
            undefined,
        ],
    }];

    // This doesn't preserve type-information and non-derializable attributes.
    const deepCopyObj = (obj) => JSON.parse(JSON.stringify(obj));

    const move = () => moves[moves.length - 1];

    const api = Object.freeze({
        player: () => Object.freeze(move().player),
        opponent: () => Object.freeze(move().player.equals(Player.WHITE) ? Player.BLACK : Player.WHITE),
        stones: () => Object.freeze(move().stones),
        dice: (...args) => {
            if (args.length === 1) {
                move().dice = deepCopyObj(args[0]);
            }
            return move().dice;
        },
        nextMove: () => {
            let newMove = deepCopyObj(move());
            newMove.player = api.opponent();
            newMove.dice = [ undefined, undefined ];
            moves.push(newMove);
            log.debug('started new move: ' + JSON.stringify(move()));
        },
        stoneCount: (fieldIndex, player) => move().stones[fieldIndex][player.id],
        incrementStoneCount: (fieldIndex, player) => {
            move().stones[fieldIndex][player.id] += 1;
        },
        decrementStoneCount: (fieldIndex, player) => {
            move().stones[fieldIndex][player.id] -= 1;
        },
        incrementOutCount: (player) => {
            move().out[player.id] += 1;
        },
    });

    return api;
};

const createSlotData = (spec) => {

    const { fieldIndex, slotIndex } = spec;

    const api = {
        fieldIndex,
        slotIndex,
        equals: (slotData) =>
            slotData.fieldIndex === api.fieldIndex
            && slotData.slotIndex === api.slotIndex,
    };

    return Object.freeze(api);
};

const createStoneData = (spec) => {

    const { fieldIndex, slotIndex, player } = spec;

    const api = {
        fieldIndex,
        slotIndex,
        player,
        equals: (stoneData) =>
            stoneData.player.equals(api.player)
            && stoneData.fieldIndex === api.fieldIndex
            && stoneData.slotIndex === api.slotIndex,
    };

    return Object.freeze(api);
};
