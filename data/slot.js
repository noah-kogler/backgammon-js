'use strict';

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