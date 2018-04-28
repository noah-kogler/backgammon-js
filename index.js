document.addEventListener('DOMContentLoaded', function () {
    var game = new Game({
        data: Data,
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

    game.start();
});
