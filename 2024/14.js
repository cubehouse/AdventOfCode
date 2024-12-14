import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(14, 2024);

// UI library
import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput(`p=0,4 v=3,-3
p=6,3 v=-1,-3
p=10,3 v=-1,2
p=2,0 v=2,-1
p=0,0 v=1,3
p=3,0 v=-2,-2
p=7,6 v=-1,-3
p=3,0 v=-1,-2
p=9,3 v=2,3
p=7,3 v=-1,2
p=2,4 v=2,-3
p=9,5 v=-3,-3`);

    const W = new Window({
        size: 400,
    });

    const spaceWidth = Advent.SampleMode ? 11 : 101;
    const spaceHeight = Advent.SampleMode ? 7 : 103;

    const halfWidth = (spaceWidth - 1) / 2;
    const halfHeight = (spaceHeight - 1) / 2;

    for (let y = 0; y < spaceHeight; y++) {
        for (let x = 0; x < spaceWidth; x++) {
            W.setPixel(x, y, Window.black);
            W.setKey(x, y, 'bots', 0);
        }
    }
    const bots = input.map((line) => {
        const match = line.match(/-?\d+/g).map(Number);
        const bot = {
            x: match[0],
            y: match[1],
            vx: match[2],
            vy: match[3]
        };

        W.setKey(bot.x, bot.y, 'bots', W.get(bot.x, bot.y).bots + 1);

        return bot;
    });

    const redraw = () => {
        W.forEach((x, y, cell) => {
            if (cell.bots > 0) {
                W.setPixel(x, y, Window.white);
            } else {
                W.setPixel(x, y, Window.black);
            }
        });

        // draw red lines over quad boundaries
        for (let x = 0; x < spaceWidth; x++) {
            W.setPixel(x, halfHeight, Window.red);
        }
        for (let y = 0; y < spaceHeight; y++) {
            W.setPixel(halfWidth, y, Window.red);
        }
    };

    redraw();

    const tickBot = (bot, seconds = 1) => {
        const origCell = W.get(bot.x, bot.y);
        origCell.bots = origCell.bots - 1;

        // move and wrap around
        bot.x = (((bot.x + (bot.vx * seconds)) % spaceWidth) + spaceWidth) % spaceWidth;
        bot.y = (((bot.y + (bot.vy * seconds)) % spaceHeight) + spaceHeight) % spaceHeight;

        const newCell = W.get(bot.x, bot.y);
        newCell.bots = newCell.bots + 1;
    };
    const ticksBots = (seconds = 1) => {
        bots.forEach((bot) => {
            tickBot(bot, seconds);
        });
    };

    ticksBots(100);
    redraw();

    const quads = [0, 0, 0, 0];
    bots.forEach((bot) => {
        if (bot.x < halfWidth && bot.y < halfHeight) {
            quads[0]++;
        }
        else if (bot.x > halfWidth && bot.y < halfHeight) {
            quads[1]++;
        }
        else if (bot.x < halfWidth && bot.y > halfHeight) {
            quads[2]++;
        }
        else if (bot.x > halfWidth && bot.y > halfHeight) {
            quads[3]++;
        }
    });

    const ans1 = quads.reduce((acc, p) => acc * p, 1);
    Advent.Assert(ans1, 12);
    await Advent.Submit(ans1);

    let seconds = 100;
    let foundTree = false;
    while (!foundTree) {
        ticksBots(1);
        seconds++;

        // look for a column of at least 10 bots in a vertical line
        W.forEach((x, y, cell) => {
            if (cell.bots > 0) {
                let foundEmptyCell = false;
                for (let i = 1; i < 10; i++) {
                    const botCount = W.getKey(x, y + i, 'bots');
                    if (!botCount || botCount == 0) {
                        foundEmptyCell = true;
                        break;
                    }
                }
                if (!foundEmptyCell) {
                    foundTree = true;
                }
            }
        });

        redraw();
        await new Promise((resolve) => setTimeout(resolve, 0));

        if (foundTree) {
            await Advent.Submit(seconds, 2);
            break;
        }
    }
}
Run();
