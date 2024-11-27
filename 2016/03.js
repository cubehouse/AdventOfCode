import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(3, 2016);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const isValid = (sides) => {
        return (
            sides[0] + sides[1] > sides[2] &&
            sides[1] + sides[2] > sides[0] &&
            sides[2] + sides[0] > sides[1]
        );
    }

    const part1 = input.reduce((acc, line) => {
        const sides = line.trim().split(/\s+/).map((x) => parseInt(x));
        return acc + (isValid(sides) ? 1 : 0);
    }, 0);

    await Advent.Submit(part1);

    let part2 = 0;
    for (let lineIdx = 0; lineIdx < input.length; lineIdx += 3) {
        for(let triIdx = 0; triIdx < 3; triIdx++) {
            const sides = [];
            for (let i = 0; i < 3; i++) {
                sides.push(parseInt(input[lineIdx + i].trim().split(/\s+/)[triIdx]));
            }
            if (isValid(sides)) {
                part2++;
            }
        }
    }

    await Advent.Submit(part2, 2);
}
Run();
