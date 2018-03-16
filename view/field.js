let Field = function (args) { // args: board, index, x, isTop, isWhite
    this.board = args.board;
    this.index = args.index;
    this.x = args.x; // top left corner if isTop, else bottom left corner
    this.isTop = args.isTop;
    this.isWhite = args.isWhite;

    let fieldDiff = 5
    this.stoneRadius = this.board.fieldWidth / 2 - fieldDiff;
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
    let slot = this._nextSlot();

    let node = this.board.svg.create({
        name: 'circle',
        attrs: {
            'cx': slot.cx,
            'cy': slot.cy,
            'r': this.stoneRadius,
            'fill': color,
            'stroke': 'grey',
            'stroke-width': .4,
        },
    });

    slot.stone = { node: node, color: color };

    this.board.svg.append({
        node: node,
        to: this.board.svg.root,
    });
};

Field.prototype.initStoneInteraction = function(player) {
    for (let i = 0; i < this.slots.length; i++) {
        let slot = this.slots[i];

        if (slot.stone && slot.stone.color === player) {
            let nextSlot = i + 1 < this.slots.length ? this.slots[i + 1] : undefined;
            let isMovable = !(nextSlot && nextSlot.stone)
                && this.board.game.isMovable({ from: i });

            this.board.svg.changeAttrs({
                of: slot.stone.node,
                to: {
                    stroke: isMovable ? 'green' : 'red',
                    'stroke-width': 2
                }
            });
            if (isMovable) {
                let moveY = 10;
                let active = false;
                slot.stone.node.addEventListener('click', (event) => {
                    // TODO prevent markers of multiple stones!
                    let newCy;
                    if (active) {
                        newCy = slot.cy;
                        this.board.removePossibleTargetMarks();
                    }
                    else {
                        newCy = this.isTop ? slot.cy + moveY : slot.cy - moveY;
                        this.board.markPossibleTargets(this.index);
                    }

                    this.board.svg.changeAttrs({ of: slot.stone.node, to: { cy: newCy } });

                    active = !active;
                });
            }
        }
    }
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
