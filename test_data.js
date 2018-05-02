'use strict';

const createTestData = () => {
    return {
        moves: [{
            player: 'white',
            stones: [
                // top left
                { white: 1, black: 0 },
                { white: 0, black: 0 },
                { white: 0, black: 0 },
                { white: 0, black: 0 },
                { white: 0, black: 0 },
                { white: 0, black: 1 },
                // top right
                { white: 0, black: 0 },
                { white: 0, black: 3 },
                { white: 0, black: 0 },
                { white: 0, black: 0 },
                { white: 0, black: 0 },
                { white: 5, black: 0 },
                // bottom right
                { white: 0, black: 5 },
                { white: 0, black: 0 },
                { white: 0, black: 0 },
                { white: 0, black: 0 },
                { white: 3, black: 0 },
                { white: 0, black: 0 },
                // bottom left
                { white: 5, black: 0 },
                { white: 0, black: 0 },
                { white: 0, black: 0 },
                { white: 0, black: 0 },
                { white: 0, black: 0 },
                { white: 0, black: 2 },
            ],
            out: {
                white: 0,
                black: 0,
            },
            done: {
                white: 0,
                black: 0,
            },
            dice: [
                undefined,
                undefined,
            ],
        }],
    };
};