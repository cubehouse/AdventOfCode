import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(17, 2021);

import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();
    const input2 = 'target area: x=20..30, y=-10..-5';

    const targetArea = input.match(/x=([\-\d]+)\.\.([\-\d]+), y=([\-\d]+)\.\.([\-\d]+)/);
    const [_, x1, x2, y1, y2] = targetArea.map(Number);

    const origin = { x: 0, y: -y2 * 2 };

    const xMin = 0;
    const xMax = Math.max(x2, x1);
    const yMin = Math.min(y1, y2);
    const yMax = 500;

    const areaWidth = (xMax - xMin + 1) + 100;
    const areaHeight = Math.abs(yMax - yMin) + 1;

    const W = new Window({
        width: areaWidth,
        height: areaHeight,
    });
    W.loop();

    // wrapper to offset our origin
    const wrapCoordinates = (x, y) => {
        return {
            x: x + origin.x,
            y: areaHeight - (y + origin.y),
        };
    };
    const setPixel = (x, y, c) => {
        const co = wrapCoordinates(x, y);
        W.setPixel(co.x, co.y, c);
    };

    setPixel(0, 0, Window.black);
    for (let i = xMin; i <= areaWidth; i++) {
        setPixel(i, 0, Window.black);
    }
    for (let i = yMin; i <= yMax; i++) {
        setPixel(0, i, Window.black);
    }

    for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
            setPixel(x, y, Window.grey);
        }
    }

    const isInArea = (x, y) => x >= x1 && x <= x2 && y >= y1 && y <= y2;

    const project = async (velX, velY, colour = Window.green) => {
        let x = 0;
        let y = 0;
        const points = [];
        while (y >= Math.min(y1, y2)) {
            x += velX;
            y += velY;

            points.push({ x, y });

            if (isInArea(x, y)) {
                setPixel(x, y, Window.red);
                return points;
            }
            setPixel(x, y, colour);

            velX = Math.max(0, velX - 1);
            velY -= 1;
        }

        return null;
    };

    // reverse triangle numbers to find range of valid x velicities needed to hit target area
    const minXVel = Math.ceil((Math.sqrt(8 * x1 + 1) - 1) / 2);
    const maxXVal = Math.max(x1, x2);
    console.log(`x velocity must be between ${minXVel} and ${maxXVal}`);

    let yM = 0;
    let validLaunches = 0;
    for (let x = minXVel; x <= maxXVal; x++) {
        // just try a bunch of y velocities, I've done enough math for 5 in the morning...
        for (let y = -1000; y < 1000; y++) {
            const points = await project(x, y);
            if (points !== null) {
                validLaunches++;
                yM = Math.max(Math.max(...points.map(p => p.y)), yM);
            }
        }
        await new Promise(r => setTimeout(r, 0));
    }

    await Advent.Submit(yM);

    // part 2

    console.log(validLaunches);
    await Advent.Submit(validLaunches, 2);
}
Run();
