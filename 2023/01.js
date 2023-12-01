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

    const numbers = {
        "one": 1,
        "two": 2,
        "three": 3,
        "four": 4,
        "five" : 5,
        "six": 6,
        "seven": 7,
        "eight": 8,
        "nine": 9
    };
    const digits2 = input.map((x) => {
        // match all word numbers
        const digits = [];
        // match all numbers, overlapping
        //  if we have "eightwo", we want to match "eight" and "two"
        const numRegex = /(?=(\d|one|two|three|four|five|six|seven|eight|nine))/g;
        let m;
        while (m = numRegex.exec(x)) {
            // https://stackoverflow.com/questions/20833295/how-can-i-match-overlapping-strings-with-regex
            if (m.index === numRegex.lastIndex) {
                numRegex.lastIndex++;
            }
            if (m[1] in numbers) {
                digits.push(numbers[m[1]]);
            } else {
                digits.push(parseInt(m[1]));
            }
        }
        return digits;
    });
    const nums2 = digits2.map((x) => {
        // combine first and last digit and convert to number
        return parseInt(x[0] + '' + x[x.length - 1]);
    });

    const ans2 = nums2.reduce((a, b) => a + b);

    await Advent.Submit(ans2, 2);
}
Run();
