import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(17, 2024);

// UI library
// import Window from '../lib/window.js';
import PCLib from '../lib/pc.js';

async function Run() {
    const input = await Advent.GetInput(`Register A: 729
Register B: 0
Register C: 0

Program: 0,1,5,4,3,0`);

    const reg = {
        A: 0,
        B: 0,
        C: 0,
    };
    const program = [];
    const PC = new PCLib();

    const regexReg = /Register ([\w]): (\d+)/;
    const regexProg = /Program: (.*)$/;
    input.forEach((line) => {
        if (regexReg.test(line)) {
            const [, regKey, val] = line.match(regexReg);
            reg[regKey] = BigInt(parseInt(val));
        }

        if (regexProg.test(line)) {
            const [, prog] = line.match(regexProg);
            const progArr = prog.split(',');
            program.push(...progArr.map(Number));
        }
    });
    const origReg = { ...reg };

    const getValue = (val) => {
        if (val >= 0 && val <= 3) {
            return BigInt(val);
        }
        if (val === 4) {
            return reg.A;
        }
        if (val === 5) {
            return reg.B;
        }
        if (val === 6) {
            return reg.C;
        }
        throw new Error(`Invalid register ${val}`);
    };
    const getValueDebugStr = (val) => {
        if (val >= 0 && val <= 3) {
            return val;
        }
        if (val === 4) {
            return 'reg.A';
        }
        if (val === 5) {
            return 'reg.B';
        }
        if (val === 6) {
            return 'reg.C';
        }
        return 'Unknown';
    };

    const output = [];

    // adv op
    PC.addOp(0, function (combo) {
        const val = BigInt(2) ** getValue(combo);
        if (PC.debug) {
            console.log(`adv: reg.A = ${reg.A} / 2^${getValueDebugStr(combo)} = ${reg.A / val}`);
        }
        reg.A = reg.A / val;
    }, true, 1);

    // bxl op
    PC.addOp(1, function (literal) {
        // XOR of B and literal input
        if (PC.debug) {
            console.log(`bxl: reg.B = ${reg.B} ^ ${literal} = ${reg.B ^ BigInt(literal)}`);
        }
        reg.B = reg.B ^ BigInt(literal);
    }, true, 1);

    // bst op
    PC.addOp(2, function (combo) {
        // set B to combo mod 8
        const val = getValue(combo);
        if (PC.debug) {
            console.log(`bst: reg.B = ${getValueDebugStr(combo)} % 8 = ${val % 8}`);
        }
        reg.B = val % BigInt(8);
    }, true, 1);

    // jnz op
    PC.addOp(3, function (literal) {
        if (reg.A == 0) {
            if (PC.debug) {
                console.log(`jnz: reg.A(${reg.A}) == 0, skipping`);
            }
            // move onto next instruction
            PC.setPC(PC.PC + 2);
            return;
        }

        if (PC.debug) {
            console.log(`jnz: reg.A(${reg.A}) != 0, jumping to ${literal}`);
        }

        // jump to literal
        PC.setPC(literal);
    }, false, 1);

    // bxc op
    PC.addOp(4, function (ignoredInstr) {
        // XOR of B and C
        if (PC.debug) {
            console.log(`bxc: reg.B = ${reg.B} ^ ${reg.C} = ${reg.B ^ reg.C}`);
        }
        reg.B = reg.B ^ reg.C;
    }, true, 1);

    // out op
    PC.addOp(5, function (combo) {
        // output literal
        const val = getValue(combo);
        if (PC.debug) {
            console.log(`out: outputting ${getValueDebugStr(combo)} % 8 = ${val % BigInt(8)}`);
        }
        // always output as 0-7, not BigInt
        output.push(Number(val % BigInt(8)));
    }, true, 1);

    // bdv op
    PC.addOp(6, function (combo) {
        const val = BigInt(2) ** getValue(combo);
        if (PC.debug) {
            console.log(`bdv: reg.B = ${reg.A} / 2^${getValueDebugStr(combo)} = ${reg.A / val}`);
        }
        reg.B = reg.A / val;
    }, true, 1);

    // cdv op
    PC.addOp(7, function (combo) {
        const val = BigInt(2) ** getValue(combo);
        if (PC.debug) {
            console.log(`cdv: reg.C = ${reg.A} / 2^${getValueDebugStr(combo)} = ${reg.A / val}`);
        }
        reg.C = reg.A / val;
    }, true, 1);

    const resetPC = () => {
        output.length = 0;
        reg.A = origReg.A;
        reg.B = origReg.B;
        reg.C = origReg.C;
        PC.setPC(0);
    };

    // inject into preprocessor
    PC.preprocessor = async (code) => {
        if (code === undefined) {
            PC.stop();
        }
        return code;
    };

    // test harness
    let testNum = 1;
    const runTest = async (testReg, program, expOutput, expReg, debug = false) => {
        console.log(`Running test ${testNum++}`);
        resetPC();
        PC.debug = debug;

        // apply test values to registers
        const regKeys = Object.keys(testReg);
        regKeys.forEach((key) => {
            reg[key] = BigInt(testReg[key]);
        });

        // load program
        PC.loadProgram(program);

        // run program
        await PC.run();

        if (expOutput) {
            // check output
            let mismatch = false;
            let matchedOutputs = 0;
            for (let i = 0; i < expOutput.length; i++) {
                if (output[i] !== expOutput[i]) {
                    console.error(`Output mismatch at ${i}: ${output[i]} !== ${expOutput[i]}`);
                    mismatch = true;
                } else {
                    matchedOutputs++;
                }
            }
            if (mismatch) {
                console.log('Output:', output);
            } else {
                // message with tick emoji
                console.log(`✅ ${matchedOutputs} outputs matched`);
            }
        }

        if (expReg) {
            const expRegKeys = Object.keys(expReg);
            let mismatch = false;
            let matchedRegs = 0;
            expRegKeys.forEach((key) => {
                if (reg[key] !== expReg[key]) {
                    mismatch = true;
                    console.error(`Register mismatch for ${key}: ${reg[key]} !== ${expReg[key]}`);
                } else {
                    matchedRegs++;
                }
            });
            if (mismatch) {
                console.log('Registers:', reg);
            } else {
                // message with tick emoji
                console.log(`✅ ${matchedRegs} registers matched`);
            }
        }

        PC.debug = false;
    };

    // Unit Tests
    // PC.debug = false;
    // await runTest({ C: 9 }, [2, 6], null, { B: 1 });
    // await runTest({ A: 10 }, [5, 0, 5, 1, 5, 4], [0, 1, 2], null);
    // await runTest({ A: 2024 }, [0, 1, 5, 4, 3, 0], [4, 2, 5, 6, 7, 7, 7, 7, 3, 1, 0], { A: 0 });
    // await runTest({ B: 29 }, [1, 7], null, { B: 26 });
    // await runTest({ B: 2024, C: 43690 }, [4, 0], null, { B: 44354 });
    // await runTest({ A: 729 }, [0, 1, 5, 4, 3, 0], [4, 6, 3, 5, 6, 3, 5, 2, 1, 0]);

    // run the program
    resetPC();
    PC.loadProgram(program);
    await PC.run();
    await Advent.Submit(output.join(","));


    // part 2
    const tryPC = async (idx) => {
        // reset and run the PC for each idx
        resetPC();
        reg.A = idx;
        await PC.run();
    }

    // build a list of inputs to try
    //  each time we find a partial match, we bit-shift it and add to the queue
    //  this should find the smallest valid answer by building up the possible routes and checking them in order
    const toTry = [ BigInt(0) ]; // start with idx 0
    while (toTry.length > 0) {
        // grab next input to try
        const idx = toTry.shift();
        // try each offset for 8 bits (0-7)
        for (let offset = BigInt(0); offset < BigInt(8); offset++) {
            await tryPC(idx + offset);

            // if output length matches, look for the full output match for our answer
            if (output.length === program.length) {
                let match = true;
                for (let i = 0; i < output.length; i++) {
                    if (output[i] !== program[i]) {
                        match = false;
                        break;
                    }
                }

                if (match) {
                    // found our answer, submit and exit loop
                    const ans2 = (idx + offset).toString();
                    await Advent.Submit(ans2, 2);
                    toTry.length = 0;
                    break;
                }
            } else if (output.length < program.length) {
                // find partial matches, this means our current input could be part of a possible answer
                let match = true;
                for (let i = 0; i < output.length; i++) {
                    if (output[i] !== program[program.length - output.length + i]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    // partial match found, bit shift and add to queue to try more combinations
                    const newIdx = (idx + offset) << BigInt(3);
                    toTry.push(newIdx);
                }
            }
        }
    }
}
Run();
