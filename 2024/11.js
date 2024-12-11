import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(11, 2024);

const cache = {};

async function Run() {
    const input = await Advent.GetInput(`125 17`);

    const stones = input.split(' ').map(Number);

    // expand stone value, returning how many stones are in the expanded state
    const _expandStone = (stone, depth) => {
        if (stone == 0) {
            return expandStone(1, depth - 1);
        }
        const stoneStr = `${stone}`;
        if (stoneStr.length % 2 == 0) {
            const lhs = stoneStr.slice(0, stoneStr.length / 2);
            const rhs = stoneStr.slice(stoneStr.length / 2);
            return expandStone(Number(lhs), depth - 1) + expandStone(Number(rhs), depth - 1);
        } else {
            return expandStone(stone * 2024, depth - 1);
        }
    }
    const expandStone = (stone, depth) => {
        if (depth == 0) {
            return 1;
        }

        const key = `${stone}_${depth}`;
        if (cache[key]) {
            return cache[key];
        }
        const size = _expandStone(stone, depth);
        cache[key] = size;
        return size;
    }

    const ans1 = stones.reduce((acc, stone) => acc + expandStone(stone, 25), 0);
    Advent.Assert(ans1, 55312);
    await Advent.Submit(ans1);

    const ans2 = stones.reduce((acc, stone) => acc + expandStone(stone, 75), 0);
    await Advent.Submit(ans2, 2);

}
Run();
