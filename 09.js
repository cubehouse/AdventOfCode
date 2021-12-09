import { Advent as AdventLib } from './lib/advent.js';
const Advent = new AdventLib(9, 2021);

async function Run() {
    const input = await Advent.GetInput();
    const input2 = `2199943210
3987894921
9856789892
8767896789
9899965678`.split('\n');

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
                return acc + depth + 1;
            }
            return acc;
        }, 0);
        return acc + lows;
    }, 0);

    await Advent.Submit(lowPoints);

    
    // await Advent.Submit(null, 2);
}
Run();
