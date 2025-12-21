import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(5, 2025);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const sepIndex = input.findIndex(line => line.trim() === '');

    const freshRanges = input.slice(0, sepIndex).map(line => {
        const [start, end] = line.split('-').map(Number);
        return { start, end };
    });
    const ingredients = input.slice(sepIndex + 1).map(Number);

    const isInAnyRange = (num) => {
        return freshRanges.some(({ start, end }) => num >= start && num <= end);
    };

    let count = 0;
    for (const ingredient of ingredients) {
        if (isInAnyRange(ingredient)) {
            count++;
        }
    }

    await Advent.Submit(count);
    
    // part 2
    // for each range, look for ranges that it overlaps with, then combine them
    for (let i = 0; i < freshRanges.length; i++) {
        for (let j = i + 1; j < freshRanges.length; j++) {
            const rangeA = freshRanges[i];
            const rangeB = freshRanges[j];
            if (rangeA.end >= rangeB.start && rangeB.end >= rangeA.start) {
                // they overlap, combine them
                const newRange = {
                    start: Math.min(rangeA.start, rangeB.start),
                    end: Math.max(rangeA.end, rangeB.end)
                };
                freshRanges.splice(i, 1);
                freshRanges.splice(j - 1, 1);
                freshRanges.push(newRange);
                i = -1; // restart outer loop
                break;
            }
        }
    }

    const part2 = freshRanges.reduce((sum, { start, end }) => sum + (end - start + 1), 0);
    await Advent.Submit(part2, 2);
}
Run();
