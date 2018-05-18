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

    let addedStonesPerThrowOut = 0;

    api = Object.freeze({
        listen: (toGame) => {
            slots().forEach((slot) => { slot.listen(toGame); });

            // the onThrownOut must be called after the slot handlers
            // it's used to reset the addedStonesPerThrowOut counter used by slots
            toGame.addEventListeners(api, [ GameEvent.onThrownOut ]);
        },
        onThrownOut: () => {
            addedStonesPerThrowOut = 0;
        },
        nextFreeSlot: () => {
            let nextIdx = slots().findIndex((slot) => !slot.hasStone());
            return slots()[nextIdx];
        },
        throwOutDone: (args) => addedStonesPerThrowOut >= args.todoCount,
        threwOutStone: () => {
            addedStonesPerThrowOut++;
        },
    });

    return api;
};