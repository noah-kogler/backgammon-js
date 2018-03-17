let Field = function (args) { // args: board, index, x, isTop, isWhite
    this.board = args.board;
    this.index = args.index;
    this.x = args.x; // top left corner if isTop, else bottom left corner
    this.isTop = args.isTop;
    this.isWhite = args.isWhite;
    this.xCenter = this.x + this.board.fieldWidth / 2;
    this.yStart = this.isTop ? 0 : this.board.height;
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

    let fieldDiff = 5
    let radius = this.board.fieldWidth / 2 - fieldDiff;
    let cx = this.x + this.board.fieldWidth / 2;
    let cy = this.isTop ? this.yStart + radius : this.yStart - radius;
    for (let i = 0; i < 5; i++) {
        slots.push(
            new Slot({
                board: this.board,
                radius: radius,
                cx: cx,
                cy: cy,
                isTop: this.isTop,
            })
        );
        cy = this.isTop ? cy + radius * 2 : cy - radius * 2;
    }

    return slots;
};

Field.prototype.pushStone = function(color) {
    let slot = this._nextSlot();
    slot.showStone(color);
};

Field.prototype.initStoneSelection = function(player) {
    for (let i = 0; i < this.slots.length; i++) {
        let slot = this.slots[i];

        if (slot.stone && slot.stone.color === player) {
            let nextSlot = i + 1 < this.slots.length ? this.slots[i + 1] : undefined;
            let isMovable = !(nextSlot && nextSlot.stone)
                && this.board.game.isMovable({ from: i });

            slot.markStone(isMovable);
        }
    }
};

Field.prototype.stopStoneSelection = function() {
    this.slots.forEach((slot) => {
        slot.removeStoneSelector();
    });
};

Field.prototype.showTargetMarker = function() {
    let slot = this._nextSlot();

    this.targetMarker = this.board.svg.create({
        name: 'circle',
        attrs: {
            'cx': slot.cx,
            'cy': slot.cy,
            'r': this.stoneRadius,
            'stroke': 'green',
            'stroke-width': 2,
            'stroke-dasharray': '2,2',
            'fill-opacity': 0,
        },
    });

    this.board.svg.append({
        node: this.targetMarker,
        to: this.board.svg.root,
    });
};

Field.prototype.removeTargetMarker = function() {
    if (this.targetMarker) {
        this.targetMarker.parentNode.removeChild(this.targetMarker);
        this.targetMarker = undefined;
    }
};

Field.prototype._nextSlot = function() {
    let nextIdx = this.slots.findIndex((slot) => !slot.stone);
    return this.slots[nextIdx];
};
