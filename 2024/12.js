import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(12, 2024);

// UI library
// import Window from '../lib/window.js';
import Screen from '../lib/screen.js';
import Colour from '../lib/colour.js';

const dirs = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0]
];

async function Run() {
    const input = await Advent.GetInput(`RRRRIICCFF
RRRRIICCCF
VVRRRCCFFF
VVRCCCJFFF
VVVVCJJCFE
VVIVCCJJEE
VVIIICJJEE
MIIIIIJJEE
MIIISIJEEE
MMMISSJEEE`);

    const S = new Screen();
    input.forEach((line, y) => {
        line.split('').forEach((val, x) => {
            S.Set(x, y, val);

            // pick colour from ASCII value
            const col = Colour.basicColours[(val.charCodeAt(0) - 65) % Colour.basicColours.length];
            const colHex = Colour.colourToHex(col);
            S.SetKey(x, y, 'style', `{${colHex}-fg}`);
        });
    });

    // preprocess fence pieces for each file
    const countFencePiecesForTile = (x, y) => {
        const tile = S.Get(x, y);
        return dirs.reduce((acc, dir) => {
            const [dx, dy] = dir;
            const tile2 = S.Get(x + dx, y + dy);
            if (tile2 !== tile) {
                return acc + 1;
            }
            return acc;
        }, 0);
    };
    for (let y = 0; y <= S.maxY; y++) {
        for (let x = 0; x <= S.maxX; x++) {
            const count = countFencePiecesForTile(x, y);
            S.SetKey(x, y, 'fenceCount', count);
        }
    }

    // find each region
    const regions = [];
    for (let y = 0; y <= S.maxY; y++) {
        for (let x = 0; x <= S.maxX; x++) {
            // skip already assigned regions
            if (S.GetKey(x, y, 'region') !== undefined) {
                continue;
            }

            const startCell = S.GetCell(x, y);

            // flood fill to find region
            const region = {
                id: regions.length,
                cells: [],
                fenceCount: 0,
                crop: startCell.val,
            };
            regions.push(region);

            await S.FloodFill(x, y, (cell) => {
                // condition function
                return cell && cell.val === startCell.val;
            }, (cell) => {
                // callback function when we find a cell
                region.cells.push(cell);
                S.SetKey(cell.x, cell.y, 'region', region),
                region.fenceCount += S.GetKey(cell.x, cell.y, 'fenceCount') || 0;
                //S.SetStyle(cell.x, cell.y, `{green-bg}`);
            });
        }
    }

    const ans1 = regions.reduce((acc, region) => {
        return acc + (region.fenceCount * region.cells.length);
    }, 0);
    Advent.Assert(ans1, 1930);

    await Advent.Submit(ans1);
    // await Advent.Submit(null, 2);
}
Run();
