let Slot = function (args) { // args: field, radius, cx, cy
    this.field = args.field;
    this.radius = args.radius;
    this.cx = args.cx;
    this.cy = args.cy;
    this.isTop = this.field.isTop;
    this.board = this.field.board;
    this.stone = undefined;
    this.targetMarker = undefined;
};

Slot.prototype.addStone = function(color) {
    this.stone = new Stone({
        slot: this,
        color: color,
    });
    this.stone.show();
};

Slot.prototype.addTargetMarker = function() {
    this.targetMarker = this.board.svg.create({
        name: 'circle',
        attrs: {
            'cx': this.cx,
            'cy': this.cy,
            'r': this.radius,
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

Slot.prototype.removeTargetMarker = function() {
    if (this.targetMarker) {
        this.targetMarker.parentNode.removeChild(this.targetMarker);
        this.targetMarker = undefined;
    }
};