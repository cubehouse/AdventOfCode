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
            S.SetKey(x, y, 'crop', val);

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

    const allDirs = [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
        [1, -1],
        [1, 1],
        [-1, 1],
        [-1, -1]
    ];

    const countCornersOfRegion = (region) => {
        const corners = region.cells.reduce((acc, cell) => {
            // check if cell is a corner
            const n = allDirs.map((dir) => {
                const [dx, dy] = dir;
                return S.GetKey(cell.x + dx, cell.y + dy, 'crop') === cell.crop;
            });

            let cellCorners = 0;

            // inner corners
            if (n[0] && n[1] && !n[4]) {
                cellCorners++;
            }
            if (n[1] && n[2] && !n[5]) {
                cellCorners++;
            }
            if (n[2] && n[3] && !n[6]) {
                cellCorners++;
            }
            if (n[3] && n[0] && !n[7]) {
                cellCorners++;
            }

            // outer corners
            if (n[0] && n[1] && !n[2] && !n[3]) {
                cellCorners++;
            }
            if (n[1] && n[2] && !n[3] && !n[0]) {
                cellCorners++;
            }
            if (n[2] && n[3] && !n[0] && !n[1]) {
                cellCorners++;
            }
            if (n[3] && n[0] && !n[1] && !n[2]) {
                cellCorners++;
            }

            // thin edge corners
            if (n[0] && !n[1] && !n[2] && !n[3]) {
                cellCorners += 2;
            }
            if (n[1] && !n[2] && !n[3] && !n[0]) {
                cellCorners += 2;
            }
            if (n[2] && !n[3] && !n[0] && !n[1]) {
                cellCorners += 2;
            }
            if (n[3] && !n[0] && !n[1] && !n[2]) {
                cellCorners += 2;
            }

            if (!n[0] && !n[1] && !n[2] && !n[3]) {
                // single cell
                cellCorners = 4;
            }
            
            S.Set(cell.x, cell.y, `${cellCorners}`);

            return acc + cellCorners;
        }, 0);

        return corners;
    };
    regions.forEach((region) => {
        region.edges = countCornersOfRegion(region);
    });

    const ans2 = regions.reduce((acc, region) => {
        return acc + (region.edges * region.cells.length);
    }, 0);
    Advent.Assert(ans2, 1206);
    await Advent.Submit(ans2, 2);
}
Run();
