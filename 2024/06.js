import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(6, 2024);

// UI library
// import Window from '../lib/window.js';
import Screen from '../lib/screen.js';

let counter = 0;
const animSpeed = 10;
const anim = async () => {
    counter++;
    if (counter % animSpeed === 0) {
        return new Promise((resolve) => {
            setTimeout(resolve, 0);
        });
    }
};

const directions = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
];

async function Run() {
    const input = await Advent.GetInput(`....#.....
.........#
..........
..#.......
.......#..
..........
.#..^.....
........#.
#.........
......#...`);

    const S = new Screen();

    S.AddStyle(/(\#)/, '{green-fg}');

    let guardPos = null;
    let guardDir = 0; // index into directions
    input.forEach((line, y) => {
        line.split("").forEach((char, x) => {
            if (char === '^') {
                guardPos = { x, y };
                char = '.';
                S.SetKey(x, y, 'visited', true);
                S.SetKey(x, y, 'style', '{red-fg}');
            }
            S.Set(x, y, char);
        });
    });
    const guardPosOriginal = { ...guardPos };

    const guardStep = async () => {
        // trace in direction
        const dir = directions[guardDir];
        let hitEdge = false;
        const tracePath = S.Trace(guardPos.x, guardPos.y, dir[0], dir[1], (cell) => {
            if (!cell) {
                hitEdge = true;
                return false;
            }
            return cell?.val !== '#';
        });

        for (const { x, y } of tracePath) {
            S.SetKey(x, y, 'visitedP1', true);
            S.SetKey(x, y, 'visited', true);
            S.SetKey(x, y, 'style', '{red-fg}');
            await anim();
        }

        // rotate
        guardDir = (guardDir + 1) % directions.length;
        guardPos = tracePath[tracePath.length - 1];

        // return true if we left the area
        if (hitEdge) {
            return true;
        }
        return false;
    };

    while (true) {
        const leftArea = await guardStep();
        if (leftArea) {
            break;
        }
    }

    const ans1 = S.Cells.reduce((acc, cell) => {
        if (cell?.visited) {
            return acc + 1;
        }
        return acc;
    }, 0);

    Advent.Assert(ans1, 41);
    await Advent.Submit(ans1);

    const clearMaze = () => {
        // clear visited state
        S.ForEachCell((cell) => {
            cell.visited = undefined;
            S.SetKey(cell.x, cell.y, 'style', '{white-fg}');
        });
    };

    // attempt to cause a loop by placing on this cell
    const attempt = async (x, y) => {
        console.log(`Attempting ${x}, ${y}`);

        // if cell is already a wall, skip
        if (S.Get(x, y) === '#') {
            return false;
        }

        // if player never travelled here in P1, skip
        //  this is a fairly major optimisation in a terrible solution
        if (!S.GetKey(x, y, 'visitedP1')) {
            return false;
        }

        guardDir = 0;
        guardPos = { ...guardPosOriginal };

        // can't place wall on guard
        if (x === guardPos.x && y === guardPos.y) {
            return false;
        }

        S.Set(x, y, '#');

        clearMaze();

        let loop = false;

        const guardStepLookForLoop = async () => {
            // trace in direction
            const dir = directions[guardDir];
            let hitEdge = false;
            const tracePath = S.Trace(guardPos.x, guardPos.y, dir[0], dir[1], (cell) => {
                if (!cell) {
                    hitEdge = true;
                    return false;
                }
                return cell?.val !== '#';
            });

            for (const { x, y } of tracePath) {
                const visitedArr = S.GetKey(x, y, 'visited');
                if (visitedArr) {
                    // check if we have a loop
                    if (visitedArr.includes(dir)) {
                        loop = true;
                        return true;
                    } else {
                        S.SetKey(x, y, 'visited', [...visitedArr, dir]);
                    }
                } else {
                    S.SetKey(x, y, 'visited', [dir]);
                }
                S.SetKey(x, y, 'style', '{red-fg}');
            }

            // rotate
            guardDir = (guardDir + 1) % directions.length;
            guardPos = tracePath[tracePath.length - 1];

            // return true if we left the area
            if (hitEdge) {
                return true;
            }
            return false;
        };

        while (!loop) {
            const leftArea = await guardStepLookForLoop();
            if (leftArea) {
                break;
            }
        }

        await anim();

        // clear wall
        S.Set(x, y, '.');

        if (loop) {
            return true;
        }
    };

    let loops = 0;
    for(let y = 0; y <= S.maxY; y++) {
        for(let x = 0; x <= S.maxX; x++) {
            if (await attempt(x, y)) {
                loops++;
            }
        }
    }

    Advent.Assert(loops, 6);
    await Advent.Submit(loops, 2);
}
Run();
