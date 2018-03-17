let Stone = function (args) { // args: slot, color
    this.slot = args.slot;
    this.color = args.color;
    this.board = this.slot.board;
    this.liftHeight = 10;
    this.stroke = 'grey';
    this.strokeWidth = .4;
    this.node = this._buildNode();
    this.selected = false;
    this.onClick = undefined;
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

Stone.prototype.addStoneSelectionMark = function(isMovable) {
    this.board.svg.changeAttrs({
        of: this.node,
        to: {
            stroke: isMovable ? 'green' : 'red',
            'stroke-width': 2
        }
    });

    if (isMovable) {
        this.addSelector();
    }
};

Stone.prototype.removeStoneSelectionMark = function() {
    this.board.svg.changeAttrs({
        of: this.node,
        to: {
            stroke: this.stroke,
            'stroke-width': this.strokeWidth,
        }
    });
};

Stone.prototype.addSelector = function() {
    this.node.removeEventListener('click', this.onClick);

    this.onClick = function (event) {
        this._select();
        this.board.stopStoneSelection();
        this.board.startTargetSelection(this.slot.field.index);
        this.addDeselector();
    }.bind(this);
    this.node.addEventListener('click', this.onClick);
};

Stone.prototype.addDeselector = function() {
    this.node.removeEventListener('click', this.onClick);

    this.onClick = function (event) {
        this._deselect();
        this.board.startStoneSelection(this.color);
        this.board.stopTargetSelection();
        this.addSelector();
    }.bind(this);
    this.node.addEventListener('click', this.onClick);
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