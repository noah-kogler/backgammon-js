'use strict';

const createSlotContainer = (spec) => {
    let api;

    const { log, svg, x, y, width, fieldIndex, isTop, slotType } = spec;

    let loadedSlots;
    const slots = () => {
        if (loadedSlots) {
            return loadedSlots;
        }
        let slots = [];

        let fieldDiff = 6;
        let radius = width / 2 - fieldDiff;
        let cx = x + width / 2;
        let cy = isTop ? y + radius : y - radius;
        for (let i = 0; i < 5; i++) {
            slots.push(
                createSlot({
                    log,
                    svg,
                    container: api,
                    cx,
                    cy,
                    radius,
                    index: i,
                    fieldIndex,
                    isTop,
                    type: slotType,
                })
            );
            cy = isTop ? cy + radius * 2 : cy - radius * 2;
        }

        loadedSlots = slots;
        return slots;
    };

    let addedStoneCountPerEvent = {
        onThrownOut: 0,
    };

    api = Object.freeze({
        listen: (toGame) => {
            slots().forEach((slot) => { slot.listen(toGame); });

            Object.keys(addedStoneCountPerEvent).forEach((eventType) => {
                toGame.addEventListeners(api, [ GameEvent[eventType] ]);
            });
        },
        onThrownOut: (game, fromSlotData) => {
            addedStoneCountPerEvent.onThrownOut = 0;

            if (fieldIndex === fromSlotData.fieldIndex) {
                let nextFreeSlot = api.nextFreeSlot();
                for (var i = slots().length - 1; i >= 0 && nextFreeSlot != undefined; i--) {
                    if (nextFreeSlot.index() < i && slots()[i].hasStone()) {
                        const removed = slots()[i].removeStone();
                        nextFreeSlot.addStone(game, removed.player());
                        nextFreeSlot = api.nextFreeSlot();
                    }
                }
            }
        },
        nextFreeSlot: () => {
            let nextIdx = slots().findIndex((slot) => !slot.hasStone());
            return slots()[nextIdx];
        },
        stoneWasAdded: (eventType) => {
            if (eventType in addedStoneCountPerEvent) {
                addedStoneCountPerEvent[eventType]++;
            }
        },
        addedStoneCount: (eventType) => addedStoneCountPerEvent[eventType],
    });

    return api;
};