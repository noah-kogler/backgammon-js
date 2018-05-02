'use strict';

document.addEventListener('DOMContentLoaded', function () {

    const log = createLog({ level: LogLevel.DEBUG });

    const game = createGame({ log, data: createData() });

    const view = createView({
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
