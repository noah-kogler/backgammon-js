'use strict';

const createRootView = (spec) => {

    const { log, x, y, width, height } = spec;

    const svg = createSvg({ width, height });

    const board = createBoard({ log, svg, x, y, width, height });

    const api = Object.freeze({
        draw: (toNode) => {
            svg.draw(toNode);
        },
        listen: (toGame) => {
            board.listen(toGame);
        },
    });

    return api;
};
