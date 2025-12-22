import { Advent as AdventLib } from '../lib/advent.js';
import Colour from '../lib/colour.js';
const Advent = new AdventLib(7, 2025);

// UI library
import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const W = new Window({
        screenWidth: input[0].length,
        screenHeight: input.length,
    });

    W.applyASCIIMap(0, 0, input, {
        '.': Colour.white,
        '^': Colour.black,
        'S': Colour.red,
    });

    W.loop();

    const beams = [];
    let splits = 0;
    const step = () => {
        // remove any duplicates and create a clone of beams
        const beamsToProcess = [...beams].filter((beam, index, self) =>
            index === self.findIndex((b) => b.x === beam.x && b.y === beam.y)
        );
        beams.length = 0;

        for (const beam of beamsToProcess) {
            const { x, y } = beam;

            // check down
            const below = W.get(x, y + 1);
            if (below) {
                if (below.val === '.') {
                    // empty space! create a new beam there
                    beams.push({ x, y: y + 1 });
                    W.setPixel(x, y, Colour.green);
                } else if (below.val === '^') {
                    // create two beams
                    beams.push({ x: x - 1, y: y + 1 });
                    beams.push({ x: x + 1, y: y + 1 });
                    W.setPixel(x, y, Colour.green);
                    splits++;
                }
            } else {
                W.setPixel(x, y, Colour.green);
            }
        }
    };

    // start with a beam beneath the S
    const startCell = W.find((x, y, cell) => {
        return cell.val === 'S';
    });
    beams.push({ x: startCell.x, y: startCell.y + 1 });

    while (beams.length > 0) {
        step();
        await W.delay(5);
    }

    await Advent.Submit(splits);


    // await Advent.Submit(null, 2);
}
Run();
