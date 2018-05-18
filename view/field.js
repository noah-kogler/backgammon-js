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
                GameEvent.onStart,
            ]);
        },
        onStart: (game, stones) => {
            svg.append(node);
            if (log.levelIs(LogLevel.DEBUG)) {
                svg.append(indexDisplay);
            }
        },
        toString: () => 'Field ' + JSON.stringify({ index }),
    });

    let slotContainer = createSlotContainer({
        log,
        svg,
        x,
        y,
        width,
        fieldIndex: index,
        isTop,
        slotType: SlotType.REGULAR,
    });

    return Object.freeze(
        Object.assign(
            {},
            api,
            slotContainer,
            {
                listen: (toGame) => {
                    api.listen(toGame);
                    slotContainer.listen(toGame);
                },
            },
        )
    );
};
