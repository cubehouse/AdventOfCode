import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(14, 2022);

// UI library
import Window from '../lib/window.js';

const pause = async (multiplier = 1) => {
    return new Promise(resolve => setTimeout(resolve, 1 * multiplier));
};

async function Run() {
    const input = await Advent.GetInput();

    const paths = [];
    for (const line of input) {
        const lines = line.split(' -> ');
        const path = [];
        for (const point of lines) {
            const [x, y] = point.split(',');
            path.push([parseInt(x), parseInt(y)]);
        }
        paths.push(path);
    }
    // console.log(paths);

    const minX = Math.min(...paths.map(path => Math.min(...path.map(point => point[0])))) - 160;
    const maxX = Math.max(...paths.map(path => Math.max(...path.map(point => point[0])))) + 140;
    const maxY = Math.max(...paths.map(path => Math.max(...path.map(point => point[1]))));

    const windowWidth = maxX - minX + 3;
    const windowHeight = maxY + 3;

    const W = new Window({
        width: windowWidth,
        height: windowHeight,
        resetColour: Window.black,
    });
    W.loop();
    await pause();

    // draw all our paths
    for (const path of paths) {
        for (let i = 0; i < path.length - 1; i++) {
            const [x1, y1] = path[i];
            const [x2, y2] = path[i + 1];

            W.drawLine(x1 - minX + 1, y1, x2 - minX + 1, y2, (x, y) => {
                W.setPixel(x, y, Window.red);
                W.setKey(x, y, 'wall', true);
            });
        }
        await pause();
    }

    const trace = async (x, y) => {
        // draw downwards
        for (let y2 = y; y2 < windowHeight; y2++) {
            if (W.getKey(x, y2, 'wall')) {
                return { x: x, y: y2 - 1 };
            }
        }
        // hit nothing, return null
        return null;
    };

    const createSand = async () => {
        // sand starts at 500, 0
        let x = 500 - minX + 1;
        let y = 0;

        while (y < windowHeight) {
            // move down
            const traceResult = await trace(x, y);
            if (traceResult) {
                // hit something, move to it
                x = traceResult.x;
                y = traceResult.y;

                // check space one down and to the left
                if (W.getKey(x - 1, y + 1, 'wall')) {
                    // space is taken!
                    //  try to move right
                    if (W.getKey(x + 1, y + 1, 'wall')) {
                        // space also taken!
                        //  come to rest here
                        W.setPixel(x, y, Window.yellow);
                        W.setKey(x, y, 'sand', true);
                        // sand at rest is a wall
                        W.setKey(x, y, 'wall', true);

                        return { x, y };
                    } else {
                        // space is free, move there
                        x++;
                        y++;
                        // let the while loop do the rest and start again
                    }
                } else {
                    // space is free, move there
                    x--;
                    y++;
                    // let the while loop do the rest and start again
                }
            } else {
                // hit nothing, we're falling into the abyss
                return null;
            }
        }
    }

    // keep dropping sand until it falls off the map
    let sand = null;
    let sandCount = 0;
    do {
        sand = await createSand();
        if (sand) {
            sandCount++;
        }
        // await pause();
    } while (sand);

    await Advent.Submit(sandCount);

    //await W.stop();
    // part 1
    // reset everything
    W.forEach((cell) => {
        // clear all our sand
        if (cell.sand) {
            W.setPixel(cell.x, cell.y, Window.black);
            W.setKey(cell.x, cell.y, 'sand', false);
            W.setKey(cell.x, cell.y, 'wall', false);
        }
    });
    await pause();
    W.drawLine(0, windowHeight - 1, windowWidth, windowHeight - 1, (x, y) => {
        W.setPixel(x, y, Window.red);
        W.setKey(x, y, 'wall', true);
    });
    await pause();
    sand = null;
    sandCount = 0;
    do {
        sand = await createSand();
        if (sand) {
            sandCount++;
        }
        if (sandCount % 10 === 0) {
            await pause();
        }
    } while (sand && sand.y !== 0);

    await Advent.Submit(sandCount, 2);

    await W.stop();
}
Run();
