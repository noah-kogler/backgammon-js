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

const createGameData = () => {

    const createPlayerStoneCountData = (whiteStoneCount, blackStoneCount) => {
        let data = {};
        data[Player.WHITE.id] = whiteStoneCount;
        data[Player.BLACK.id] = blackStoneCount;
        return data;
    };

    return Object.freeze({
        moves: [{
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
        }],
    });
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
