import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(5, 2021);

async function Run() {
    const input = await Advent.GetInput();
    const input2 = `0,9 -> 5,9
8,0 -> 0,8
9,4 -> 3,4
2,2 -> 2,1
7,0 -> 7,4
6,4 -> 2,0
0,9 -> 2,9
3,4 -> 1,4
0,0 -> 8,8
5,5 -> 8,2`.split(/[\r\n]+/);

    const lineRegex = /(\d+),(\d+)\s*->\s*(\d+),(\d+)/;

    const lines = [];
    for (const line of input) {
        const match = line.match(lineRegex);
        if (match) {
            const [, x1, y1, x2, y2] = match;
            lines.push({ x1: parseInt(x1), y1: parseInt(y1), x2: parseInt(x2), y2: parseInt(y2) });
        }
    }

    const points = {};
    for (const line of lines) {
        if (line.x1 === line.x2) {
            const minY = Math.min(line.y1, line.y2);
            const maxY = Math.max(line.y1, line.y2);
            for (let y = minY; y <= maxY; y++) {
                points[`${line.x1},${y}`] = points[`${line.x1},${y}`] || 0;
                points[`${line.x1},${y}`]++;
            }
        }
        else if (line.y1 === line.y2) {
            const minX = Math.min(line.x1, line.x2);
            const maxX = Math.max(line.x1, line.x2);
            for (let x = minX; x <= maxX; x++) {
                points[`${x},${line.y1}`] = points[`${x},${line.y1}`] || 0;
                points[`${x},${line.y1}`]++;
            }
        }
    }

    // debug view for the sample input
    /*
    for (let y = 0; y < 10; y++) {
        const row = new Array(10).fill(0).map((_, x) => {
            if (points[`${x},${y}`] === undefined) {
                return '.';
            }
            return points[`${x},${y}`];
        }).join('');
        console.log(row);
    }
    */
    const pointsWith2OverlapsOrMore = Object.values(points).reduce((p, n) => {
        if (n >= 2) {
            p++;
        }
        return p;
    }, 0);

    await Advent.Submit(pointsWith2OverlapsOrMore);

    // part 2

    for (const line of lines) {
        // plot lines with slopes too
        //  skip the lines we've already plotted
        if (line.x1 === line.x2) {
            continue;
        } else if (line.y1 === line.y2) {
            continue;
        } else {
            const slope = (line.y2 - line.y1) / (line.x2 - line.x1);
            const b = line.y1 - slope * line.x1;
            const minX = Math.min(line.x1, line.x2);
            const maxX = Math.max(line.x1, line.x2);
            for (let x = minX; x <= maxX; x++) {
                const y = Math.round(slope * x + b);
                points[`${x},${y}`] = points[`${x},${y}`] || 0;
                points[`${x},${y}`]++;
            }
        }
    }
    const pointsWith2OverlapsOrMorePart2 = Object.values(points).reduce((p, n) => {
        if (n >= 2) {
            p++;
        }
        return p;
    }, 0);

    await Advent.Submit(pointsWith2OverlapsOrMorePart2, 2);
}
Run();
