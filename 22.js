import { Advent as AdventLib } from './lib/advent.js';
const Advent = new AdventLib(22, 2021);

async function Run() {
    const input = await Advent.GetInput();

    // await Advent.Submit(null);
    // await Advent.Submit(null, 2);
}
Run();
