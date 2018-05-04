'use strict';

const createSlot = (spec) => {
    let api;

    const { log, svg, field, cx, cy, radius, index } = spec;

    const isTop = field.isTop();

    let stone = undefined;

    let targetMarker = undefined;

    let targetMarkerClickListener = undefined;

    const data = createSlotData({
        fieldIndex: field.index(),
        slotIndex: index,
    });

    const addStone = (game, color) => {
        stone = createStone({
            log,
            svg,
            cx,
            cy,
            radius,
            color,
            isTop,
            fieldIndex: data.fieldIndex,
            slotIndex: index,
        });
        stone.show();
        stone.listen(game);
    };

    api = {
        listen: (toGame) => {
            toGame.addEventListeners(api, [
                'onStart',
                'onSelectStone',
                'onSelectTarget',
                'onTargetSelected',
            ]);
        },
        onStart: (game, stones) => {
            let whiteStoneCount = stones[field.index()]['white'];
            let blackStoneCount = stones[field.index()]['black'];

            if (index < whiteStoneCount) {
                addStone(game, 'white');
            }

            if (index < blackStoneCount) {
                addStone(game, 'black');
            }
        },
        onSelectTarget: (game, selectedStoneData) => {
            if (
                game.isStoneMovable(selectedStoneData.fieldIndex, data.fieldIndex)
                && index === field.nextFreeSlot().index()
            ) {
                api.addTargetMarker();
                targetMarkerClickListener = (event) => {
                    game.selectTarget(selectedStoneData, data);
                };
                targetMarker.addEventListener('click', targetMarkerClickListener);
            }
        },
        removeStone: () => {
            if (api.hasStone()) {
                stone.hide();
                stone = undefined;
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
                addStone(game, selectedStoneData.color);
            }

            if (targetMarker) {
                api.removeTargetMarker();
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
