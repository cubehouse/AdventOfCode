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

    // part 2
    const removePaper = () => {
        const removed = [];
        W.forEach((x, y) => {
            if (W.getKey(x, y, 'val') === '@' && canPushPaper(x, y)) {
                W.setPixel(x, y, Colour.white);
                removed.push([x, y]);
            }
        });
        return removed;
    };

    let paperRemoved = 0;
    while (true) {
        const removedThisRound = removePaper();
        if (removedThisRound.length === 0) {
            break;
        }
        paperRemoved += removedThisRound.length;
        // unset val for removed pixels
        for (const [x, y] of removedThisRound) {
            W.setKey(x, y, 'val', '.');
        }
        W.render();
        await new Promise((res) => setTimeout(res, 10));
    }

    await Advent.Submit(paperRemoved, 2);
}
Run();
