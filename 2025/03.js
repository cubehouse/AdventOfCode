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

    // part 2

    const cache = {}; // I know how to do this properly, but this is still like, 10 seconds, so that will do.
    const findLargestNumberInBank = (bank, digits = 2) => {
        let largestNum = -Infinity;
        const cackeKey = bank.join(',') + `|${digits}`;
        if (cache[cackeKey] !== undefined) {
            return cache[cackeKey];
        }

        for (let i = 0; i <= bank.length - digits; i++) {
            const startDigit = bank[i];
            let numStr = startDigit.toString();

            if (digits > 1) {
                // reurse with following digits
                const recurBank = bank.slice(i + 1);
                const largestNumberFromRemaining = findLargestNumberInBank(recurBank, digits - 1);
                numStr += largestNumberFromRemaining.toString();
            }

            const numVal = parseInt(numStr, 10);
            if (numVal > largestNum) {
                largestNum = numVal;
            }
        }
        cache[cackeKey] = largestNum;
        return largestNum;
    };

    let part2Sum = 0;
    banks.forEach((bank) => {
        part2Sum += findLargestNumberInBank(bank, 12);
    });

    console.log('Part 2:', part2Sum);
    await Advent.Submit(part2Sum, 2);

    // await Advent.Submit(null);
    // await Advent.Submit(null, 2);
}
Run();
