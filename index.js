'use strict';

document.addEventListener('DOMContentLoaded', function () {

    const log = createLog({ level: LogLevel.DEBUG });

    const game = createGameController({ log, data: createGameData({ log }) });

    const view = createRootView({
        log,
        x: 0,
        y: 20,
        width: 500,
        height: 310,
    });

    view.draw(document.body);

    view.listen(game);

    game.start();
});
