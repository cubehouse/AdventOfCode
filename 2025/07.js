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
    let maxBeams = 0;
    const addBeamToProcess = (x, y, existingCount = 1) => {
        // if already exists, find and add to its count
        const existingBeam = beams.find((b) => b.x === x && b.y === y);
        if (existingBeam) {
            existingBeam.count += existingCount;
        } else {
            beams.push({ x, y, count: existingCount });
        }
    };
    const step = () => {
        const beamsToProcess = [...beams];
        maxBeams = Math.max(maxBeams, beamsToProcess.reduce((sum, b) => sum + b.count, 0));
        beams.length = 0;

        for (const beam of beamsToProcess) {
            const { x, y } = beam;

            // check down
            const below = W.get(x, y + 1);
            if (below) {
                if (below.val === '.') {
                    // empty space! create a new beam there
                    addBeamToProcess(x, y + 1, beam.count);
                    W.setPixel(x, y, Colour.green);
                } else if (below.val === '^') {
                    // create two beams
                    addBeamToProcess(x - 1, y + 1, beam.count);
                    addBeamToProcess(x + 1, y + 1, beam.count);
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
    addBeamToProcess(startCell.x, startCell.y + 1);

    while (beams.length > 0) {
        step();
        await W.delay(0);
    }

    Advent.Assert(splits, 21);
    await Advent.Submit(splits);


    await Advent.Submit(maxBeams, 2);
}
Run();
