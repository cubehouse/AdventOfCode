import { Advent as AdventLib } from './lib/advent.js';
const Advent = new AdventLib(11, 2021);

import Window from './lib/window.js';

async function Run() {
    const input = await Advent.GetInput();
    const input2 = `5483143223
2745854711
5264556173
6141336146
6357385478
4167524645
2176841721
6882881134
4846848554
5283751526`.split(/\n/);
    const input3 = `11111
19991
19191
19991
11111`.split(/\n/);

    const gridW = input[0].length;
    const gridH = input.length;

    const W = new Window({
        width: gridW,
        height: gridH,
    });
    W.loop();

    const octs = input.map(row => {
        return row.split('').map(Number);
    });

    const valueColours = new Array(10).fill(0).reduce((acc, _, i) => {
        acc[i] = {
            ...Window.colourLerp(Window.black, Window.grey, i / 9),
            energy: i,
        };
        return acc;
    }, {});
    valueColours[10] = Window.blue;

    // adds energy, returns true if we highlight
    const addEnergy = async (x, y, energyToAdd = 1, animate = false) => {
        if (x < 0 || x >= gridW || y < 0 || y >= gridH) {
            return false;
        }
        
        const energy = W.getKey(x, y, 'energy');
        if (energy > 9) return false;

        const newEnergy = Math.min(10, energy + energyToAdd);
        W.setKey(x, y, 'energy', newEnergy);
        W.setPixel(x, y, valueColours[newEnergy]);

        if (animate) {
            await new Promise(resolve => setTimeout(() => resolve(), speed));
        }

        return newEnergy === 10;
    };

    W.applyASCIIMap(0, 0, octs, valueColours);

    const neighbours = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
    ];

    const speed = 1;
    const step = async () => {
        const todo = []; // list of cells to spread highlight energy from
        // increment all our octupusies
        await W.forEach(async (cell, x, y) => {
            if (await addEnergy(x, y, 1, false)) {
                todo.push([x, y]);
            }
        });

        // increase neighbours of all flashed cells
        while (todo.length > 0) {
            const [x, y] = todo.pop();
            // add energy for each neighbour
            for (const n of neighbours) {
                const nx = x + n[0];
                const ny = y + n[1];
                if ((await addEnergy(nx, ny, 1, false)) === true) {
                    todo.push([nx, ny]);
                }
            }
        }

        // find all octopus that have an energy level of 9
        let highlightedOctopusses = 0;
        await W.forEach(async (cell, x, y) => {
            if (cell.energy > 9) {
                highlightedOctopusses++;
                W.setKey(x, y, 'energy', 0);
                await new Promise(resolve => setTimeout(() => resolve(), 1));
            }
        });

        return highlightedOctopusses;
    };

    const debug = false;
    if (debug) {
        W.addTick(() => {
            W.forEach((cell, x, y) => {
                W.ctx.font = `${W.pixelSize / 2}px serif`;
                const textx = (x + 0.5) * W.pixelSize;
                const texty = (y + 0.5) * W.pixelSize;
                W.ctx.strokeStyle = 'black';
                W.ctx.lineWidth = 8;
                W.ctx.strokeText(cell.energy, textx, texty);
                W.ctx.fillStyle = 'white';
                W.ctx.fillText(cell.energy, textx, texty);
            });
        });
    }

    let totalFlashes = 0;
    for (let i = 0; i < 100; i++) {
        totalFlashes += await step();
    }

    await Advent.Submit(totalFlashes);
    // await Advent.Submit(null, 2);
}
Run();
