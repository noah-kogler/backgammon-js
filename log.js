'use strict';

const LogLevel = {
    DEBUG: 1,
    ERROR: 0,
};

const createLog = (spec) => {
    const { level } = spec;

    const api = Object.freeze({
        levelIs: (checkLevel) => {
            return level === checkLevel;
        },
        debug: (msg) => {
            if (level >= LogLevel.DEBUG) {
                console.log(msg);
            }
        },
        error: (msg) => {
            if (level >= LogLevel.ERROR) {
                console.error(msg);
            }
        },
    });

    return api;
};
