let debugMode = true;

document.addEventListener('DOMContentLoaded', function () {
    var game = new Game();

    var board = new Board({
        game: game,
        x: 0,
        y: 20,
        width: 500,
        height: 310,
        horizontalSpacing: 20,
        verticalSpacing: 40,
    });

    game.start();
});

function debugMsg(msg) {
    if (debugMode) {
        console.log(msg);
    }
}

function errorMsg(msg) {
    console.error(msg);
}
