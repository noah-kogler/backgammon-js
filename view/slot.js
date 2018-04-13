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
    this.targetMarkerClickListener = undefined;
    this.data = {
        fieldIndex: this.field.index,
        slotIndex: this.index,
    };

    this.board.game.addEventListener('onSelectStone', this.onSelectStone.bind(this));
    this.board.game.addEventListener('onSelectTarget', this.onSelectTarget.bind(this));
    this.board.game.addEventListener('onTargetSelected', this.onTargetSelected.bind(this));
};

Slot.prototype.addStone = function(color) {
    this.stone = new Stone({
        slot: this,
        field: this.field,
        color: color,
    });
    this.stone.show();
};

Slot.prototype.removeStone = function() {
    if (this.stone) {
        this.stone.node.parentNode.removeChild(this.stone.node);
        this.stone = undefined;
    }
};

Slot.prototype.onSelectTarget = function(selectedStoneData) {
    if (
        this.board.game.isStoneMovable(selectedStoneData, this.data)
        && this.index === this.field.nextSlot().index
    ) {
        this.addTargetMarker();
        this.targetMarkerClickListener = (event) => {
            this.board.game.selectTarget(selectedStoneData, this.data);
        };
        this.targetMarker.addEventListener('click', this.targetMarkerClickListener);
    }
};

Slot.prototype.onSelectStone = function(selectedStoneData) {
    if (selectedStoneData && this.targetMarker) {
        this.removeTargetMarker();
    }
};

Slot.prototype.onTargetSelected = function(selectedStoneData, selectedTargetSlotData) {
    if (this.stone && this.stone._dataEquals(selectedStoneData)) {
        this.removeStone();
    }

    if (this.targetMarker) {
        this.removeTargetMarker();
    }
    if (this._dataEquals(selectedTargetSlotData)) {
        this.addStone(selectedStoneData.color);
    }
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
    this.targetMarker.parentNode.removeChild(this.targetMarker);
    this.targetMarker = undefined;
};

Slot.prototype._dataEquals = function(slotData) {
    return slotData.fieldIndex == this.data.fieldIndex
        && slotData.slotIndex == this.data.slotIndex;
};