import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(2, 2025);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const groups = input.split(",").map((x) => {
        return x.split("-").map(Number);
    });

    const isValid = (id) => {
        const idStr = id.toString();
        // skip if odd length
        if (idStr.length % 2 !== 0) return true;

        const half = idStr.length / 2;
        const firstHalf = idStr.slice(0, half);
        const secondHalf = idStr.slice(half);

        if (firstHalf === secondHalf) {
            return false;
        }
        return true;
    };

    let invalidSum = 0;
    groups.forEach(([start, end]) => {
        for (let i = start; i <= end; i++) {
            if (!isValid(i)) {
                invalidSum += i;
            }
        }
    });

    await Advent.Submit(invalidSum, 1);

    // await Advent.Submit(null, 2);
}
Run();
