'use strict';

const createField = (spec) => {
    let api;

    const { log, svg, index, x, width, height, isTop, isWhite, boardY, boardHeight, boardMarginBottom } = spec;

    const xCenter = x + width / 2;

    const yStart = isTop ? boardY : boardHeight + boardY - boardMarginBottom;

    const node = (() => {
        let xEnd = x + width;
        let yEnd = isTop ? yStart + height : yStart - height;

        return svg.create(
            'polygon',
            {
                'points': [[x, yStart], [xCenter, yEnd], [xEnd, yStart]],
                'stroke': '#685954',
                'stroke-width': .2,
                'fill': isWhite ? 'white' : 'black',
                'fill-opacity': .5,
            },
        );
    })();

    let loadedSlots;
    const slots = () => {
        if (loadedSlots) {
            return loadedSlots;
        }
        let slots = [];

        let fieldDiff = 6;
        let radius = width / 2 - fieldDiff;
        let cx = x + width / 2;
        let cy = isTop ? yStart + radius : yStart - radius;
        for (let i = 0; i < 5; i++) {
            slots.push(
                createSlot({
                    svg: svg,
                    field: api,
                    index: i,
                    radius: radius,
                    cx: cx,
                    cy: cy,
                })
            );
            cy = isTop ? cy + radius * 2 : cy - radius * 2;
        }

        loadedSlots = slots;
        return slots;
    };

    const targetMarker = undefined;

    const indexDisplay = log.levelIs(LogLevel.DEBUG)
        ? (() => {
            let fontSize = 10;
            let indexDisplay = svg.create(
                'text',
                {
                    'x': x,
                    'y': isTop ? yStart : yStart + fontSize,
                    'font-family': 'Verdana',
                    'font-size': fontSize,
                    'fill': '#666',
                },
            );

            svg.setText(indexDisplay, index);

            return indexDisplay;
        })()
        : undefined;

    api = Object.freeze({
        listen: (toGame) => {
            toGame.addEventListeners(api, [
                'onStart',
            ]);
            slots().forEach((slot) => { slot.listen(toGame); });
        },
        onStart: (game, stones) => {
            svg.append(node);
            if (log.levelIs(LogLevel.DEBUG)) {
                svg.append( indexDisplay);
            }
        },
        nextFreeSlot: () => {
            let nextIdx = slots().findIndex((slot) => !slot.hasStone());
            return slots()[nextIdx];
        },
        isTop: () => isTop,
        index: () => index,
        toString: () => 'Field ' + JSON.stringify({ index }),
    });

    return api;
};
