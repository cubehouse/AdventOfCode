import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(20, 2024);

// UI library
import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput(`###############
#...#...#.....#
#.#.#.#.#.###.#
#S#...#.#.#...#
#######.#.#.###
#######.#.#...#
#######.#.###.#
###..E#...#...#
###.#######.###
#...###...#...#
#.#####.#.###.#
#.#...#.#.#...#
#.#.#.#.#.#.###
#...#...#...###
###############`);

    const W = new Window();

    // parse input
    const startPos = { x: -1, y: -1 };
    const endPos = { x: -1, y: -1 };
    input.forEach((line, y) => {
        line.split('').forEach((char, x) => {
            if (char == 'S') {
                startPos.x = x;
                startPos.y = y;
            } else if (char == 'E') {
                endPos.x = x;
                endPos.y = y;
            } else if (char == '#') {
                // wall
                W.setKey(x, y, 'wall', true);
                W.setPixel(x, y, Window.orange);
            }
        });
    });

    const pathFind = async (cheats = 0, maximumPathLen = null) => {
        const validPaths = [];

        const todo = [];
        todo.push({ x: startPos.x, y: startPos.y, path: [], cheats_left: cheats });

        const pushToTodoList = (x, y, current, cheat = false) => {
            // early out if we have exceeded the maximum path length
            if (maximumPathLen && current.path.length >= maximumPathLen) {
                return;
            }

            // check if we've been here before in our path
            let found = false;
            for (const path of current.path) {
                if (path.x == x && path.y == y) {
                    found = true;
                    break;
                }
            }
            if (found) {
                return;
            }

            todo.push({
                x: x,
                y: y,
                path: [
                    ...current.path,
                    { x: current.x, y: current.y, cheat, cheats_left: current.cheats_left }
                ],
                cheats_left: current.cheats_left + (cheat ? -1 : 0)
            });
        }

        while (todo.length > 0) {
            const current = todo.shift();

            if (current.x == endPos.x && current.y == endPos.y) {
                // found it
                validPaths.push({
                    ...current,
                    pathLength: current.path.length,
                });

                continue;
            }

            // if we run out of cheats, we can use existing distances to the end to calculate the total path length
            if (current.cheats_left == 0) {
                // if we're out of cheats... check if we know the distance to the end
                const distanceToEnd = W.getKey(current.x, current.y, 'distanceFromEnd');
                // we can't cheat, so we know how far we have to go
                if (distanceToEnd !== undefined)
                {
                    const totalDistance = current.path.length + distanceToEnd - 1;
                    if (maximumPathLen && totalDistance < maximumPathLen) {
                        // we have found a shorter path than the maximum path length, so we can stop here
                        validPaths.push({
                            ...current,
                            pathLength: totalDistance,
                        });
                    }

                    continue;
                }
            }

            // check if we're on a wall, we need to subtract another cheat point if we are
            const currentlyOnWall = W.getKey(current.x, current.y, 'wall');
            if (currentlyOnWall) {
                if (current.cheats_left == 0) {
                    // can't go here, run out of cheats
                    continue;
                }
                else {
                    // remove a cheat point, as we need the wall gone for this step
                    current.cheats_left--;
                }
            }

            // check neighbors
            const neighbors = [
                { x: current.x - 1, y: current.y },
                { x: current.x + 1, y: current.y },
                { x: current.x, y: current.y - 1 },
                { x: current.x, y: current.y + 1 }
            ];
            for (const neighbor of neighbors) {
                if (neighbor.x < 0 || neighbor.x > W.grid.maxX || neighbor.y < 0 || neighbor.y > W.grid.maxY) {
                    // out of bounds
                    continue;
                }

                if (W.getKey(neighbor.x, neighbor.y, 'wall')) {
                    if (current.cheats_left > 1) { // need at least 2 cheats to get through a wall
                        // we can cheat, take one cheat away and continue
                        pushToTodoList(neighbor.x, neighbor.y, current, true);
                    }
                    continue;
                }

                pushToTodoList(neighbor.x, neighbor.y, current, false);
            }
        }

        return validPaths;
    };

    const shortestPaths = await pathFind(0);
    const fastestTime = shortestPaths.reduce((acc, path) => {
        return Math.min(acc, path.path.length);
    }, shortestPaths[0].path.length);

    // write the shortest path to the grid
    shortestPaths[0].path.forEach((path, idx) => {
        W.setPixel(path.x, path.y, Window.blue);
        W.setKey(path.x, path.y, 'distanceFromStart', idx);
        W.setKey(path.x, path.y, 'distanceFromEnd', shortestPaths[0].path.length - idx);
    });

    const paths = await pathFind(2, fastestTime);
    const pathLengthRequired = fastestTime - (Advent.SampleMode ? 19 : 100);
    const ans1 = paths.filter((x) => {
        return x.pathLength < pathLengthRequired;
    }).length;

    Advent.Assert(ans1, 5);
    await Advent.Submit(ans1);
    // await Advent.Submit(null, 2);
}
Run();
