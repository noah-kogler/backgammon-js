'use strict';

const createSlot = (spec) => {
    let api;

    const { log, svg, container, cx, cy, radius, index, fieldIndex, isTop, type } = spec;

    let stone = undefined;

    let targetMarker = undefined;

    let targetMarkerClickListener = undefined;

    const data = createSlotData({
        fieldIndex,
        slotIndex: index,
        type,
    });

    const selectStoneData = (stones, out, done) => {
        switch (data.type) {
            case SlotType.REGULAR:
                return stones[fieldIndex];
            case SlotType.OUT:
                return out;
            case SlotType.DONE:
                return done;
            default:
                log.error('Got unsupported slot view type ' + type);
        }
    };

    const isNextFreeSlot = () => index === container.nextFreeSlot().index();

    api = {
        listen: (toGame) => {
            toGame.addEventListeners(api, [
                GameEvent.onStart,
                GameEvent.onSelectStone,
                GameEvent.onSelectTarget,
                GameEvent.onTargetSelected,
                GameEvent.onThrownOut,
            ]);
        },
        onStart: (game, stones, out, done) => {
            let stoneDefinition = selectStoneData(stones, out, done);
            let whiteStoneCount = stoneDefinition[Player.WHITE.id];
            let blackStoneCount = stoneDefinition[Player.BLACK.id];

            if (index < whiteStoneCount) {
                api.addStone(game, Player.WHITE, GameEvent.onStart);
            }

            if (index < blackStoneCount) {
                api.addStone(game, Player.BLACK, GameEvent.onStart);
            }
        },
        onSelectTarget: (game, selectedStoneData) => {
            if (
                data.type === SlotType.REGULAR
                && game.isStoneMovable(selectedStoneData.fieldIndex, fieldIndex)
                && isNextFreeSlot()
            ) {
                api.addTargetMarker();
                targetMarkerClickListener = (event) => {
                    game.selectTarget(selectedStoneData, data);
                };
                targetMarker.addEventListener('click', targetMarkerClickListener);
            }
        },
        addStone: (game, player, byEvent) => {
            stone = createStone({
                log,
                svg,
                cx,
                cy,
                radius,
                player,
                isTop,
                fieldIndex: fieldIndex,
                slotIndex: index,
            });
            stone.show();
            stone.listen(game);
            if (byEvent !== undefined) {
                container.stoneWasAdded(byEvent);
            }
        },
        removeStone: () => {
            if (api.hasStone()) {
                let removed = stone;
                stone.hide();
                stone = undefined;
                return removed;
            }
        },
        onSelectStone: (game, selectedStoneData) => {
            if (selectedStoneData && targetMarker) {
                api.removeTargetMarker();
            }
        },
        onTargetSelected: (game, selectedStoneData, selectedTargetSlotData) => {
            if (api.hasStone() && stone.dataEquals(selectedStoneData)) {
                api.removeStone();
            }
            if (data.equals(selectedTargetSlotData)) {
                api.addStone(game, selectedStoneData.player, GameEvent.onTargetSelected);
            }

            if (targetMarker) {
                api.removeTargetMarker();
            }
        },
        onThrownOut: (game, fromSlotData) => {
            let opponent = game.currentOpponent();

            if (data.equals(fromSlotData)) {
                api.removeStone();
            }
            else if (
                data.type === SlotType.OUT
                // currently only one stone per event
                && container.addedStoneCount(GameEvent.onThrownOut) < 1
                && isNextFreeSlot()
                && (
                    // implies that white out isTop - TODO: maybe add outPlayer to Slot-Spec
                    opponent === Player.WHITE && isTop
                    || opponent === Player.BLACK && !isTop
                )
            ) {
                api.addStone(game, opponent, GameEvent.onThrownOut);
            }
        },
        addTargetMarker: () => {
            targetMarker = svg.create(
                'circle',
                {
                    'cx': cx,
                    'cy': cy,
                    'r': radius,
                    'stroke': 'green',
                    'stroke-width': 2,
                    'stroke-dasharray': '2,2',
                    'fill-opacity': 0,
                },
            );
            svg.append(targetMarker);
        },
        removeTargetMarker: () => {
            targetMarker.parentNode.removeChild(targetMarker);
            targetMarker = undefined;
        },
        hasStone: () => stone !== undefined,
        index: () => index,
        toString: () => 'Slot ' + JSON.stringify(data),
    };

    return Object.freeze(api);
};
