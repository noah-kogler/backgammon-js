document.addEventListener('DOMContentLoaded', function () {
    var board = new Board({
        x: 0,
        y: 20,
        width: 500,
        height: 310,
        horizontalSpacing: 20,
        verticalSpacing: 40
    });

    var game = new Game({
        board: board
    });

    game.start();
});
