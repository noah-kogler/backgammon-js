'use strict';

const createStone = (spec) => {
    let api;

    const { log, svg, cx, cy, radius, player, isTop, fieldIndex, slotIndex } = spec;

    const liftHeight = 10;

    const stroke = 'grey';

    const strokeWidth = .4;

    const node = svg.create(
        'circle',
        {
            'cx': cx,
            'cy': cy,
            'r': radius,
            'fill': player.color,
            'stroke': stroke,
            'stroke-width': strokeWidth,
        }
    );

    let onClick = undefined;

    const data = createStoneData({
        player: player,
        fieldIndex: fieldIndex,
        slotIndex: slotIndex,
    });

    let selected = false;

    const select = () => {
        svg.changeAttrs(
            node,
            { cy: isTop ? cy + liftHeight : cy - liftHeight },
        );

        selected = true;
    };

    const deselect = () => {
        svg.changeAttrs(node, { cy });
        selected = false;
    };

    const replaceOnClickEventListener = (withEventListener) => {
        if (onClick) {
            node.removeEventListener('click', onClick);
        }
        onClick = withEventListener;
        node.addEventListener('click', withEventListener);
    };

    api = {
        listen: (toGame) => {
            toGame.addEventListeners(api, [
                GameEvent.onStart,
                GameEvent.onSelectStone,
                GameEvent.onStoneSelected,
            ]);
        },
        onStart: () => {
            api.show();
        },
        onSelectStone: (game, selectedStoneData) => {
            if (selectedStoneData && api.dataEquals(selectedStoneData)) {
                deselect();
            }
            if (player.equals(game.currentPlayer())) {
                let isSelectable = game.isStoneSelectable(data);

                svg.changeAttrs(
                    node,
                    {
                        stroke: isSelectable ? 'green' : 'red',
                        'stroke-width': 2
                    }
                );

                if (isSelectable) {
                    replaceOnClickEventListener((event) => { game.selectStone(data); });
                }
            }
        },
        onStoneSelected: (game, stoneData) => {
            if (api.dataEquals(stoneData)) {
                select();
                replaceOnClickEventListener((event) => { game.deselectStone(data); });
            }
            else {
                node.removeEventListener('click', onClick);
            }

            svg.changeAttrs(
                node,
                {
                    'stroke': stroke,
                    'stroke-width': strokeWidth,
                }
            );
        },
        show: () => {
            svg.append(node);
        },
        hide: () => {
            node.parentNode.removeChild(node);
        },
        dataEquals: data.equals,
        player: () => data.player,
        toString: () => 'Stone ' + JSON.stringify(data),
    };

    return Object.freeze(api);
};
