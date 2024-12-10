import { Advent as AdventLib } from '../lib/advent.js';
import Colour from '../lib/colour.js';
const Advent = new AdventLib(10, 2024);

// UI library
import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput(`..90..9
...1.98
...2..7
6543456
765.987
876....
987....`);

    const W = new Window();
    const getPixelColour = (val) => {
        return Colour.colourLerp(Colour.red, Colour.green, val / 9);
    };

    input.forEach((line, y) => {
        line.split('').forEach((val, x) => {
            if (val === '.') {
                W.setPixel(x, y, Colour.black);
                return;
            }
            W.setKey(x, y, 'heightCol', getPixelColour(Number(val)));
            W.setPixel(x, y, W.getKey(x, y, 'heightCol'));
            W.setKey(x, y, 'height', Number(val));
        });
    });

    const findTrails = async (x, y, heightDiffer = null) => {
        W.forEach((x, y, cell) => {
            const col = W.getKey(x, y, 'heightCol');
            if (col) {
                W.setPixel(x, y, col);
            }
        });

        const todo = [{ x, y, depth: 0, path: [{ x, y }] }];
        const dirs = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 }
        ];

        if (heightDiffer === null) {
            heightDiffer = (a, b) => {
                return Math.abs(a - b) <= 1;
            }
        }

        const trails = [];

        const step = (x1, y1, depth, path) => {
            if (x1 < 0 || y1 < 0 || x1 >= input[0].length || y1 >= input.length) {
                return;
            }

            const currentHeight = W.getKey(x1, y1, 'height');

            if (currentHeight === 9) {
                trails.push([...path]);
                return;
            }

            for (const dir of dirs) {
                const nextX = x1 + dir.x;
                const nextY = y1 + dir.y;

                if (path.find((p) => p.x === nextX && p.y === nextY)) {
                    // already visited here
                    continue;
                }

                const nextHeight = W.getKey(nextX, nextY, 'height');
                if (nextHeight === undefined) {
                    continue;
                }

                if (!heightDiffer(currentHeight, nextHeight)) {
                    continue;
                }

                todo.push({ x: nextX, y: nextY, depth, path: [...path, { x: nextX, y: nextY }] });

                W.setPixel(nextX, nextY, Colour.blue);
            }
        };

        while (todo.length > 0) {
            const current = todo.shift();
            step(current.x, current.y, current.depth + 1, current.path);
            await new Promise((resolve) => setTimeout(resolve, 0));
        }

        return trails;
    };

    const startPos = [];
    W.forEach((x, y, cell) => {
        if (cell.height === 0) {
            startPos.push({
                x: cell.x,
                y: cell.y
            });
        }
    });

    const trails = [];
    const scores = [];
    const trailsByStart = [];
    for (const pos of startPos) {
        const t = await findTrails(pos.x, pos.y, (a, b) => {
            return b - a === 1;
        });
        scores.push(t.reduce((acc, trail) => {
            const end = trail[trail.length - 1];
            if (acc.find((a) => a.x === end.x && a.y === end.y)) {
                return acc;
            }
            return [...acc, end];
        }, []).length);
        trails.push(...t);
        trailsByStart.push(t.length);
    }

    // submit answers
    await Advent.Submit(scores.reduce((acc, p) => acc + p, 0), 1);

    const ans2 = trailsByStart.reduce((acc, p) => acc + p, 0);
    await Advent.Submit(ans2, 2);

    // animate each trail
    const drawTrail = async (trail) => {
        W.forEach((x, y, cell) => {
            const col = W.getKey(x, y, 'heightCol');
            if (col) {
                W.setPixel(x, y, col);
            }
        });

        for (const pos of trail) {
            W.setPixel(pos.x, pos.y, Colour.blue);
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    };
    for (const trail of trails) {
        // await drawTrail(trail);
    }
}
Run();
