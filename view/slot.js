let Slot = function (args) { // args: board, radius, cx, cy, isTop
    this.board = args.board;
    this.radius = args.radius;
    this.cx = args.cx;
    this.cy = args.cy;
    this.isTop = args.isTop;
    this.stone = undefined;
};

Slot.prototype.showStone = function(color) {
    this.stone = new Stone({
        slot: this,
        color: color,
    });
    this.stone.show();
};

Slot.prototype.markStone = function(isMovable) {
    this.stone.mark(isMovable);
};