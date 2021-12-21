import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(20, 2021);

import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();
    const input2 = `..#.#..#####.#.#.#.###.##.....###.##.#..###.####..#####..#....#..#..##..###..######.###...####..#..#####..##..#.#####...##.#.#..#.##..#.#......#.###.######.###.####...#.##.##..#..#..#####.....#.#....###..#.##......#.....#..#..#..##..#...##.######.####.####.#.#...#.......#..#.#.#...####.##.#......#..#...##.#.##..#...##.#.##..###.#......#.#.......#.#.#.####.###.##...#.....####.#..#..#.##.#....##..#.####....##...##..#...#......#.#.......#.......##..####..#...#.#.#...##..#.#..###..#####........#..####......#..#

#..#.
#....
##..#
..#..
..###`.split('\n');

    const gameoflife = '.......#...#.##....#.###.######....#.##..##.#....######.###.#......#.##..##.#....######.###.#....##.#...#.......###.#...#..........#.##..##.#....######.###.#....##.#...#.......###.#...#........##.#...#.......###.#...#.......#...............#..................#.##..##.#....######.###.#....##.#...#.......###.#...#........##.#...#.......###.#...#.......#...............#................##.#...#.......###.#...#.......#...............#...............#...............#...............................................';
    const algo = input[0];

    const lines = [];
    for (let i = 2; i < input.length; i++) {
        lines.push(input[i]);
    }

    const width = lines[0].length;
    const height = lines.length;

    const extend = 3;

    const W = new Window({
        width: width * extend,
        height: height * extend,
        resetColour: 'black',
    });
    // W.resetPixels();

    const transformPos = (x, y) => {
        return {
            x: (width * extend) / extend + x,
            y: (height * extend) / extend + y,
        };
    };

    lines.forEach((line, y) => {
        for (let x = 0; x < line.length; x++) {
            const p = transformPos(x, y);
            W.setPixel(p.x, p.y, line[x] === '.' ? Window.black : Window.orange);
            W.setKey(p.x, p.y, 'sym', line[x]);
        }
    });

    W.loop();

    let infiniteBoundsColour = '0';

    const step = async () => {
        const newPixels = [];
        for (let x = 0; x <= width * extend; x++) {
            for (let y = 0; y <= height * extend; y++) {
                const pixels = [];
                // get all 9 pixels around this position
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const symbol = W.getKey(x + j, y + i, 'sym');
                        if (symbol === undefined) {
                            pixels.push(infiniteBoundsColour);
                        } else {
                            pixels.push(symbol === '#' ? '1' : '0');
                        }
                    }
                }

                // convert from binary into decimal
                const idx = parseInt(pixels.join(''), 2);
                newPixels.push({
                    sym: algo[idx],
                    x,
                    y,
                });
            }
        }

        for (const pixel of newPixels) {
            W.setPixel(pixel.x, pixel.y, pixel.sym === '.' ? Window.black : Window.orange);
            W.setKey(pixel.x, pixel.y, 'sym', pixel.sym);
        }

        if (algo[0] === '#') {
            infiniteBoundsColour = infiniteBoundsColour === '0' ? '1' : '0';
        }

        await new Promise(resolve => setTimeout(resolve, 0));
    };

    await new Promise(resolve => setTimeout(resolve, 10));
    await step();
    await step();

    const ans1 = W.reduce((acc, p, x, y) => {
        if (p.sym === '#') {
            acc++;
        }
        return acc;
    }, 0);

    await Advent.Submit(ans1);

    for (let i = 0; i < 48; i++) {
        await step();
    }

    const ans2 = W.reduce((acc, p, x, y) => {
        if (p.sym === '#') {
            acc++;
        }
        return acc;
    }, 0);

    await Advent.Submit(ans2, 2);

    while (true) {
        await step();
    }
}
Run();
