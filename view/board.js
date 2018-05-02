'use strict';

const createBoard = (spec) => {

    const { log, svg, x, y, width, height } = spec;

    const verticalSpacing = 40;

    const horizontalSpacing = 25;

    const marginBottom = log.levelIs(LogLevel.DEBUG) ? 10 : 0;

    const fields = (() => {
        const fields = [];

        let fieldX = x;
        let fieldWidth = (width - horizontalSpacing) / 12;
        let fieldHeight = (height - verticalSpacing) / 2;
        let isTop = true;
        let isWhite = true;
        for (let i = 0; i < 24; i++) {
            fields.push(
                createField({
                    log: log,
                    svg: svg,
                    index: i,
                    x: fieldX,
                    boardY: y,
                    width: fieldWidth,
                    height: fieldHeight,
                    isTop: isTop,
                    isWhite: isWhite,
                    boardMarginBottom: marginBottom,
                    boardHeight: height,
                })
            );

            isWhite = !isWhite;

            if (i < 11) {
                fieldX += fieldWidth;
                if (i === 5) {
                    fieldX += horizontalSpacing;
                }
            }
            else if (i === 11) {
                isTop = false;
            }
            else {
                fieldX -= fieldWidth;
                if (i === 17) {
                    fieldX -= horizontalSpacing;
                }
            }
        }

        return fields;
    })();

    const centerBox = svg.create(
        'rect',
        {
            'x': width / 2 - horizontalSpacing / 2,
            'y': y,
            'width': horizontalSpacing,
            'height': height - marginBottom,
            'fill': 'black',
            'fill-opacity': .5,
        },
    );

    const backgroundBox = svg.create(
        'rect',
        {
            'x': x,
            'y': y,
            'width': width,
            'height': height - marginBottom,
            'stroke': '#685954',
            'stroke-width': 2,
            'fill': '#BEA192',
        }
    );

    const diceStats = svg.create(
        'text',
        {
            'x': 0,
            'y': 10,
            'font-family': 'Verdana',
            'font-size': '10',
        }
    );

    const currentActionStats = svg.create(
        'text',
        {
            'x': width / 2 + horizontalSpacing / 2,
            'y': 10,
            'font-family': 'Verdana',
            'font-size': 10,
        }
    );

    const setCurrentActionStats = (ofCurrentPlayerColor, toActionText) => {
        svg.setText(
            currentActionStats,
            ofCurrentPlayerColor + ': ' + toActionText
        );
    };

    let onRollBtnClick;

    const api = Object.freeze({
        listen: (toGame) => {
            toGame.addEventListeners(api, [
                'onStart',
                'onRollDice',
                'onDiceRolled',
                'onSelectStone',
                'onSelectTarget',
            ]);
            fields.forEach(field => { field.listen(toGame) });
        },
        onStart: (game, stones) => {
            svg.append(backgroundBox);
            svg.append(centerBox);
            svg.append(diceStats);
            svg.append(currentActionStats);
        },
        onRollDice: (game) => {
            setCurrentActionStats(game.currentPlayerColor(), 'Roll the dice!');

            svg.setText(diceStats, 'roll');

            onRollBtnClick = (clickEvent) => { game.rollDice(); };
            diceStats.addEventListener('click', onRollBtnClick);
        },
        onDiceRolled: (game, result) => {
            diceStats.removeEventListener('click', onRollBtnClick);

            svg.setText(diceStats, result[0] + ' ' + result[1]);
        },
        onSelectStone: (game, selectedStoneData) => {
            setCurrentActionStats(game.currentPlayerColor(), 'Select a Stone!');
        },
        onSelectTarget: function(game, selectedStoneData) {
            setCurrentActionStats(selectedStoneData.color, 'Select a Target!');
        },
        toString: () => 'Board',
    });

    return api;
};
