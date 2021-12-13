import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(9, 2021);

import Window from '../lib/window.js';

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

    const W = new Window({ width: map[0].length, height: map.length, title: 'Advent of Code 2021 - Day 9' });

    W.loop();

    // dump input into a 2d grid
    const cellTypes = new Array(10).fill(0).map((_, idx) => idx).reduce((acc, num) => {
        acc[`${num}`] = {
            ...Window.colourLerp(Window.green, Window.red, num / 13),
            height: num,
        };
        return acc;
    }, {});
    W.applyASCIIMap(0, 0, input, cellTypes);

    for (const lowPoint of lowPoints) {
        W.setPixel(lowPoint.col, lowPoint.row, Window.blue);
        await new Promise((resolve) => setTimeout(resolve, 1));
    }

    // flood fill each lowest point from part 1
    const speed = 5;
    let animCounter = 0;
    for (const point of lowPoints) {
        let count = 0;
        await W.floodFill(point.col, point.row, (cell) => {
            return cell.height !== undefined && cell.height < 9;
        }, async (cell) => {
            count++;
            if (W.setPixel(cell.x, cell.y, Window.blue)) {
                animCounter++;
                if (animCounter % speed === 0) {
                    await new Promise((resolve) => setTimeout(resolve, 1));
                }
            }
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
}
Run();
