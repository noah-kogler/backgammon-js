document.addEventListener('DOMContentLoaded', function () {
    var game = new Game({
        data: TestData,
    });

    var board = new Board({
        game: game,
        x: 0,
        y: 20,
        width: 500,
        height: 310,
        horizontalSpacing: 25,
        verticalSpacing: 40,
        marginBottom: DEBUG_MODE ? 10 : 0,
    });

    let selectedStoneData = {
        color: 'white',
        fieldIndex: 0,
        slotIndex: 0,
    };
    game.goToState([
        { event: 'onStart', params: [TestData.moves[0].stones] },
        { event: 'onRollDice', params: [] },
        { event: 'onDiceRolled', params: [[5, 1]] },
        { event: 'onSelectStone', params: [] },
        { event: 'onStoneSelected', params: [selectedStoneData] },
        { event: 'onSelectTarget', params: [selectedStoneData] },
    ]);
});
