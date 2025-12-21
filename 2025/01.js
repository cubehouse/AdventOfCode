import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(1, 2025);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const commands = input.map((x) => {
        // each line eg. R15, L17, etc. - split into direction and number
        const dir = x[0];
        const turns = parseInt(x.slice(1), 10);
        return { dir, turns };
    });

    const processCommands = (startPos, cmds, callback) => {
        let x = startPos;
        cmds.forEach(({ dir, turns }) => {
            if (dir === 'R') {
                x += turns;
            } else if (dir === 'L') {
                x -= turns;
            }

            // modulo to keep in range 0-99
            x = (x + 100) % 100;

            callback(x);
        });

        return x;
    };

    let zeroCount = 0;
    processCommands(50, commands, (x) => {
        if (x === 0) {
            zeroCount++;
        }
    });

    console.log('Part 1:', zeroCount);
    await Advent.Submit(zeroCount, 1);

    // == Part 2 ==

    // await Advent.Submit(null, 2);
}
Run();
