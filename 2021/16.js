import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(16, 2021);

// UI library
// import Window from '../lib/window.js';

function binToInt(bin) {
    return parseInt(bin, 2);
}

function hexToBin(hex) {
    return hex.split('').map(c => parseInt(c, 16).toString(2).padStart(4, '0')).join('');
}

class PC {
    constructor(program, options = { debug: false }) {
        this.prog = hexToBin(program).split('');
        this.pc = 0;
        this.debug = !!options.debug;
        this.depth = 0;

        this.versions = [];
        this.outputs = [];
    }

    log(...args) {
        if (this.depth === 0) {
            console.log(...args);
        } else {
            console.log(' '.repeat(this.depth), ...args);
        }
    }

    read(len, {
        movePC = true,
        binary = false,
    } = {}) {
        if (this.debug) {
            //this.log(`read ${len} @`, this.pc, ':', this.prog.slice(this.pc, this.pc + len).join(''));
        }
        const bin = this.prog.slice(this.pc, this.pc + len).join('');
        const ret = binary ? bin : binToInt(bin);
        if (movePC) {
            this.pc += len;
        }
        return ret;
    }

    readLiteralValue() {
        let leadingBit = 1;
        const bits = [];
        while (leadingBit === 1) {
            leadingBit = this.read(1);
            bits.push(this.read(4, {
                binary: true,
            }));
        }
        const val = binToInt(bits.join(''));
        if (this.debug) {
            this.log('bits', bits);
            this.log('readLiteralValue', val);
        }
        return val;
    }

    parse() {
        if (this.debug) {
            this.log('parse', this.pc, this.prog.slice(this.pc).join(''));
        }
        const version = this.read(3);
        this.versions.push(version);
        const id = this.read(3);

        if (this.debug) {
            this.log(`version: ${version}, id: ${id}`);
        }

        if (id === 4) {
            const val = this.readLiteralValue();
            this.outputs.push(val);
        } else {
            const lengthTypeID = this.read(1);
            if (lengthTypeID === 0) {
                const subpacketlength = this.read(15);
                const endPC = this.pc + subpacketlength;
                while (this.pc < endPC) {
                    this.depth++;
                    this.parse();
                    this.depth--;
                }
            } else {
                const numSubpackets = this.read(11);
                for (let i = 0; i < numSubpackets; i++) {
                    if (this.debug) {
                        this.log('subpacket', i);
                    }
                    this.depth++;
                    this.parse();
                    this.depth--;
                }
            }
        }
    }
}

async function Test() {
    // test cases
    const pc1 = new PC('D2FE28', {
        debug: false,
    });
    pc1.parse();
    if (pc1.outputs.length !== 1 || pc1.outputs[0] !== 2021) {
        throw new Error('test 1 failed');
    }

    const pc2 = new PC('38006F45291200', {
        debug: false,
    });
    pc2.parse();
    if (pc2.outputs.length !== 2 || pc2.outputs[0] !== 10 || pc2.outputs[1] !== 20) {
        throw new Error('test 2 failed');
    }

    const pc3 = new PC('EE00D40C823060', {
        debug: false,
    });
    pc3.parse();
    if (pc3.outputs.length !== 3 || pc3.outputs[0] !== 1 || pc3.outputs[1] !== 2 || pc3.outputs[2] !== 3) {
        throw new Error('test 3 failed');
    }
}

async function Run() {
    const input = await Advent.GetInput();

    // run sample test cases
    Test();

    // part 1
    const ans1pc = new PC(input);
    ans1pc.parse();
    const ans1 = ans1pc.versions.reduce((acc, v) => acc + v, 0);
    await Advent.Submit(ans1);

    // await Advent.Submit(null, 2);
}
Run();
