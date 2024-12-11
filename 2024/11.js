import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(11, 2024);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput(`125 17`);

    const stones = input.split(' ').map(Number);

    const blink = () => {
        for (let idx = 0; idx < stones.length; idx++) {
            const stone = stones[idx];
            if (stone === 0) {
                stones[idx] = 1;
                continue;
            }

            const stoneStr = `${stone}`;
            if (stoneStr.length % 2 == 0) {
                const lhs = stoneStr.slice(0, stoneStr.length / 2);
                const rhs = stoneStr.slice(stoneStr.length / 2);
                stones[idx] = Number(lhs);
                stones.splice(idx + 1, 0, Number(rhs));
                idx += 1;
                continue;
            }

            stones[idx] = stones[idx] * 2024;
        }
    };

    for (let i = 0; i < 25; i++) {
        blink();
    }
    const ans1 = stones.length;
    Advent.Assert(ans1, 55312);

    await Advent.Submit(ans1);

    // for (let i = 0; i < 50; i++) {
    //     blink();
    // }
    // const ans2 = stones.length;
    // await Advent.Submit(ans2, 2);
    
}
Run();
