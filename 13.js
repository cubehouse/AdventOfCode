import {
    Advent as AdventLib
} from './lib/advent.js';
const Advent = new AdventLib(13, 2021);

import Window from './lib/window.js';

async function Run() {
    const input = await Advent.GetInput();
    const input2 = `6,10
0,14
9,10
0,3
10,4
4,11
6,0
6,12
4,1
0,13
10,12
3,4
3,0
8,4
1,10
2,14
8,10
9,0

fold along y=7
fold along x=5`.split(/\n/);

    const dots = input.map(line => {
        if (line.length > 0 && !line.startsWith("fold")) {
            const [x, y] = line.split(',').map(Number);
            return {
                x,
                y
            };
        }
    }).filter(Boolean);
    const folds = input.filter((x) => {
        return x.startsWith("fold");
    }).map((x) => {
        return /fold along (x|y)=(\d+)/.exec(x).slice(1);
    }).map((x) => {
        return {
            axis: x[0],
            value: Number(x[1])
        };
    });

    const W = new Window({
        width: Math.max(...dots.map(x => x.x)) + 1,
        height: Math.max(...dots.map(x => x.y)) + 1,
        pixelSize: 1,
    });
    W.loop();

    const drawDots = () => {
        dots.forEach(dot => {
            W.setPixel(dot.x, dot.y, Window.black);
        });
    };
    drawDots();

    const doFold = async (fold, speed = 100) => {
        const axis = fold.axis;
        const value = fold.value;

        if (axis == "x") {
            for (let i = 0; i < W.height; i++) {
                // mark out the fold line
                W.setPixel(value, i, Window.grey);
            }
        } else {
            for (let i = 0; i < W.width; i++) {
                W.setPixel(i, value, Window.grey);
            }
        }

        for (let dotIDX = 0; dotIDX < dots.length; dotIDX++) {
            const dot = dots[dotIDX];
            if (dot[axis] > value) {
                const origX = dot.x;
                const origY = dot.y;

                const newDot = {
                    x: dot.x,
                    y: dot.y
                };

                newDot[axis] = value - (dot[axis] - value);

                const dupeDot = dots.find(x => {
                    return x.x == newDot.x && x.y == newDot.y;
                });
                if (dupeDot) {
                    dots.splice(dotIDX, 1);
                    dotIDX--;
                } else {
                    dots[dotIDX] = newDot;
                }

                W.setPixel(origX, origY, Window.red);
                W.setPixel(newDot.x, newDot.y, Window.blue);

                await new Promise(r => setTimeout(r, speed));

                W.setPixel(origX, origY, Window.white);
                W.setPixel(newDot.x, newDot.y, Window.black);
            }
        }

        // remove duplicate dots from dots array
        dots.forEach((dot, i) => {
            const dupe = dots.find((x, j) => {
                return x.x == dot.x && x.y == dot.y && i != j;
            });
            if (dupe) {
                dots.splice(i, 1);
            }
        });

        // zoom in if our fold means we can fit inside our existing window
        const xSize = Math.round(W.width / (Math.max(...dots.map(x => x.x)) + 1));
        const ySize = Math.round(W.height / (Math.max(...dots.map(x => x.y)) + 1));
        const newPixelSize = Math.min(xSize, ySize);
        if (newPixelSize != W.pixelSize) {
            W.pixelSize = newPixelSize;
            W.resetPixels();
            drawDots();
        }
    }

    // remove first fold from array, so we can loop over the rest in part 2
    const firstFold = folds.shift();
    await doFold(firstFold, 0);

    await Advent.Submit(dots.length);

    // finish folding
    for (const fold of folds) {
        await doFold(fold, 0);
    }
    // ... read output and submit manually
    // await Advent.Submit(null, 2);
}
Run();