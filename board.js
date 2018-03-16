let Board = function (args) {
    this.width = args.width;
    this.height = args.height;
    this.verticalSpacing = args.verticalSpacing;
    this.horizontalSpacing = args.horizontalSpacing;
    this.fieldWidth = (this.width - this.horizontalSpacing) / 12;
    this.fieldHeight = (this.height - this.verticalSpacing) / 2;
    this.svg = this._buildSvg();
    this.fields = this._buildFields();
    this.centerBox = this._buildCenterBox();
    this.backgroundBox = this._buildBackgroundBox();
};

Board.prototype._buildSvg = function() {
    return new SVG({ width: this.width, height: this.height });
};

Board.prototype._buildBackgroundBox = function() {
    return this.svg.create({
        name: 'rect',
        attrs: {
            'x': 0,
            'y': 0,
            'width': this.width,
            'height': this.height,
            'stroke': 'black',
            'fill': 'brown',
            'stroke-width': .4,
        },
    });
};

Board.prototype._buildFields = function() {
    let fields = [];

    // top left
    let isWhite = true;
    let start = 0;
    for (let i = 0; i < 6; i++) {
        let end = start + this.fieldWidth;

        fields.push(
            new Field({ board: this, x: start, isTop: true, isWhite: isWhite })
        );

        isWhite = !isWhite;
        start = end;
    }

    // top right
    start += this.horizontalSpacing;
    for (let i = 0; i < 6; i++) {
        let end = start + this.fieldWidth;
        fields.push(
            new Field({ board: this, x: start, isTop: true, isWhite: isWhite })
        );

        isWhite = !isWhite;
        start = end;
    }

    // bottom left
    start = this.width - this.fieldWidth;
    for (let i = 0; i < 6; i++) {
        let end = start - this.fieldWidth;
        fields.push(
            new Field({ board: this, x: start, isTop: false, isWhite: isWhite })
        );

        isWhite = !isWhite;
        start = end;
    }

    // bottom right
    start -= this.horizontalSpacing;
    for (let i = 0; i < 6; i++) {
        let end = start - this.fieldWidth;

        fields.push(
            new Field({ board: this, x: start, isTop: false, isWhite: isWhite })
        );

        isWhite = !isWhite;
        start = end;
    }

    return fields;
};

Board.prototype._buildCenterBox = function() {
    return this.svg.create({
        name: 'rect',
        attrs: {
            'x': this.width / 2 - this.horizontalSpacing / 2,
            'y': 0,
            'width': this.horizontalSpacing,
            'height': this.height,
            'fill': 'black',
            'fill-opacity': .75,
        },
    });
};

Board.prototype.drawStatics = function(args) {
    this.svg.append({ node: this.backgroundBox, to: this.svg.root });

    this.fields.forEach((field) => { this.svg.append({ node: field.node, to: this.svg.root }) });
    this.svg.append({ node: this.centerBox, to: this.svg.root });

    this.svg.append({ node: this.svg.root, to: args.to });
};

Board.prototype.drawStones = function(stones) {
    if (stones.length !== this.fields.length) {
        console.error(
            "Different stones and fields length. "
            + "There must be a stones entry for every field!"
        );
    }

    for (let i = 0; i < this.fields.length; i++) {
        for (let j = 0; j < stones[i].white; j++) {
            this.fields[i].pushStone('white');
        }
        for (let j = 0; j < stones[i].black; j++) {
            this.fields[i].pushStone('black');
        }
    }
};

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
