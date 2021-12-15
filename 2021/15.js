import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(15, 2021);

import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();
    const input2 = `1163751742
1381373672
2136511328
3694931569
7463417111
1319128137
1359912421
3125421639
1293138521
2311944581`.split(/\n/);

    const W = new Window({ width: input[0].length, height: input.length });
    const colours = new Array(10).fill(0).reduce((acc, _, x) => {
        acc[`${x}`] = {
            ...Window.colourLerp(Window.black, Window.grey, x / 10),
            risk: x,
        };
        return acc;
    }, {});
    W.applyASCIIMap(0, 0, input, colours);
    W.loop();

    const findPath = async () => {
        const visited = { '0,0': 0 };
        const dirs = [
            { x: 0, y: -1 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
        ];
        const target = { x: W.width - 1, y: W.height - 1 };
        const todo = [{ x: 0, y: 0, risk: 0, path: [] }];

        while (todo.length > 0) {
            const next = todo.shift();
            if (next.x === target.x && next.y === target.y) {
                return next.path;
            }
            const cellKey = `${next.x},${next.y}`;
            if (visited[cellKey] && visited[cellKey] <= next.risk) {
                continue;
            }
            visited[cellKey] = next.risk;
            for (const dir of dirs) {
                const nextX = next.x + dir.x;
                const nextY = next.y + dir.y;
                if (nextX < 0 || nextX >= W.width || nextY < 0 || nextY >= W.height) {
                    continue;
                }
                const nextKey = `${nextX},${nextY}`;
                const newDirRisk = next.risk + W.getKey(nextX, nextY, 'risk');
                if (visited[nextKey] && visited[nextKey] <= newDirRisk) {
                    continue;
                }
                todo.push({
                    x: nextX,
                    y: nextY,
                    risk: newDirRisk,
                    path: [...next.path, {
                        x: nextX,
                        y: nextY,
                        risk: newDirRisk,
                    }],
                });
            }

            todo.sort((a, b) => a.risk - b.risk);
        }
        return [];
    };
    const path = await findPath();

    for (let i = 0; i < path.length; i++) {
        const cell = path[i];
        W.setPixel(cell.x, cell.y, Window.colourLerp(Window.red, Window.green, i / path.length));
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    const ans1 = path[path.length - 1].risk;
    await Advent.Submit(ans1);

    // await Advent.Submit(null, 2);
}
Run();
