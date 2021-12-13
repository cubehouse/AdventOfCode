import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(2, 2021);

import { OpMachine } from '../lib/opmachine.js';

async function Run() {
    const input = await Advent.GetInput();

/*
    // Original Solution

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
*/

    // using new OpMachine class to try and help speed up puzzles like this one

    // part 1
    const opMachine = new OpMachine();
    opMachine.LoadProgram(input, OpMachine.OpAndNumbers);
    let horz = 0;
    let depth = 0;
    opMachine.on('op_forward', (val) => {
        horz += val;
    });
    opMachine.on('op_up', (val) => {
        depth -= val;
    });
    opMachine.on('op_down', (val) => {
        depth += val;
    });
    opMachine.Run();
    
    await Advent.Submit(horz * depth);

    // part 2
    const opMachine2 = new OpMachine();
    opMachine2.LoadProgram(input, OpMachine.OpAndNumbers);
    horz = 0;
    depth = 0;
    let aim = 0;
    opMachine2.on('op_forward', (val) => {
        horz += val;
        depth += val * aim;
    });
    opMachine2.on('op_up', (val) => {
        aim -= val;
    });
    opMachine2.on('op_down', (val) => {
        aim += val;
    });
    opMachine2.Run();

    await Advent.Submit(horz * depth, 2);
}
Run();
