let Stone = function (args) { // args: slot, field, color
    this.slot = args.slot;
    this.field = args.field;
    this.color = args.color;
    this.board = this.slot.board;
    this.liftHeight = 10;
    this.stroke = 'grey';
    this.strokeWidth = .4;
    this.node = this._buildNode();
    this.onClick = undefined;
    this.data = {
        color: this.color,
        fieldIndex: this.field.index,
        slotIndex: this.slot.index,
    };

    this.board.game.addEventListener('onSelectStone', this.onSelectStone.bind(this));
    this.board.game.addEventListener('onStoneSelected', this.onStoneSelected.bind(this));
};

Stone.prototype._buildNode = function() {
    return this.board.svg.create({
        name: 'circle',
        attrs: {
            'cx': this.slot.cx,
            'cy': this.slot.cy,
            'r': this.slot.radius,
            'fill': this.color,
            'stroke': this.stroke,
            'stroke-width': this.strokeWidth,
        },
    });
};

Stone.prototype.show = function() {
    this.board.svg.append({
        node: this.node,
        to: this.board.svg.root,
    });
};

Stone.prototype.onSelectStone = function(selectedStoneData) {
    if (selectedStoneData && this._dataEquals(selectedStoneData)) {
        this._deselect();
    }
    if (this.color == this.board.game.currentPlayerColor()) {
        let isSelectable = this.board.game.isStoneSelectable(this.data);

        this.board.svg.changeAttrs({
            of: this.node,
            to: {
                stroke: isSelectable ? 'green' : 'red',
                'stroke-width': 2
            }
        });

        if (isSelectable) {
            this._replaceOnClickEventListener((event) => { this.board.game.selectStone(this.data); });
        }
    }
};

Stone.prototype.onStoneSelected = function(stoneData) {
    if (this._dataEquals(stoneData)) {
        this._select();
        this._replaceOnClickEventListener((event) => { this.board.game.deselectStone(this.data); });
    }
    else {
        this.node.removeEventListener('click', this.onClick);
    }

    this.board.svg.changeAttrs({
        of: this.node,
        to: {
            stroke: this.stroke,
            'stroke-width': this.strokeWidth,
        }
    });
};

Stone.prototype._select = function() {
    this.board.svg.changeAttrs({
        of: this.node,
        to: {
            cy: this.slot.isTop
                ? this.slot.cy + this.liftHeight
                : this.slot.cy - this.liftHeight
        },
    });

    this.selected = true;
};

Stone.prototype._deselect = function() {
    this.board.svg.changeAttrs({
        of: this.node,
        to: { cy: this.slot.cy },
    });

    this.selected = false;
};

Stone.prototype._dataEquals = function(stoneData) {
    return stoneData.color == this.data.color
        && stoneData.fieldIndex == this.data.fieldIndex
        && stoneData.slotIndex == this.data.slotIndex;
};

Stone.prototype._replaceOnClickEventListener = function(withEventListener) {
    if (this.onClick) {
        this.node.removeEventListener('click', this.onClick);
    }
    this.onClick = withEventListener;
    this.node.addEventListener('click', withEventListener);
};