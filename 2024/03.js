import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(3, 2024);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput(`
xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))mul(1,1)mul(8,5)don't()dsado()don't()mul(1,4)
`);

    const mulRegex = /mul\(([0-9]+),([0-9]+)\)/g;

    const ans1 = input.reduce((acc, line) => {
        // loop over all matches
        let match;
        while ((match = mulRegex.exec(line)) !== null) {
            const A = parseInt(match[1]);
            const B = parseInt(match[2]);

            acc += A * B;
        }
        return acc;
    }, 0);

    await Advent.Submit(ans1);

    // I *could* write a clever regex, or just strip out things between don't() and do()
    let ans2 = 0;
    const lineStripped = `do()${input.join("")}do()`.replace(/don't\(\).*?(?:do\(\)|$)/g, '');
    let match;
    while ((match = mulRegex.exec(lineStripped)) !== null) {
        const A = parseInt(match[1]);
        const B = parseInt(match[2]);

        ans2 += A * B;
    }

    await Advent.Submit(ans2, 2);
}
Run();
