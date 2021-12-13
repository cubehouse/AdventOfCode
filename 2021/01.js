import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(1, 2021);

async function Run() {
    const input = await Advent.GetInput();

    // count up increases using reduce
    const ans1 = input.map(Number).reduce((p, n, idx, arr) => {
        // skip first entry, then check if previous value is smaller than current
        if (idx > 0 && n > arr[idx - 1]) {
            return p + 1;
        }
        return p;
    }, 0);

    await Advent.Submit(ans1);

    // first, smush array combining each sliding group of 3
    const ans2 = input.map(Number).reduce((p, n, idx, arr) => {
        if (idx > 1) {
            p.push(arr[idx - 2] + arr[idx - 1] + n);
        }
        return p;
    }, []).reduce((p, n, idx, arr) => {
        // then do the same operation as before
        if (idx > 0 && n > arr[idx - 1]) {
            return p + 1;
        }
        return p;
    }, 0);
    await Advent.Submit(ans2, 2);
}
Run();
