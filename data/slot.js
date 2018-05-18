'use strict';

const SlotType = Object.freeze({
    REGULAR: 'regular',
    OUT: 'out',
    DONE: 'done',
});

const createSlotData = (spec) => {

    const { fieldIndex, slotIndex, type } = spec;

    const api = {
        fieldIndex,
        slotIndex,
        type,
        equals: (slotData) =>
            slotData.fieldIndex === api.fieldIndex
            && slotData.slotIndex === api.slotIndex
            && slotData.type === api.type,
    };

    return Object.freeze(api);
};