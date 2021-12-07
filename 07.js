import { Advent as AdventLib } from './lib/advent.js';
const Advent = new AdventLib(7, 2021);

async function Run() {
    const input = await Advent.GetInput();
    const input2 = `16,1,2,0,4,2,7,1,2,14`;

    // part 1

    // calculate median of list
    const numbers = input.split(',').map(x => parseInt(x));
    numbers.sort((a, b) => a - b);
    const median = numbers[Math.floor(numbers.length / 2)];

    // get total distance to median for each number
    const distanceToTarget = (numbers, target) => {
        return numbers.reduce((acc, curr) => {
            return Math.abs(curr - target) + acc;
        }, 0);
    };
    const distanceToMedian = distanceToTarget(numbers, median);

    await Advent.Submit(distanceToMedian);

    // part 2
    
    // new function that calculates different fuel cost
    const distanceToTargetExpo = (numbers, target) => {
        return numbers.reduce((acc, curr) => {
            // add up sum of integers 0 -> n using square trick
            //  eg. 0 + 1 + 2 + 3 + 4 = (4 * 5) / 2 =
            //  . . . .
            //  * . . .
            //  * * . .
            //  * * * .
            //  * * * *
            // (I messed up the answer and had time to write comments today)
            const n = Math.abs(curr - target);
            return acc + ((n * (n + 1)) / 2);
        }, 0);
    };

    // run through all options and reduce to find fastest route
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const cheapestDistance = new Array(max - min + 1).fill(0).reduce((acc, curr, i) => {
        const target = min + i;
        const distance = distanceToTargetExpo(numbers, target);
        if (distance < acc) {
            return distance;
        }
        return acc;
    }, Number.MAX_SAFE_INTEGER);
    await Advent.Submit(cheapestDistance, 2);
}
Run();
