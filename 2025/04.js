import { Advent as AdventLib } from '../lib/advent.js';
import Colour from '../lib/colour.js';
const Advent = new AdventLib(4, 2025);

// UI library
import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const W = new Window({
        screenWidth: input[0].length,
        screenHeight: input.length,
    });

    W.applyASCIIMap(0, 0, input, {
        '.': {
            ...Colour.white,
        },
        '@': {
            ...Colour.red,
            val: '@',
        },
    });
    W.loop();

    const neighbours = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
    ];
    const canPushPaper = (x, y) => {
        let neighboursWithPaper = 0;
        for (const [dx, dy] of neighbours) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= W.screenWidth || ny < 0 || ny >= W.screenHeight) {
                continue;
            }
            const nChar = W.getKey(nx, ny, 'val');
            if (nChar === '@') {
                neighboursWithPaper++;
            }
        }
        return neighboursWithPaper < 4;
    };

    let pushableCount = 0;
    W.forEach((x, y) => {
        if (W.getKey(x, y, 'val') === '@' && canPushPaper(x, y)) {
            W.setPixel(x, y, Colour.green);
            pushableCount++;
        }
    });
    await Advent.Submit(pushableCount, 1);

    // const part2 = 0;
    // console.log('Part 2:', part2);

    // await Advent.Submit(null);
    // await Advent.Submit(null, 2);
}
Run();
