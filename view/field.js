let Field = function (args) { // args: board, index, x, y, isTop, isWhite
    this.board = args.board;
    this.index = args.index;
    this.x = args.x; // top left corner if isTop, else bottom left corner
    this.y = args.y
    this.isTop = args.isTop;
    this.isWhite = args.isWhite;
    this.xCenter = this.x + this.board.fieldWidth / 2;
    this.yStart = this.isTop ? this.y : this.board.height + this.board.y;
    this.node = this._buildNode();
    this.slots = this._buildSlots();
    this.targetMarker = undefined;
};

Field.prototype._buildNode = function() {
    let xEnd = this.x + this.board.fieldWidth;
    let yEnd = this.isTop
        ? this.yStart + this.board.fieldHeight
        : this.yStart - this.board.fieldHeight;

    return this.board.svg.create({
        name: 'polygon',
        attrs: {
            'points': [[this.x, this.yStart], [this.xCenter, yEnd], [xEnd, this.yStart]],
            'stroke': 'black',
            'stroke-width': .2,
            'stroke-linecap': 'round',
            'fill': this.isWhite ? 'white' : 'black',
            'fill-opacity': .75,
        },
    });
};

Field.prototype._buildSlots = function() {
    let slots = [];

    let fieldDiff = 6;
    let radius = this.board.fieldWidth / 2 - fieldDiff;
    let cx = this.x + this.board.fieldWidth / 2;
    let cy = this.isTop ? this.yStart + radius : this.yStart - radius;
    for (let i = 0; i < 5; i++) {
        slots.push(
            new Slot({
                field: this,
                index: i,
                radius: radius,
                cx: cx,
                cy: cy,
            })
        );
        cy = this.isTop ? cy + radius * 2 : cy - radius * 2;
    }

    return slots;
};

Field.prototype.pushStone = function(color) {
    let slot = this.nextSlot();
    slot.addStone(color);
};

Field.prototype.nextSlot = function() {
    let nextIdx = this.slots.findIndex((slot) => !slot.stone);
    return this.slots[nextIdx];
};
