import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(1, 2016);

// UI library
import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();
    //const input = `R8, R4, R4, R8`;

    const moves = input.split(', ').map((x) => {
        return { dir: x[0], distance: parseInt(x.slice(1)) };
    });

    const W = new Window({
        width: 500,
        height: 500,
        offsetX: 250,
        offsetY: 250,
    });

    let x = 0, y = 0, dir = 0;

    let visitedTwice = null;

    const drawCells = async (dimension, from, to) => {
        const x1 = dimension === 'x' ? from : x;
        const y1 = dimension === 'y' ? from : y;
        const x2 = dimension === 'x' ? to : x;
        const y2 = dimension === 'y' ? to : y;

        let first = true;
        await W.drawLine(x1, y1, x2, y2, async (a, b) => {
            let colour = Window.white;
            if (!first && W.getKey(a, b, 'visited')) {
                if (!visitedTwice) {
                    visitedTwice = Math.abs(a) + Math.abs(b);
                }

                colour = Window.red;
            }
            first = false;

            if (a == 0 && b == 0) {
                colour = Window.green;
            }

            W.setPixel(a, b, colour);
            W.setKey(a, b, 'visited', true);
            await W.sleep(0);
        });
    };


    for (const move of moves) {
        if (move.dir === 'L') {
            dir -= 90;
        } else {
            dir += 90;
        }

        dir = (dir + 360) % 360;

        const originalX = x;
        const originalY = y;

        switch (dir) {
            case 0:
                y += move.distance;
                break;
            case 90:
                x += move.distance;
                break;
            case 180:
                y -= move.distance;
                break;
            case 270:
                x -= move.distance;
                break;
        }

        const movingInX = originalX !== x;
        if (movingInX) {
            await drawCells('x', originalX, x);
        } else {
            await drawCells('y', originalY, y);
        }
    }

    const distance = Math.abs(x) + Math.abs(y);
    await Advent.Submit(distance);

    if (visitedTwice) {
        await Advent.Submit(visitedTwice, 2);
    }

    W.stop();
}
Run();
