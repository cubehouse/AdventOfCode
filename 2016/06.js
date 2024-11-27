import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(6, 2016);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const charCounts = [];

    for (const line of input) {
        for (let i = 0; i < line.length; i++) {
            if (!charCounts[i]) {
                charCounts[i] = {};
            }

            if (charCounts[i][line[i]] == ' ') {
                continue;
            }

            if (!charCounts[i][line[i]]) {
                charCounts[i][line[i]] = 0;
            }

            charCounts[i][line[i]]++;
        }
    }

    const message = charCounts.map((x) => {
        return Object.keys(x).sort((a, b) => x[b] - x[a])[0];
    }).join('');

    await Advent.Submit(message);

    const message2 = charCounts.map((x) => {
        return Object.keys(x).sort((a, b) => x[a] - x[b])[0];
    }).join('');
    await Advent.Submit(message2, 2);
}
Run();
