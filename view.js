let View = function (args) { // args: game, svg
    this.game = args.game;
    this.svg  = args.svg;
}

View.prototype.totalWidth = function() {
    return this.svg.width;
};

View.prototype.totalHeight = function() {
    return this.svg.height;
};

View.prototype.addGameEventListeners = function(types) {
    types.forEach((type) => {
        if (this[type]) {
            this.game.addEventListener(type, this[type].bind(this));
        }
        else {
            Log.errorMsg(
                'Missing event handler definition in '
                + this.constructor.name + ' for ' + type + '.'
            );
        }
    });
};