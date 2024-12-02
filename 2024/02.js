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

    const isReportValid = (report) => {
        const levelsIncreasing = report.every((y, i, arr) => i == 0 || y >= arr[i - 1]);
        const levelsDecreasing = report.every((y, i, arr) => i == 0 || y <= arr[i - 1]);

        const safeDifferences = report.every((b, i, arr) => {
            if (i == 0) return true;
            const a = arr[i - 1];
            const diff = Math.abs(a - b);
            return diff >= 1 && diff <= 3;
        });
        
        return (levelsIncreasing || levelsDecreasing) && safeDifferences;
    };
    const reports = input.map((x) => x.split(/\s+/).map(Number));

    const ans1 = reports.filter(isReportValid).length;
    await Advent.Submit(ans1);

    const ans2 = reports.filter((x) => {
        const safe = isReportValid(x);
        if (safe) return true;

        // try fixing report by removing each entry and re-testing
        //  we can tolerate one invalid entry
        for (let i = 0; i < x.length; i++) {
            const copy = [...x];
            copy.splice(i, 1);
            if (isReportValid(copy)) return true;
        }
        return false;
    }).length;
    await Advent.Submit(ans2, 2);
}
Run();
