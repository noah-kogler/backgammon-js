let Field = function (args) {
    this.board = args.board;
    this.x = args.x; // top left corner if isTop, else bottom left corner
    this.isTop = args.isTop;
    this.isWhite = args.isWhite;

    let fieldDiff = 5
    this.stoneRadius = this.board.fieldWidth / 2 - fieldDiff;
    this.xCenter = this.x + this.board.fieldWidth / 2;
    this.yStart = this.isTop ? 0 : this.board.height;
    this.node = this._buildNode();
    this.slots = this._buildSlots();
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

    let cx = this.x + this.board.fieldWidth / 2;
    let cy = this.isTop ? this.yStart + this.stoneRadius : this.yStart - this.stoneRadius;
    for (let i = 0; i < 5; i++) {
        slots.push({
            cx: cx,
            cy: cy,
            stone: undefined,
        });
        cy = this.isTop ? cy + this.stoneRadius * 2 : cy - this.stoneRadius * 2;
    }

    return slots;
};

Field.prototype.pushStone = function(color) {
    let nextIdx = this.slots.findIndex((slot) => !slot.stone);
    let slot = this.slots[nextIdx];

    let node = this.board.svg.create({
        name: 'circle',
        attrs: {
            'cx': slot.cx,
            'cy': slot.cy,
            'r': this.stoneRadius,
            'fill': color,
            'stroke': color === 'black' ? 'white' : 'black',
            'stroke-width': .4,
        },
    });

    slot.stone = node;

    this.board.svg.append({
        node: node,
        to: this.board.svg.root,
    });
};