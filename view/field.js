let Field = function (args) { // args: svg, game, index, x, boardY, width, height, isTop, isWhite
    View.call(this, {
        svg: args.svg,
        game: args.game,
    });
    this.index = args.index;
    this.x = args.x; // top left corner if isTop, else bottom left corner
    this.width = args.width;
    this.height = args.height;
    this.isTop = args.isTop;
    this.isWhite = args.isWhite;
    this.xCenter = this.x + this.width / 2;
    this.yStart = this.isTop ? args.boardY : this.totalHeight() + args.boardY;
    this.node = this._buildNode();
    this.slots = this._buildSlots();
    this.targetMarker = undefined;
};
Field.prototype = Object.create(View.prototype);
Field.prototype.constructor = Field;

Field.prototype._buildNode = function() {
    let xEnd = this.x + this.width;
    let yEnd = this.isTop
        ? this.yStart + this.height
        : this.yStart - this.height;

    return this.svg.create({
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
    let radius = this.width / 2 - fieldDiff;
    let cx = this.x + this.width / 2;
    let cy = this.isTop ? this.yStart + radius : this.yStart - radius;
    for (let i = 0; i < 5; i++) {
        slots.push(
            new Slot({
                svg: this.svg,
                game: this.game,
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
