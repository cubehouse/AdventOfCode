import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(1, 2024);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const leftList = [];
    const rightList = [];

    input.forEach((line) => {
        const [left, right] = line.split(/\s+/);
        leftList.push(parseInt(left));
        rightList.push(parseInt(right));
    });

    leftList.sort();
    rightList.sort();

    const pairs = leftList.map((x, idx) => {
        return [x, rightList[idx]];
    });

    const ans1 = pairs.reduce((acc, [left, right]) => {
        return acc + Math.abs(left - right);
    }, 0);

    await Advent.Submit(ans1);
    // await Advent.Submit(null, 2);
}
Run();
