import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(4, 2022);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const groups = input.map((x) => {
        // regex parse in format \d-\d,\d-\d
        const regex = /(\d+)-(\d+),(\d+)-(\d+)/;
        const match = x.match(regex);
        if (match === null) {
            throw new Error("Invalid input");
        }
        const [, x1, x2, y1, y2] = match;

        return {
            x1: parseInt(x1),
            x2: parseInt(x2),
            y1: parseInt(y1),
            y2: parseInt(y2),
        };
    });

    const fullyOverlappingGroups = groups.filter((x) => {
        return (x.x1 >= x.y1 && x.x2 <= x.y2) || (x.y1 >= x.x1 && x.y2 <= x.x2);
    });

    await Advent.Submit(fullyOverlappingGroups.length);

    // part 2

    const overlappingPairs = groups.filter((x) => {
        // 1D line intersection
        return (x.y1 >= x.x1 && x.y1 <= x.x2) || (x.y2 >= x.x1 && x.y2 <= x.x2)
        || (x.x1 >= x.y1 && x.x1 <= x.y2) || (x.x2 >= x.y1 && x.x2 <= x.y2);
    });

    await Advent.Submit(overlappingPairs.length, 2);
}
Run();
