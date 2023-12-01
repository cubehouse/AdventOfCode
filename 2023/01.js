import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(1, 2023);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const digits = input.map((x) => {
        // remove all non-digit characters
        return x.replace(/\D/g, '').split('').map((y) => parseInt(y));
    });

    const nums = digits.map((x) => {
        // combine first and last digit and convert to number
        return parseInt(x[0] + '' + x[x.length - 1]);
    });

    const ans1 = nums.reduce((a, b) => a + b);

    await Advent.Submit(ans1);


    // await Advent.Submit(null, 2);
}
Run();
