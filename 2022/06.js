import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(6, 2022);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    // find first set of 4 characters that are unique
    const findUnique = (str, size = 4) => {
        let uniqueIndexes = [];
        str.split('').forEach((c, i) => {
            const chars = input.slice(i, i + size);
            if (chars.length === size) {
                // mush into a set, which skips duplicates
                const unique = [...new Set(chars.split(''))].join('');
                if (unique.length === size) {
                    uniqueIndexes.push(i + size);
                }
            }
        });
        return uniqueIndexes;
    };

    await Advent.Submit(findUnique(input, 4)[0]);

    // part 2
    // do the same, but for 14 characters
    await Advent.Submit(findUnique(input, 14)[0], 2);
}
Run();
