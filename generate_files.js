import { dirname, join as pathJoin } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs, existsSync as fsExists } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const year = 2021;

async function generate_file(day) {
    const entryFileName = pathJoin(__dirname, day.toString().padStart(2, '0') + '.js');
    if (await fsExists(entryFileName)) return;
    await fs.writeFile(entryFileName, `import { Advent as AdventLib } from './lib/advent.js';
const Advent = new AdventLib(${day}, ${year});

async function Run() {
    const input = await Advent.GetInput();

    // await Advent.Submit(null);
    // await Advent.Submit(null, 2);
}
Run();
`);
    console.log(`Written solution file ${day}: ${entryFileName}`);
}

const run = async () => {
    const inputsDir = pathJoin(__dirname, 'inputs');
    if (!await fsExists(inputsDir)) {
        await fs.mkdir(inputsDir);
    }

    for (let i = 1; i <= 25; i++) {
        generate_file(i);
    }
};
run();
