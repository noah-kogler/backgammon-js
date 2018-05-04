'use strict';

const createField = (spec) => {
    let api;

    const { log, svg, index, x, y, width, height, isTop, isWhite } = spec;

    const xCenter = x + width / 2;

    const node = (() => {
        let xEnd = x + width;
        let yEnd = isTop ? y + height : y - height;

        return svg.create(
            'polygon',
            {
                'points': [[x, y], [xCenter, yEnd], [xEnd, y]],
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
        let cy = isTop ? y + radius : y - radius;
        for (let i = 0; i < 5; i++) {
            slots.push(
                createSlot({
                    log,
                    svg,
                    field: api,
                    cx,
                    cy,
                    radius,
                    index: i,
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
                    'y': isTop ? y : y + fontSize,
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
