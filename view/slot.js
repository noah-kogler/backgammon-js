let Slot = function (args) { // args: field, index, radius, cx, cy
    this.field = args.field;
    this.index = args.index;
    this.radius = args.radius;
    this.cx = args.cx;
    this.cy = args.cy;
    this.isTop = this.field.isTop;
    this.board = this.field.board;
    this.stone = undefined;
    this.targetMarker = undefined;
    this.data = {
        fieldIndex: this.field.index,
        slotIndex: this.index,
    };

    this.board.game.addEventListener('onSelectStone', this.onSelectStone.bind(this));
    this.board.game.addEventListener('onSelectTarget', this.onSelectTarget.bind(this));
};

Slot.prototype.addStone = function(color) {
    this.stone = new Stone({
        slot: this,
        field: this.field,
        color: color,
    });
    this.stone.show();
};

Slot.prototype.onSelectTarget = function(selectedStoneData) {
    if (
        this.board.game.isStoneMovable(selectedStoneData, this.data)
        && this.index === this.field.nextSlot().index
    ) {
        this.addTargetMarker();
    }
};

Slot.prototype.onSelectStone = function(selectedStoneData) {
    if (selectedStoneData && this.targetMarker) {
        this.removeTargetMarker();
    }
};

Slot.prototype.addTargetMarker = function() {
    // console.log('addTargetMarker' + this.field.index); // TODO why is this called twice per slot
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
    this.targetMarker.parentNode.removeChild(this.targetMarker);
    this.targetMarker = undefined;
};