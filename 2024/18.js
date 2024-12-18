import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(18, 2024);

// UI library
import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput(`5,4
4,2
4,5
3,0
2,1
6,3
2,4
1,5
0,6
3,3
2,6
5,1
1,2
5,5
2,5
6,5
1,4
0,4
6,4
1,1
6,1
1,0
0,5
1,6
2,0`);
    const W = new Window();

    const gridSize = Advent.SampleMode ? 7 : 71;
    // init grid
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            W.setPixel(x, y, Window.black);
        }
    }

    const blocks = input.map((line) => {
        const [x, y] = line.split(',').map(Number);
        return { x, y };
    });

    const blocksToFall = Advent.SampleMode ? 12 : 1024;
    for (let idx = 0; idx < blocksToFall; idx++) {
        const block = blocks[idx];
        W.setPixel(block.x, block.y, Window.orange);
        W.setKey(block.x, block.y, 'block', true);
        await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const drawCol = Advent.SampleMode ? 22 : 1024;
    const findPath = async () => {
        // reset maze
        W.forEach((x, y) => {
            W.setKey(x, y, 'depth', undefined);
            if (!W.getKey(x, y, 'block')) {
                W.setPixel(x, y, Window.black);
            }
        });

        await W.floodFill(0, 0, (cell) => !cell.block, async (cell, x, y, depth) => {
            W.setKey(x, y, 'depth', Math.min(W.getKey(x, y, 'depth') || 99999, depth));
            W.setPixel(x, y, Window.colourLerp(Window.blue, Window.white, depth / drawCol));
        });
    };
    await findPath();

    const endCell = W.get(gridSize - 1, gridSize - 1);
    const ans1 = endCell.depth;
    Advent.Assert(ans1, 22);
    await Advent.Submit(ans1);

    let idx = blocksToFall;
    while (endCell.depth !== undefined) {
        idx++;
        const block = blocks[idx];
        W.setPixel(block.x, block.y, Window.orange);
        W.setKey(block.x, block.y, 'block', true);
        await findPath();
        await new Promise((resolve) => setTimeout(resolve, 0));
    }

    W.setPixel(blocks[idx].x, blocks[idx].y, Window.red);

    const ans2 = `${blocks[idx].x},${blocks[idx].y}`;
    await Advent.Submit(ans2, 2);
}
Run();
