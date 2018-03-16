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
