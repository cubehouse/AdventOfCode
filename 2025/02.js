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


    const isValid2 = (id) => {
        const idStr = id.toString();
        const len = idStr.length;

        const seedsToTest = Math.floor(len / 2);

        for(let seedLen = 1; seedLen <= seedsToTest; seedLen++) {
            const seed = idStr.slice(0, seedLen);
            // check if the string length is a multiple of seed length
            if (len % seedLen !== 0) {
                continue;
            }
            // check if seed repeats to make the full string
            let repeated = '';
            const repeatCount = len / seedLen;
            for(let i = 0; i < repeatCount; i++) {
                repeated += seed;
            }
            if (repeated === idStr) {
                return false;
            }
        }

        return true;
    };

    let invalidSum2 = 0;
    groups.forEach(([start, end]) => {
        for (let i = start; i <= end; i++) {
            if (!isValid2(i)) {
                invalidSum2 += i;
            }
        }
    });

    await Advent.Submit(invalidSum2, 2);
    // await Advent.Submit(null, 2);
}
Run();
