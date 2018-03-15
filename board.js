let Board = function (args) {
    this.width = args.width;
    this.height = args.height;
    this.verticalSpacing = args.verticalSpacing;
    this.horizontalSpacing = args.horizontalSpacing;
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
    let fieldWidth = (this.width - this.horizontalSpacing) / 12;
    let fieldHeight = (this.height - this.verticalSpacing) / 2;
    let fields = [];

    // top left
    let isWhite = true;
    let start = 0;
    for (let i = 0; i < 6; i++) {
        let center = start + fieldWidth / 2;
        let end = start + fieldWidth;

        fields.push(
            this._buildField({
                points: [[start, 0], [center, fieldHeight], [end, 0]],
                isWhite: isWhite,
            })
        );

        isWhite = !isWhite;
        start = end;
    }

    // top right
    start += this.horizontalSpacing;
    for (let i = 0; i < 6; i++) {
        let center = start + fieldWidth / 2;
        let end = start + fieldWidth;

        fields.push(
            this._buildField({
                points: [[start, 0], [center, fieldHeight], [end, 0]],
                isWhite: isWhite,
            })
        );

        isWhite = !isWhite;
        start = end;
    }

    // bottom left
    start = 0;
    isWhite = !isWhite;
    for (let i = 0; i < 6; i++) {
        let center = start + fieldWidth / 2;
        let end = start + fieldWidth;

        fields.push(
            this._buildField({
                points: [[start, this.height], [center, this.height - fieldHeight], [end, this.height]],
                isWhite: isWhite,
            })
        );

        isWhite = !isWhite;
        start = end;
    }

    // bottom right
    start += this.horizontalSpacing;
    for (let i = 0; i < 6; i++) {
        let center = start + fieldWidth / 2;
        let end = start + fieldWidth;

        fields.push(
            this._buildField({
                points: [[start, this.height], [center, this.height - fieldHeight], [end, this.height]],
                isWhite: isWhite,
            })
        );

        isWhite = !isWhite;
        start = end;
    }

    return fields;
};

Board.prototype._buildField = function(args) {
    return this.svg.create({
        name: 'polygon',
        attrs: {
            'points': args.points,
            'stroke': 'black',
            'stroke-width': .2,
            'stroke-linecap': 'round',
            'fill': args.isWhite ? 'white' : 'black',
            'fill-opacity': .75,
        },
    });
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

Board.prototype.draw = function(args) {
    this.svg.append({ node: this.backgroundBox, to: this.svg.root });

    this.fields.forEach((field) => { this.svg.append({ node: field, to: this.svg.root }) });
    this.svg.append({ node: this.centerBox, to: this.svg.root });

    this.svg.append({ node: this.svg.root, to: args.to });
};

Board.prototype.drawStones = function(fields) {
    // body...
};