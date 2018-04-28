let Board = function (args) { // args: game, x, y, width, height, verticalSpacing, horizontalSpacing, marginBottom
    View.call(this, {
        svg: new SVG({ width: args.width, height: args.height }),
        game: args.game,
    });
    this.x = args.x;
    this.y = args.y;
    this.verticalSpacing = args.verticalSpacing;
    this.horizontalSpacing = args.horizontalSpacing;
    this.marginBottom = args.marginBottom;

    this.fields = this._buildFields();
    this.centerBox = this._buildCenterBox();
    this.backgroundBox = this._buildBackgroundBox();
    this.diceStats = this._buildDiceStats();
    this.currentActionStats = this._buildCurrentActionStats();
    this.onRollBtnClick = undefined;

    this.addGameEventListeners([
        'onStart',
        'onRollDice',
        'onDiceRolled',
        'onSelectStone',
        'onSelectTarget',
    ]);
};
Board.prototype = Object.create(View.prototype);
Board.prototype.constructor = Board;

Board.prototype._buildBackgroundBox = function() {
    return this.svg.create({
        name: 'rect',
        attrs: {
            'x': this.x,
            'y': this.y,
            'width': this.totalWidth(),
            'height': this.totalHeight() - this.marginBottom,
            'stroke': '#685954',
            'stroke-width': 2,
            'fill': '#BEA192',
        },
    });
};

Board.prototype._buildFields = function() {
    let fields = [];

    let fieldWidth = (this.totalWidth() - this.horizontalSpacing) / 12;
    let fieldHeight = (this.totalHeight() - this.verticalSpacing) / 2;
    let x = this.x;
    let isTop = true;
    let isWhite = true;
    for (let i = 0; i < 24; i++) {
        fields.push(
            new Field({
                svg: this.svg,
                game: this.game,
                index: i,
                x: x,
                boardY: this.y,
                width: fieldWidth,
                height: fieldHeight,
                isTop: isTop,
                isWhite: isWhite,
                boardMarginBottom: this.marginBottom,
            })
        );

        isWhite = !isWhite;

        if (i < 11) {
            x += fieldWidth;
            if (i === 5) {
                x += this.horizontalSpacing;
            }
        }
        else if (i === 11) {
            isTop = false;
        }
        else {
            x -= fieldWidth;
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
            'x': this.totalWidth() / 2 - this.horizontalSpacing / 2,
            'y': this.y,
            'width': this.horizontalSpacing,
            'height': this.totalHeight() - this.marginBottom,
            'fill': 'black',
            'fill-opacity': .5,
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
            'x': this.totalWidth() / 2 + this.horizontalSpacing / 2,
            'y': 10,
            'font-family': 'Verdana',
            'font-size': '10',
        },
    });
};

Board.prototype.onStart = function(stones) {
    this.drawStatics({ to: document.body });
    this.drawStones(stones);
    this.drawStats({ to: document.body });
};

Board.prototype.drawStatics = function(args) { // args: to
    this.svg.append({ node: this.backgroundBox, to: this.svg.root });

    this.fields.forEach(field => { field.draw(); });
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

Board.prototype.onRollDice = function() {
    this._setCurrentActionStats('Roll the dice!');
    this.svg.setText({ node: this.diceStats, to: 'roll' });

    this.onRollBtnClick = (clickEvent) => { this.game.rollDice(); };
    this.diceStats.addEventListener('click', this.onRollBtnClick);
};

Board.prototype.onDiceRolled = function(result) {
    this.diceStats.removeEventListener('click', this.onRollBtnClick);
    this.svg.setText({ node: this.diceStats, to: result[0] + ' ' + result[1] });
};

Board.prototype.onSelectStone = function(selectedStoneData) {
    this._setCurrentActionStats('Select a Stone!');
};

Board.prototype.onSelectTarget = function(selectedStoneData) {
    this._setCurrentActionStats('Select a Target!');
};

Board.prototype._setCurrentActionStats = function(action) {
    this.svg.setText({
        node: this.currentActionStats,
        to: this.game.currentPlayerColor() + ': ' + action,
    });
};
