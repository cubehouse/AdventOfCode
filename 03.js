import { Advent as AdventLib } from './lib/advent.js';
const Advent = new AdventLib(3, 2021);

async function Run() {
    const input = await Advent.GetInput();

    const bits = input[0].length;
    const inputs = input.length;
    const inputsHalf = inputs / 2;

    // largest binary number possible
    const maxInt = parseInt(new Array(bits).fill('1').join(''), 2);

    const bitSums = (new Array(bits).fill('')).map((_, bit) => {
        const a = input.reduce((p, x) => {
            return p + ((x.slice(bit, bit + 1) === '1') ? 1 : 0);
        }, 0);
        return (a >= inputsHalf) ? 1 : 0;
    });
    const gamma = parseInt(bitSums.join(''), 2);
    
    // epsilon is largest int - gamma
    await Advent.Submit(gamma * (maxInt - gamma));

    // await Advent.Submit(null, 2);
}
Run();
