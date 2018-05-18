'use strict';

document.addEventListener('DOMContentLoaded', function () {
    const log = createLog({ level: LogLevel.DEBUG });

    const data = createGameData({ log });

    // create a test situation
    data.decrementStoneCount(0, Player.WHITE);
    for (var i = 0; i < 4; i++) {
        data.decrementStoneCount(5, Player.BLACK);
    }

    const game = createGameController({ log, data });

    const view = createRootView({
        log,
        x: 0,
        y: 20,
        width: 500,
        height: 310,
    });

    view.draw(document.body);

    view.listen(game);

    let selectedStoneData = {
        player: Player.WHITE,
        fieldIndex: 0,
        slotIndex: 0,
    };
    game.goToState([
        { event: GameEvent.onStart, params: [data.stones(), data.out(), data.done()] },
        { event: GameEvent.onRollDice, params: [] },
        { event: GameEvent.onDiceRolled, params: [[5, 1]] },
        { event: GameEvent.onSelectStone, params: [] },
        { event: GameEvent.onStoneSelected, params: [selectedStoneData] },
        { event: GameEvent.onSelectTarget, params: [selectedStoneData] },
    ]);
});
