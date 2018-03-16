let SVG = function(args) { // args: width, height
    this.width = args.width;
    this.height = args.height;
    this.ns = "http://www.w3.org/2000/svg";
    this.root = this._build_root();
};

SVG.prototype._build_root = function() {
    let root = document.createElementNS(this.ns, "svg");
    root.setAttribute('xmlns', this.ns);
    root.setAttribute('version', '1.1');
    root.setAttribute('viewBox', this._collapsePoints([[0, 0, this.width, this.height]]));
    root.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    root.setAttribute('style', 'width:90%; height:90%; position:absolute; top:5%; left:5%; z-index:-1;');
    return root;
};

SVG.prototype.create = function(args) { // args: name, attrs
    let node = document.createElementNS(this.ns, args.name);
    Object.keys(args.attrs).forEach((key) => {
        let rawValue = args.attrs[key];
        let value;
        if (Array.isArray(rawValue)) {
            value = this._collapsePoints(rawValue);
        }
        else {
            value = rawValue;
        }

        node.setAttributeNS(null, key, value);
    });
    return node;
};

SVG.prototype.append = function(args) { // args: to, node
    args.to.appendChild(args.node);
};

SVG.prototype.changeAttrs = function(args) { // args: of, to
    Object.keys(args.to).forEach((key) => {
        let rawValue = args.to[key];
        let value;
        if (Array.isArray(rawValue)) {
            value = this._collapsePoints(rawValue);
        }
        else {
            value = rawValue;
        }

        args.of.setAttributeNS(null, key, value);
    });
};

SVG.prototype._collapsePoints = function(points) {
    return points
        .map((entry) => Array.isArray(entry) ? entry.join(' ') : entry )
        .join(', ');
};
