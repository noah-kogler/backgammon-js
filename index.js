document.addEventListener('DOMContentLoaded', function () {
    var board = new Board({
        width: 500,
        height: 320,
        horizontalSpacing: 20,
        verticalSpacing: 40
    });

    var game = new Game({
        board: board
    });

    board.draw({ to: document.body });
});