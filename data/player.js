'use strict';

const createPlayerData = (spec) => {

    const {id, color} = spec;

    return Object.freeze({
        id,
        color,
        equals: (otherPlayer) => id === otherPlayer.id,
        name: () => spec.color,
    })
};

const Player = Object.freeze({
    WHITE: createPlayerData({ id: 0, color: 'white' }),
    BLACK: createPlayerData({ id: 1, color: 'black' }),
});