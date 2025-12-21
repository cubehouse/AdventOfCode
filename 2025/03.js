import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(3, 2025);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const banks = input.map((x) => {
        return x.split('').map(Number);
    });

    const findMaxIndexInArray = (arr) => {
        let maxVal = -Infinity;
        let maxIdx = -1;
        arr.forEach((val, idx) => {
            if (val > maxVal) {
                maxVal = val;
                maxIdx = idx;
            }
        });
        return maxIdx;
    };

    const bankMaxVal = (bank) => {
        // find max value
        let digitOne = findMaxIndexInArray(bank);
        // find second max value following digitOne
        //  edge-case, if digitOne is at end of array, find the max in the front part and swap the digits around
        let digitTwo = -1;
        if (digitOne === bank.length - 1) {
            const frontPart = bank.slice(0, digitOne);
            digitTwo = bank.length - 1;
            digitOne = findMaxIndexInArray(frontPart);
        } else {
            const backPart = bank.slice(digitOne + 1);
            digitTwo = findMaxIndexInArray(backPart) + digitOne + 1;
        }
        return (bank[digitOne] * 10) + bank[digitTwo];
    };

    // Part 1
    let part1Sum = 0;
    banks.forEach((bank) => {
        part1Sum += bankMaxVal(bank);
    });

    console.log('Part 1:', part1Sum);
    await Advent.Submit(part1Sum, 1);

    // await Advent.Submit(null);
    // await Advent.Submit(null, 2);
}
Run();
