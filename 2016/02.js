import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(2, 2016);

// UI library
//import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const moves = {
        U: [-1, 0],
        D: [1, 0],
        L: [0, -1],
        R: [0, 1],
    };

    const keypad = [
        '1', '2', '3',
        '4', '5', '6',
        '7', '8', '9',
    ];

    const typeOnPad = (pad, padSize, startX, startY) => {
        const pos = [startX, startY];
        const code = [];

        input.forEach((line) => {
            line.split('').forEach((dir) => {
                const newPos = [pos[0] + moves[dir][0], pos[1] + moves[dir][1]];

                if (newPos[0] < 0 || newPos[0] >= padSize || newPos[1] < 0 || newPos[1] >= padSize) {
                    return;
                }

                const index = (newPos[0] * padSize) + newPos[1];
                if (pad[index] === ' ') {
                    return;
                }
                
                pos[0] = newPos[0];
                pos[1] = newPos[1];
            });

            code.push(pad[(pos[0] * padSize) + pos[1]]);
        });

        return code.join('');
    };


    const ans1 = typeOnPad(keypad, 3, 1, 1);
    await Advent.Submit(ans1, 1);

    const keypad2 = [
        ' ', ' ', '1', ' ', ' ',
        ' ', '2', '3', '4', ' ',
        '5', '6', '7', '8', '9',
        ' ', 'A', 'B', 'C', ' ',
        ' ', ' ', 'D', ' ', ' ',
    ];
    const ans2 = typeOnPad(keypad2, 5, 0, 2);
    await Advent.Submit(ans2, 2);
}
Run();
