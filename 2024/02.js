import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(2, 2024);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput(`7 6 4 2 1
1 2 7 8 9
9 7 6 2 1
1 3 2 4 5
8 6 4 4 1
1 3 6 7 9`);

    const reports = input.map((x) => x.split(/\s+/).map(Number)).map((x) => {
        const levelsIncreasing = x.every((y, i, arr) => i == 0 || y >= arr[i - 1]);
        const levelsDecreasing = x.every((y, i, arr) => i == 0 || y <= arr[i - 1]);

        const safeDifferences = x.every((b, i, arr) => {
            if (i == 0) return true;
            const a = arr[i - 1];
            const diff = Math.abs(a - b);
            return diff >= 1 && diff <= 3;
        });

        return {
            levelsIncreasing,
            levelsDecreasing,
            safeDifferences,
        };
    });

    const ans1 = reports.filter((x) => {
        return (x.levelsIncreasing || x.levelsDecreasing) && x.safeDifferences;
    }).length;

    await Advent.Submit(ans1);
    
    // await Advent.Submit(null, 2);
}
Run();
