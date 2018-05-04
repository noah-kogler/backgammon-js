'use strict';

document.addEventListener('DOMContentLoaded', function () {
    const log = createLog({ level: LogLevel.DEBUG });

    const data = createGameData();

    data.moves[0].stones[0][Player.WHITE.id] = 1;
    data.moves[0].stones[5][Player.BLACK.id] = 1;

    const game = createGame({ log, data });

    const view = createView({
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
        { event: 'onStart', params: [data.moves[0].stones] },
        { event: 'onRollDice', params: [] },
        { event: 'onDiceRolled', params: [[5, 1]] },
        { event: 'onSelectStone', params: [] },
        { event: 'onStoneSelected', params: [selectedStoneData] },
        { event: 'onSelectTarget', params: [selectedStoneData] },
    ]);
});
