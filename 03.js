import { Advent as AdventLib } from './lib/advent.js';
const Advent = new AdventLib(3, 2021);

async function Run() {
    const input = await Advent.GetInput();
    const input2 = `00100
11110
10110
10111
10101
01111
00111
11100
10000
11001
00010
01010`.split(/[\r\n]/g);

    const bits = input[0].length;
    const inputs = input.length;
    const inputsHalf = inputs / 2;

    // largest binary number possible
    const maxInt = parseInt(new Array(bits).fill('1').join(''), 2);

    const countBits = (arr, bit) => {
        return arr.reduce((prev, curr) => {
            if (curr[bit] === '1') {
                return prev + 1;
            }
            return prev;
        }, 0);
    };

    const mostCommonBit = (bit) => {
        return (countBits(input, bit) >= inputsHalf) ? 1 : 0;
    };

    const commonBits = (new Array(bits).fill('')).map((_, bit) => {
        return mostCommonBit(bit);
    });
    const gamma = parseInt(commonBits.join(''), 2);

    // epsilon is largest int - gamma
    await Advent.Submit(gamma * (maxInt - gamma));

    // part 2

    const filterDown = (gtFilter, ltFilter) => {
        let bit = 0;
        const numbers = [...input];
        const filterBits = (arr, num) => {
            for (let i = 0; i < numbers.length; i++) {
                if (numbers[i][bit] !== num) {
                    numbers.splice(i, 1);
                    i--;
                }
            }
        };
        while (numbers.length > 1) {
            const bitCount = countBits(numbers, bit);
            if (bitCount >= numbers.length / 2) {
                filterBits(numbers, gtFilter);
            } else {
                filterBits(numbers, ltFilter);
            }
            bit++;
        }
        return parseInt(numbers[0], 2);
    };

    const oxygen = filterDown('1', '0');
    const co2 = filterDown('0', '1');

    await Advent.Submit(oxygen * co2, 2);

}
Run();
