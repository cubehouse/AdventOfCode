import { Advent as AdventLib } from './lib/advent.js';
const Advent = new AdventLib(1, 2021);

async function Run() {
    const input = await Advent.GetInput();

    const ans1 = input.map(Number).reduce((p, n, idx, arr) => {
        if (idx > 0 && n > arr[idx - 1]) {
            return p + 1;
        }
        return p;
    }, 0);

    await Advent.Submit(ans1);
    // await Advent.Submit(null, 2);
}
Run();
