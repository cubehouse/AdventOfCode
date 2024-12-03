import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(3, 2024);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput(`xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))
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
    // await Advent.Submit(null, 2);
}
Run();
