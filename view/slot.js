'use strict';

const createSlot = (spec) => {
    let api;

    const { log, svg, field, index, radius, cx, cy } = spec;

    const isTop = field.isTop();

    let stone = undefined;

    let targetMarker = undefined;

    let targetMarkerClickListener = undefined;

    const data = {
        fieldIndex: field.index(),
        slotIndex: index,
    };

    let toGameMem = undefined; // TODO fix this bad mutable attribute

    const dataEquals = (slotData) =>
        slotData.fieldIndex === data.fieldIndex
        && slotData.slotIndex === data.slotIndex;

    api = {
        listen: (toGame) => {
            toGameMem = toGame;
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
                api.addStone('white');
            }

            if (index < blackStoneCount) {
                api.addStone('black');
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
        addStone: (color) => {
            stone = createStone({
                svg,
                cx,
                cy,
                radius,
                isTop,
                slotIndex: index,
                field,
                color,
            });
            stone.show();
            stone.listen(toGameMem);
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
            if (dataEquals(selectedTargetSlotData)) {
                api.addStone(selectedStoneData.color);
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
