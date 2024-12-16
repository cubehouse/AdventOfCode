import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(16, 2024);

// UI library
import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput(`#################
#...#...#...#..E#
#.#.#.#.#.#.#.#.#
#.#.#.#...#...#.#
#.#.#.#.###.#.#.#
#...#.#.#.....#.#
#.#.#.#.#.#####.#
#.#...#.#.#.....#
#.#.#####.#.###.#
#.#.#.......#...#
#.#.###.#####.###
#.#.#...#.....#.#
#.#.#.#####.###.#
#.#.#.........#.#
#.#.#.#########.#
#S#.............#
#################`);

    const W = new Window({
        size: 400,
    });
    W.applyASCIIMap(0, 0, input, {
        '#': { ...Window.black, wall: true, val: '#' },
        '.': { ...Window.white, wall: false, val: '.' },
        'S': { ...Window.green, wall: false, val: 'S' },
        'E': { ...Window.red, wall: false, val: 'E' },
    });

    const start = {
        ...W.find('S'),
        direction: { x: 1, y: 0 },
    };
    const end = W.find('E');

    const drawPath = (path) => {
        // reset any previous path
        W.forEach((x, y, cell) => {
            W.setPixel(x, y, cell.wall ? Window.black : Window.white);
        });

        path.forEach((step) => {
            W.setPixel(step.x, step.y, Window.blue);
        });

        W.setPixel(start.x, start.y, Window.green);
        W.setPixel(end.x, end.y, Window.red);
    };

    const astarMaze = async (start, end) => {
        const todo = [];
        const validPaths = [];

        const visited = {};

        const tryAddTodo = (x, y, direction, cost, path) => {
            const key = `${x},${y},${direction.x},${direction.y}`;

            // check if we've already been here in our path
            if (path.findIndex((x) => x.key === key) >= 0) {
                return;
            }

            // check if we have a better path to this cell in our todo list
            const existing = todo.find((x) => x.key === key);
            if (existing && existing.cost < cost) {
                return;
            }

            // check if we have a better path to this cell in our visited list
            if (visited[key] && visited[key] < cost) {
                return;
            }

            const newEntry = {
                key,
                x,
                y,
                direction,
                cost,
                path,
            };

            todo.push(newEntry);
            visited[key] = cost;
        };

        // add initial todos
        tryAddTodo(start.x, start.y, start.direction, 0, []);
        tryAddTodo(start.x, start.y - 1, start.direction, 0, []);
        tryAddTodo(start.x, start.y + 1, start.direction, 0, []);

        let counter = 0;
        let bestScore = 9999999999999;

        while (todo.length > 0) {
            const current = todo.shift();

            if (current.cost > bestScore) {
                continue;
            }

            // we made it, record and end this run
            if (current.x === end.x && current.y === end.y) {
                validPaths.push(current);
                bestScore = Math.min(bestScore, current.cost);
                continue;
            }

            const currentCell = W.get(current.x, current.y);
            // hit a wall, bail
            if (!currentCell || currentCell.wall) {
                continue;
            }

            // move forward
            tryAddTodo(
                current.x + current.direction.x,
                current.y + current.direction.y,
                current.direction,
                current.cost + 1,
                [...current.path, current]
            );

            // turn left
            const left = {
                x: -current.direction.y,
                y: current.direction.x,
            };
            tryAddTodo(
                current.x + left.x,
                current.y + left.y,
                left,
                current.cost + 1001,
                [...current.path, current]
            );

            // turn right
            const right = {
                x: current.direction.y,
                y: -current.direction.x,
            };
            tryAddTodo(
                current.x + right.x,
                current.y + right.y,
                right,
                current.cost + 1001,
                [...current.path, current]
            );

            // sort by cost
            todo.sort((a, b) => a.cost - b.cost);

            counter++;
            if (counter % 25 === 0) {
                drawPath(current.path);
                await new Promise((resolve) => setTimeout(resolve, 0));
            }
        }

        // sort by cost
        validPaths.sort((a, b) => a.cost - b.cost);

        return validPaths;
    };
    const paths = await astarMaze(start, end);
    const ans1 = paths[0].cost;
    await Advent.Submit(ans1);

    // draw all our paths
    paths.forEach((path) => {
        if (path.cost !== ans1) {
            return;
        }
        path.path.forEach((step) => {
            W.setPixel(step.x, step.y, Window.orange);
            W.setKey(step.x, step.y, 'path', true);
        });
    });
    W.setKey(start.x, start.y, 'path', true);
    W.setKey(end.x, end.y, 'path', true);
    const ans2 = W.reduce((acc, x, y, cell) => {
        if (cell.path) {
            return acc + 1;
        }
        return acc;
    }, 0);
    await Advent.Submit(ans2, 2);
}
Run();
