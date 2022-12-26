import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(18, 2022);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const cubes = input.map((x) => {
        return x.split(',').map(Number);
    });

    const gridExtents = cubes.reduce((acc, cube) => {
        const [x, y, z] = cube;
        acc[0] = Math.max(acc[0], x);
        acc[1] = Math.max(acc[1], y);
        acc[2] = Math.max(acc[2], z);
        return acc;
    }, [0, 0, 0]);

    const listNeighbors = (cube) => {
        const [x, y, z] = cube;
        return [
            [x, y, z + 1],
            [x, y, z - 1],
            [x, y + 1, z],
            [x, y - 1, z],
            [x + 1, y, z],
            [x - 1, y, z],
        ];
    };

    const map = cubes.reduce((acc, cube) => {
        const [x, y, z] = cube;
        acc[`${x},${y},${z}`] = cube;
        return acc;
    }, {});

    const part1 = async () => {
        const exposedSides = cubes.reduce((acc, cube) => {
            const neighbors = listNeighbors(cube);
            const exposedSides = neighbors.reduce((acc, neighbor) => {
                const [x, y, z] = neighbor;
                if (!map[`${x},${y},${z}`]) {
                    acc += 1;
                }
                return acc;
            }, 0);
            return acc + exposedSides;
        }, 0);
        return exposedSides;
    };

    const ans1 = await part1();
    await Advent.Submit(ans1);


    // await Advent.Submit(null, 2);
    const exposedCells = new Set();
    const floodFill = (cellIn) => {
        const [x, y, z] = cellIn;
        // check if this cell is solid
        if (map[`${x},${y},${z}`]) return;

        const queue = [cellIn];

        while (queue.length) {
            const cell = queue.shift();
            const [x, y, z] = cell;

            if (x < 0 || y < 0 || z < 0) continue;
            if (x >= gridExtents[0] || y >= gridExtents[1] || z >= gridExtents[2]) continue;

            const key = `${x},${y},${z}`;

            // check if this cell has already been visited
            if (exposedCells.has(key)) continue;

            // check if this cell is solid
            if (map[key]) continue;

            // mark this cell as visited
            //console.log('  exposing', cell);
            exposedCells.add(key);

            // add all neighbors to the queue
            const neighbors = listNeighbors(cell).filter((x) => {
                return !exposedCells.has(x) && !map[`${x[0]},${x[1]},${x[2]}`] && x[0] >= 0 && x[1] >= 0 && x[2] >= 0 && x[0] < gridExtents[0] && x[1] < gridExtents[1] && x[2] < gridExtents[2];
            });
            // console.log('  neighbors', neighbors);
            queue.push(...neighbors);
        }
    };

    // flood fill all the outer cells
    for (let x = 0; x < gridExtents[0]; x++) {
        for (let y = 0; y < gridExtents[1]; y++) {
            floodFill([x, y, 0]);
            floodFill([x, y, gridExtents[2] - 1]);
        }
    }
    for (let x = 0; x < gridExtents[0]; x++) {
        for (let z = 0; z < gridExtents[2]; z++) {
            floodFill([x, 0, z]);
            floodFill([x, gridExtents[1] - 1, z]);
        }
    }
    for (let y = 0; y < gridExtents[1]; y++) {
        for (let z = 0; z < gridExtents[2]; z++) {
            floodFill([0, y, z]);
            floodFill([gridExtents[0] - 1, y, z]);
        }
    }

    // mark all cells that are not exposed as solid
    for (let x = 0; x < gridExtents[0]; x++) {
        for (let y = 0; y < gridExtents[1]; y++) {
            for (let z = 0; z < gridExtents[2]; z++) {
                const key = `${x},${y},${z}`;
                if (!exposedCells.has(key) && !map[key]) {
                    map[key] = true;
                }
            }
        }
    }

    const ans2 = await part1();
    await Advent.Submit(ans2, 2);
}
Run();
