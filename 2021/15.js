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

    const findPath = async (maze) => {
        const visited = { '0,0': 0 };
        const dirs = [
            { x: 0, y: -1 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
        ];
        const target = { x: maze.width - 1, y: maze.height - 1 };
        const todo = [{ x: 0, y: 0, risk: 0, path: [] }];

        let step = 0;

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
                if (nextX < 0 || nextX >= maze.width || nextY < 0 || nextY >= maze.height) {
                    continue;
                }
                const nextKey = `${nextX},${nextY}`;
                const newDirRisk = next.risk + maze.getKey(nextX, nextY, 'risk');
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

            step++;
            // yield occasionally so Windows doesn't think we've crashed
            if (step % 10000 === 0) {
                await new Promise((resolve) => setTimeout(resolve, 0));
            }
        }
        return [];
    };
    const path = await findPath(W);

    for (let i = 0; i < path.length; i++) {
        const cell = path[i];
        W.setPixel(cell.x, cell.y, Window.colourLerp(Window.red, Window.green, i / path.length));
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    const ans1 = path[path.length - 1].risk;
    await Advent.Submit(ans1);

    // W.stop();

    // part 2
    const W2 = new Window({
        width: input[0].length * 5, height: input.length * 5,
    });

    for (let x = 0; x < input[0].length; x++) {
        for (let y = 0; y < input.length; y++) {
            const risk = input[y][x];

            for (let xx = 0; xx < 5; xx++) {
                for (let yy = 0; yy < 5; yy++) {
                    const cell = {
                        x: xx * input[0].length + x,
                        y: yy * input.length + y,
                    };
                    let newRisk = (risk + xx + yy);
                    while (newRisk > 9) {
                        newRisk -= 9;
                    }
                    W2.setPixel(cell.x, cell.y, colours[newRisk]);
                    W2.setKey(cell.x, cell.y, 'risk', newRisk);
                }
            }
        }
    }

    W2.loop();

    console.log('Solving maze...');
    const path2 = await findPath(W2);
    console.log('Solved! Drawing route...');
    
    const ans2 = path2[path2.length - 1].risk;
    await Advent.Submit(ans2, 2);
    
    for (let i = 0; i < path2.length; i++) {
        const cell = path2[i];
        W2.setPixel(cell.x, cell.y, Window.colourLerp(Window.red, Window.green, i / path2.length));
        await new Promise(resolve => setTimeout(resolve, 5));
    }
}
Run();
