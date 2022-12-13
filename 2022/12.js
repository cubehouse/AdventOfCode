import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(12, 2022);

// UI library
import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    // parse input
    const mazeWidth = input[0].length;
    const mazeHeight = input.length;
    const W = new Window({ width: mazeWidth, height: mazeHeight });

    const aHeight = 'a'.charCodeAt(0);
    const start = [];
    const end = [];
    input.forEach((line, y) => {
        line.split('').forEach((char, x) => {
            if (char === 'S') {
                start.push(x, y);
            }
            else if (char === 'E') {
                end.push(x, y);
            }
            const actualChar = char === 'S' ? 'a' : char === 'E' ? 'z' : char;
            const height = actualChar.charCodeAt(0) - aHeight;
            W.setKey(x, y, 'height', height);
            W.setPixel(x, y, Window.colourLerp(Window.green, Window.red, height / 25));
        });
    });
    W.loop();

    const possibleNeighbours = [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
    ];
    const getNeighbours = (node) => {
        const neighbours = possibleNeighbours.map((offset) => {
            return {
                x: node.x + offset[0],
                y: node.y + offset[1],
            };
        }).filter((x) => {
            // check bounds
            if (x.x < 0 || x.y < 0 || x.x >= mazeWidth || x.y >= mazeHeight) return false;
            // check height
            const newHeight = W.getKey(x.x, x.y, 'height');
            const oldHeight = W.getKey(node.x, node.y, 'height');

            if (newHeight <= (oldHeight + 1)) {
                return true;
            }
            return false;
        });
        return neighbours;
    };

    await new Promise((resolve) => setTimeout(resolve, 1));

    const astar1 = async (startingSpace) => {
        const queue = [];

        const startNode = {
            x: startingSpace[0],
            y: startingSpace[1],
        };
        const endNode = {
            x: end[0],
            y: end[1],
        };

        queue.push({
            ...startNode,
            depth: 0,
            route: [
                {
                    ...startNode,
                }
            ],
        });

        const visited = {};

        while (queue.length > 0) {
            const node = queue.shift();

            if (node.x === endNode.x && node.y === endNode.y) {
                return node.route;
            }

            const neighbours = getNeighbours(node);
            neighbours.forEach((neighbour) => {
                const existingQueueEntry = queue.find((x) => x.x === neighbour.x && x.y === neighbour.y);
                if (existingQueueEntry) {
                    // check if this is a better route
                    if (existingQueueEntry.depth > node.depth + 1) {
                        // our new route is better, so remove the old one
                        queue.splice(queue.indexOf(existingQueueEntry), 1);
                    } else {
                        // otherwise, skip this neighbour
                        return;
                    }
                }

                const visitedData = visited[`${neighbour.x},${neighbour.y}`] || { depth: 999 };

                if (node.depth < visitedData.depth) {
                    visited[`${neighbour.x},${neighbour.y}`] = {
                        depth: node.depth + 1,
                    };

                    queue.push({
                        ...neighbour,
                        depth: node.depth + 1,
                        route: [
                            ...node.route,
                            {
                                ...neighbour,
                            }
                        ],
                    });
                }
            });

            // sort queue by depth ascending
            queue.sort((a, b) => {
                return a.depth - b.depth;
            });
        }
    };

    const route = await astar1(start);

    let i = 0;
    for (const step of route) {
        W.setPixel(step.x, step.y, Window.colourLerp(Window.blue, Window.yellow, i / route.length));
        await new Promise((resolve) => setTimeout(resolve, 10));
        i++;
    }
    const steps = route.length - 1; // don't count start
    await W.stop();

    await Advent.Submit(steps);

    // part 2
    const spacesAtHeight0 = [];
    for (let y = 0; y < mazeHeight; y++) {
        for (let x = 0; x < mazeWidth; x++) {
            if (W.getKey(x, y, 'height') === 0) {
                spacesAtHeight0.push([x, y]);
            }
        }
    }

    const routes = [];
    for(const space of spacesAtHeight0) {
        const route = await astar1(space);
        if (route) {
            const steps = route.length - 1;
            routes.push(steps);
        }
    }
    const shortestPath = Math.min(...routes);

    await Advent.Submit(shortestPath, 2);
}
Run();
