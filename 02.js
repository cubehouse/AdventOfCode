import { Advent as AdventLib } from './lib/advent.js';
const Advent = new AdventLib(2, 2021);

async function Run() {
    const input = await Advent.GetInput();

    const instr = input.map((x) => {
        const s = x.split(' ');
        return {
            op: s[0],
            val: Number(s[1]),
        };
    });

    let horz = 0;
    let depth = 0;
    instr.forEach((x) => {
        if (x.op === 'forward') {
            horz += x.val;
        } else if (x.op === 'down') {
            depth += x.val;
        } else if (x.op === 'up') {
            depth -= x.val;
        } else {
            throw new Error('unknown op ' + x.op);
        }
    });

    await Advent.Submit(horz * depth);

    let aim = 0;
    horz = 0;
    depth = 0;

    instr.forEach((x) => {
        if (x.op === 'forward') {
            horz += x.val;
            depth += x.val * aim;
        } else if (x.op === 'down') {
            aim += x.val;
        } else if (x.op === 'up') {
            aim -= x.val;
        } else {
            throw new Error('unknown op ' + x.op);
        }
    });

    await Advent.Submit(horz * depth, 2);
}
Run();
