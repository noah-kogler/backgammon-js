'use strict';

const createSvg = (spec) => {

    const { width, height } = spec;

    const ns = 'http://www.w3.org/2000/svg';

    const collapsePoints = points => points
        .map(entry => Array.isArray(entry) ? entry.join(' ') : entry)
        .join(', ');

    const root = document.createElementNS(ns, 'svg');
    root.setAttribute('xmlns', ns);
    root.setAttribute('version', '1.1');
    root.setAttribute('viewBox', collapsePoints([[0, 0, width, height]]));
    root.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    const api = {

        draw: (toNode) => {
            api.append(root, toNode);
        },

        create: (name, attrs) => {
            let node = document.createElementNS(ns, name);
            Object.keys(attrs).forEach((key) => {
                let rawValue = attrs[key];
                let value = Array.isArray(rawValue) ? collapsePoints(rawValue) : rawValue;
                node.setAttributeNS(null, key, value);
            });
            return node;
        },

        append: (node, toNode) => {
            toNode = toNode || root;
            toNode.appendChild(node);
        },

        setText: (ofNode, toText) => {
            // clears all content before
            while (ofNode.firstChild) {
                ofNode.removeChild(ofNode.firstChild);
            }
            ofNode.appendChild(
                document.createTextNode(toText)
            );
        },

        changeAttrs: (ofNode, toAttrs) => {
            Object.keys(toAttrs).forEach((key) => {
                let rawValue = toAttrs[key];
                let value;
                if (Array.isArray(rawValue)) {
                    value = collapsePoints(rawValue);
                }
                else {
                    value = rawValue;
                }

                ofNode.setAttributeNS(null, key, value);
            });
        },

    };

    return Object.freeze(api);
};