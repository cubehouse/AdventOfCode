import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(15, 2024);

// UI library
import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput(`########
#..O.O.#
##@.O..#
#...O..#
#.#.O..#
#...O..#
#......#
########

<^^>>>vv<v>>v<<`);

    const input2Dir = {
        '^': { x: 0, y: -1 },
        'v': { x: 0, y: 1 },
        '<': { x: -1, y: 0 },
        '>': { x: 1, y: 0 },
    };

    const W = new Window({
        size: 400,
    });

    let parsingMoves = false;
    const moves = [];
    const boxes = [];
    const robot = {};
    input.forEach((line, y) => {
        if (line == '') {
            parsingMoves = true;
            return;
        }
        if (parsingMoves) {
            line.split('').forEach((move) => {
                moves.push(input2Dir[move]);
            });
            return;
        }

        line.split('').forEach((cell, x) => {
            W.setKey(x, y, 'wall', cell === '#');
            W.setPixel(x, y, cell === '#' ? Window.black : Window.white);

            if (cell === 'O') {
                boxes.push({ x, y });
            }
            if (cell === '@') {
                robot.x = x;
                robot.y = y;
            }
        });
    });

    const tryMove = (x, y, dx, dy) => {
        if (W.get(x + dx, y + dy).wall) {
            return false;
        }
        for (const box of boxes) {
            if (box.x === x + dx && box.y === y + dy) {
                if (!tryMove(box.x, box.y, dx, dy)) {
                    return false;
                }
                box.x += dx;
                box.y += dy;
            }
        }
        return true;
    };

    const redraw = () => {
        W.forEach((x, y, cell) => {
            if (cell.wall) {
                W.setPixel(x, y, Window.black);
            } else {
                W.setPixel(x, y, Window.white);
            }
        });

        W.setPixel(robot.x, robot.y, Window.green);
        for (const box of boxes) {
            W.setPixel(box.x, box.y, Window.blue);
        }
    };
    redraw();

    const tick = async () => {
        let counter = 0;
        for (const move of moves) {
            if (tryMove(robot.x, robot.y, move.x, move.y)) {
                robot.x += move.x;
                robot.y += move.y;
            }
            counter++;
            if (counter % 100 === 0) {
                redraw();
                await W.sleep(100);
            }
        }
    };
    await tick();
    redraw();

    const ans1 = boxes.reduce((acc, box) => {
        return acc + (box.x + (box.y * 100));
    }, 0);
    Advent.Assert(ans1, 10092);
    await Advent.Submit(ans1);
    // await Advent.Submit(null, 2);
}
Run();
