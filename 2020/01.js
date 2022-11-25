import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(1, 2020);

async function Run() {
    const input = await Advent.GetInputNumbers();

    // part 1
    for (let i = 0; i < input.length; i++) {
        for (let j = i + 1; j < input.length; j++) {
            if (input[i] + input[j] == 2020) {
                await Advent.Submit(input[i] * input[j]);
                break;
            }
        }
    }

    // part 2
    for (let i = 0; i < input.length; i++) {
        for (let j = i + 1; j < input.length; j++) {
            for (let k = j + 1; k < input.length; k++) {
                if (input[i] + input[j] + input[k] == 2020) {
                    await Advent.Submit(input[i] * input[j] * input[k], 2);
                    break;
                }
            }
        }
    }
}
Run();
