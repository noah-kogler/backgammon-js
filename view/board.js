let Board = function (args) { // args: x, y, width, height, verticalSpacing, horizontalSpacing
    this.x = args.x;
    this.y = args.y;
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
    this.diceStats = this._buildDiceStats();
    this.currentActionStats = this._buildCurrentActionStats();
    this.game = undefined; // gets set when a game is initialized with this board
};

Board.prototype._buildSvg = function() {
    return new SVG({ width: this.width, height: this.height });
};

Board.prototype._buildBackgroundBox = function() {
    return this.svg.create({
        name: 'rect',
        attrs: {
            'x': this.x,
            'y': this.y,
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

    let x = this.x;
    let isTop = true;
    let isWhite = true;
    for (let i = 0; i < 24; i++) {
        fields.push(
            new Field({ board: this, index: i, x: x, y: this.y, isTop: isTop, isWhite: isWhite })
        );

        isWhite = !isWhite;

        if (i < 11) {
            x += this.fieldWidth;
            if (i === 5) {
                x += this.horizontalSpacing;
            }
        }
        else if (i === 11) {
            isTop = false;
        }
        else {
            x -= this.fieldWidth;
            if (i === 17) {
                x -= this.horizontalSpacing;
            }
        }
    }

    return fields;
};

Board.prototype._buildCenterBox = function() {
    return this.svg.create({
        name: 'rect',
        attrs: {
            'x': this.width / 2 - this.horizontalSpacing / 2,
            'y': this.y,
            'width': this.horizontalSpacing,
            'height': this.height,
            'fill': 'black',
            'fill-opacity': .75,
        },
    });
};

Board.prototype._buildDiceStats = function() {
    return this.svg.create({
        name: 'text',
        attrs: {
            'x': 0,
            'y': 10,
            'font-family': 'Verdana',
            'font-size': '10',
        },
    });
};

Board.prototype._buildCurrentActionStats = function() {
    return this.svg.create({
        name: 'text',
        attrs: {
            'x': this.width / 2 + this.horizontalSpacing / 2,
            'y': 10,
            'font-family': 'Verdana',
            'font-size': '10',
        },
    });
};

Board.prototype.drawStatics = function(args) { // args: to
    this.svg.append({ node: this.backgroundBox, to: this.svg.root });

    this.fields.forEach((field) => { this.svg.append({ node: field.node, to: this.svg.root }) });
    this.svg.append({ node: this.centerBox, to: this.svg.root });

    this.svg.append({ node: this.svg.root, to: args.to });
};

Board.prototype.drawStats = function(args) { // args: to
    this.svg.append({ node: this.diceStats, to: this.svg.root });
    this.svg.append({ node: this.currentActionStats, to: this.svg.root });
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

Board.prototype.requestDice = function() {
    this._setCurrentActionStats('Roll the dice!');
    return new Promise((resolve, reject) => {
        this.svg.setText({ node: this.diceStats, to: 'roll' });

        var onDiceRolled = (event) => {
            var result = this.game.rollDice();

            this.svg.setText({ node: this.diceStats, to: result[0] + ' ' + result[1] });
            this.diceStats.removeEventListener('click', onDiceRolled);
            resolve();
        };
        this.diceStats.addEventListener('click', onDiceRolled);
    });
};

Board.prototype.startStoneSelection = function() {
    this._setCurrentActionStats('Select a Stone!');
    this.fields.forEach((field) => {
        field.startStoneSelection(this.game.currentPlayerColor());
    });
};

Board.prototype.stopStoneSelection = function() {
    this.fields.forEach((field) => {
        field.stopStoneSelection();
    });
};

Board.prototype.startTargetSelection = function(selectedFieldIndex) {
    this._setCurrentActionStats('Select a Target!');
    this.fields.forEach((field) => {
        field.startTargetSelection(selectedFieldIndex);
    });
};

Board.prototype.stopTargetSelection = function() {
    this.fields.forEach((field) => {
        field.stopTargetSelection();
    });
};

Board.prototype._setCurrentActionStats = function(action) {
    this.svg.setText({
        node: this.currentActionStats,
        to: this.game.currentPlayerColor() + ': ' + action,
    });
};
