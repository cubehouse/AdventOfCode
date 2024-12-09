import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(9, 2024);

async function Run() {
    const input = await Advent.GetInput(`2333133121414131402`);

    const blocks = [];
    const ints = input.split('')
    for (let i = 0; i < ints.length; i += 2) {
        const a = ints[i];
        const b = ints[i + 1];

        blocks.push({
            id: i / 2,
            size: Number(a),
            freeSpace: Number(b) || 0,
        });
    }

    const blocksCopy = JSON.parse(JSON.stringify(blocks));

    let blockIndexWithFreeSpace = 0;
    const findBlockIndexWithFreeSpace = () => {
        if (blockIndexWithFreeSpace >= blocks.length) {
            return null;
        }
        if (blocks[blockIndexWithFreeSpace].freeSpace > 0) {
            return blockIndexWithFreeSpace;
        }
        blockIndexWithFreeSpace++;
        return findBlockIndexWithFreeSpace();
    };

    const findFreeBlock = () => {
        // get last entry of blocks
        const entry = blocks[blocks.length - 1];
        const freeBlockIndex = findBlockIndexWithFreeSpace();
        if (freeBlockIndex === null || blocks.length - 1 === freeBlockIndex) {
            // no more space, done
            return false;
        }

        const blockToInject = blocks[freeBlockIndex];
        if (blockToInject.id === entry.id) {
            // increment size of injection spot
            blockToInject.size++;
            blockToInject.freeSpace--;
        } else {
            // add a new block after the free block
            blocks.splice(freeBlockIndex + 1, 0, {
                id: entry.id,
                size: 1,
                freeSpace: blockToInject.freeSpace - 1,
            });
            blockToInject.freeSpace = 0;
        }

        entry.freeSpace++;
        entry.size--;

        // if entry is now empty, remove it
        if (entry.size === 0) {
            // add free space to the block before it
            const prevBlock = blocks[blocks.length - 2];
            prevBlock.freeSpace += entry.freeSpace;
            blocks.pop();
        }

        return true;
    };

    const debugPrint = () => {
        if (false) {
            console.log(blocksCopy.map(b => {
                return `${`${b.id}`.repeat(b.size)}${'.'.repeat(b.freeSpace)}`;
            }).join(''));
        }
    };

    while (findFreeBlock()) {}

    const ans1 = blocks.reduce((acc, block) => {
        for (let blockPos = acc.pos; blockPos < acc.pos + block.size; blockPos++) {
            acc.total += block.id * blockPos;
        }
        acc.pos += block.size;

        return acc;
    }, {
        pos: 0,
        total: 0,
    }).total;
    Advent.Assert(ans1, 1928);
    await Advent.Submit(ans1);

    // part 2
    const blockIds = blocksCopy.map(b => b.id);

    const findBlockIndex = (id) => {
        return blocksCopy.findIndex(b => b.id === id);
    };

    const findBlockIndexWithSpace = (spaceRequired) => {
        return blocksCopy.findIndex(b => b.freeSpace >= spaceRequired);
    };

    debugPrint();
    for (let blockId = blockIds[blockIds.length - 1]; blockId >= 0; blockId--) {
        // find block index we want to move
        const blockIndex = findBlockIndex(blockId);
        
        // find block index with space
        const spaceIndex = findBlockIndexWithSpace(blocksCopy[blockIndex].size);
        if (spaceIndex === -1 || spaceIndex >= blockIndex) {
            // no space, skip
            continue;
        }

        // move block
        const blockToMove = blocksCopy[blockIndex];

        // adjust free space
        blocksCopy[blockIndex - 1].freeSpace += blockToMove.size + blockToMove.freeSpace;
        blockToMove.freeSpace += blocksCopy[spaceIndex].freeSpace - blockToMove.size - blockToMove.freeSpace;

        blocksCopy.splice(blockIndex, 1);
        blocksCopy.splice(spaceIndex + 1, 0, blockToMove);

        blocksCopy[spaceIndex].freeSpace = 0;

        debugPrint();
    }

    const ans2 = blocksCopy.reduce((acc, block) => {
        for (let blockPos = acc.pos; blockPos < acc.pos + block.size; blockPos++) {
            acc.total += block.id * blockPos;
        }
        acc.pos += block.size + block.freeSpace;

        return acc;
    }, {
        pos: 0,
        total: 0,
    }).total;
    Advent.Assert(ans2, 2858);
    await Advent.Submit(ans2, 2);
}
Run();
