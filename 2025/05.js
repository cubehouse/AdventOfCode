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

    console.log('Input:', freshRanges, ingredients);

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
    // await Advent.Submit(null, 2);
}
Run();
