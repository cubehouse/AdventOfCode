import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(3, 2022);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const incorrectItems = [];
    input.forEach((line) => {
        // split line into first and second half
        const firstHalf = line.slice(0, line.length / 2).split('');
        const secondHalf = line.slice(line.length / 2).split('');

        // find symbol that is in both halves
        const symbol = firstHalf.find((s) => secondHalf.includes(s));
        incorrectItems.push(symbol);
    });

    const scoreItem = (s) => {
        const charCode = s.charCodeAt(0);
        if (charCode >= 97 && charCode <= 122) {
            return charCode - 96;
        } else if (charCode >= 65 && charCode <= 90) {
            return charCode - 64 + 26;
        }
        throw new Error("Invalid symbol");
    }

    // score each item, a = 1, z = 26, A = 27, Z = 52
    const scores = incorrectItems.map(scoreItem);
    // sum up all the stores
    const score = scores.reduce((a, b) => a + b, 0);

    await Advent.Submit(score);

    // part 2

    const badges = [];
    for (let i = 0; i <= input.length - 2; i += 3) {
        const items = [
            input[i].split(''),
            input[i+1].split(''),
            input[i+2].split('')
        ];

        // find the common element from the three arrays in items
        const common = items[0].find((s) => items[1].includes(s) && items[2].includes(s));
        badges.push(common);
    }
    const part2score = badges.map(scoreItem).reduce((p, x) => p + x, 0);

    await Advent.Submit(part2score, 2);
}
Run();
