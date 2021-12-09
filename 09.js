import { Advent as AdventLib } from './lib/advent.js';
const Advent = new AdventLib(9, 2021);

import { Screen } from './lib/screen.js';

async function Run() {
    const input = await Advent.GetInput();
    const input2 = `2199943210
3987894921
9856789892
8767896789
9899965678`.split('\n');

    const S = new Screen({ logWidth: 25 });

    const map = input.map((line) => {
        return line.split('').map((c) => Number(c));
    });

    const lowPoints = map.reduce((acc, line, row, lines) => {
        const lows = line.reduce((acc, depth, col) => {
            const adjacentPoints = [
                lines[row - 1] ? lines[row - 1][col] : undefined,
                lines[row + 1] ? lines[row + 1][col] : undefined,
                lines[row][col - 1],
                lines[row][col + 1],
            ];

            const anyLowerAdjacent = adjacentPoints.find((adjacent) => {
                return adjacent !== undefined && adjacent <= depth;
            });
            if (anyLowerAdjacent === undefined) {
                acc.push({
                    row,
                    col,
                    depth,
                });
            }
            return acc;
        }, []);
        return [...acc, ...lows];
    }, []);

    const lowPointsTotal = lowPoints.reduce((acc, point) => {
        return acc + point.depth + 1;
    }, 0);

    await Advent.Submit(lowPointsTotal);

    // part 2

    // dump input into a 2d grid
    S.Set(0, 0, input.join('\n'));

    // parse height from each cell and store in cell as 'height'
    S.ForEachCell((x) => {
        S.SetKey(x.x, x.y, 'height', Number(x.val));
    });

    // some flavour to the visual map
    S.AddStyle(/(X)/, '{green-fg}');
    S.AddStyle(/(\.)/, '{green-fg}');
    lowPoints.forEach((point) => {
        S.Set(point.col, point.row, `X`);
    });

    let maxY = 0;

    // flood fill each lowest point from part 1
    for (const point of lowPoints) {
        let count = 0;
        await S.FloodFill(point.col, point.row, (x) => {
            return x?.height !== undefined && x?.height < 9;
        }, (x) => {
            S.Set(x.x, x.y, '.');

            // shift screen view to fit in the new areas of the map
            if (x.y > maxY) {
                maxY = x.y;
                S.FitPositionOntoScreen(x.x, x.y);
            }

            count++;
        });
        // total up the area of each lowest point
        point.area = count;
    }

    // sort by area size
    lowPoints.sort((a, b) => {
        return b.area - a.area;
    });

    // reduce multiply together the top 3 areas
    const totalArea = lowPoints.slice(0, 3).reduce((acc, point) => {
        return acc * point.area;
    }, 1);

    await Advent.Submit(totalArea, 2);

    S.Draw();
}
Run();
