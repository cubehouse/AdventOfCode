import PC from '../lib/pc.js';

const run = async () => {
    const Intcode = new PC();
    let modes = [
        0, 0, 0,
    ];
    const getMode = (address, idx) => {
        switch (modes[idx]) {
            case 0:
                return Intcode.get(address);
            case 1:
                return address;
            case 2:
                return Intcode.get(address + Intcode.relativeBase);
            default:
                throw new Error(`Invalid mode ${modes[idx]}`);
        }
    };
    const setMode = (idx, mode) => {
        modes[idx] = mode;
    };
    Intcode.preprocessor = (code) => {
        const opcode = code % 100;
        const modes = code.toString().split('').reverse().slice(2).map(Number);
        setMode(0, modes[0] || 0);
        setMode(1, modes[1] || 0);
        setMode(2, modes[2] || 0);
        return opcode;
    };

    // Intcode.debug = true;
    Intcode.relativeBase = 0;
    Intcode.addOp(1, function (a, b, c) { this.set(c, getMode(a, 0) + getMode(b, 1)); }, true, 3);
    Intcode.addOp(2, function (a, b, c) { this.set(c, getMode(a, 0) * getMode(b, 1)); }, true, 3);
    Intcode.addOp(3, async function (a) {
        this.set(a, await Intcode.getInput());
    }, true, 1);
    Intcode.addOp(4, function (a) { Intcode.output(getMode(a, 0)); }, true, 1);
    Intcode.addOp(5, function (a, b) {
        if (getMode(a, 0) !== 0) {
            this.jump(getMode(b, 1) - 3);
        }
    }, true, 2);
    Intcode.addOp(6, function (a, b) {
        if (getMode(a, 0) === 0) {
            this.jump(getMode(b, 1) - 3);
        }
    }, true, 2);
    Intcode.addOp(7, function (a, b, c) {
        this.set(c, getMode(a, 0) < getMode(b, 1) ? 1 : 0);
    }, true, 3);
    Intcode.addOp(8, function (a, b, c) {
        this.set(c, getMode(a, 0) === getMode(b, 1) ? 1 : 0);
    }, true, 3);
    Intcode.addOp(9, function (a) {
        this.relativeBase += getMode(a, 0);
    }, true, 1);
    Intcode.addOp(99, () => {
        Intcode.stop();
    }, false, 0);

    // run Hello World program
    Intcode.loadProgram([4, 3, 101, 72, 14, 3, 101, 1, 4, 4, 5, 3, 16, 99, 29, 7, 0, 3, -67, -12, 87, -8, 3, -6, -8, -67, -23, -10]);
    Intcode.input(5);
    await Intcode.run();
    console.log(Intcode.getOutput().map(x => String.fromCharCode(x)).join(''));
};

run();
