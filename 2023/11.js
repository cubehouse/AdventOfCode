import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(11, 2023);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const galaxies = [];
    input.forEach((line, y) => {
        line.split('').forEach((char, x) => {
            if (char === '#') {
                galaxies.push({ x, y, id: galaxies.length + 1 });
            }
        });
    });

    const print = () => {
        const maxX = Math.max(...galaxies.map(g => g.x));
        const maxY = Math.max(...galaxies.map(g => g.y));
        const grid = [];
        for (let y = 0; y <= maxY; y++) {
            grid[y] = [];
            for (let x = 0; x <= maxX; x++) {
                grid[y][x] = '.';
            }
        }
        galaxies.forEach(g => {
            grid[g.y][g.x] = g.id;
        });
        console.log(grid.map(row => row.join('')).join('\n'));
    };

    const expand = () => {
        // first expand columns
        //  find all columns that have no galaxies
        const maxX = Math.max(...galaxies.map(g => g.x));
        const maxY = Math.max(...galaxies.map(g => g.y));

        const emptyColumns = [];
        const emptyRows = [];
        for (let x = 0; x <= maxX; x++) {
            if (!galaxies.some(g => g.x === x)) {
                emptyColumns.push(x);
            }
        }
        for (let y = 0; y <= maxY; y++) {
            if (!galaxies.some(g => g.y === y)) {
                emptyRows.push(y);
            }
        }

        // increase the x of all galaxies after each empty column
        emptyColumns.forEach((x, i) => {
            galaxies.filter(g => g.x > x).forEach(g => g.x += 1);
            emptyColumns.forEach((x2, i2) => {
                emptyColumns[i2] += 1;
            });
        });
        // increase the y of all galaxies after each empty row
        emptyRows.forEach((y, i) => {
            galaxies.filter(g => g.y > y).forEach(g => g.y += 1);
            emptyRows.forEach((y2, i2) => {
                emptyRows[i2] += 1;
            });
        });
    };

    const getDistance = (g1, g2) => {
        return Math.abs(g1.x - g2.x) + Math.abs(g1.y - g2.y);
    };
    // expand the galaxy!
    expand();

    const distances = [];
    galaxies.forEach(g1 => {
        galaxies.forEach(g2 => {
            if (g1.id >= g2.id) return;
            distances.push({
                a: g1.id,
                b: g2.id,
                distance: getDistance(g1, g2)
            });
        });
    });
    const ans1 = distances.reduce((a, b) => a + b.distance, 0);

    await Advent.Submit(ans1);

    
    // await Advent.Submit(null, 2);
}
Run();
