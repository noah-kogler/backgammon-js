'use strict';

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
