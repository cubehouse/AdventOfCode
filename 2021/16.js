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

    // sum
    opCode0(...args) {
        return args.reduce((acc, val) => acc + val, 0);
    }

    // product
    opCode1(...args) {
        return args.reduce((acc, val) => acc * val, 1);
    }

    // minimum
    opCode2(...args) {
        return Math.min(...args);
    }

    // maximum
    opCode3(...args) {
        return Math.max(...args);
    }

    // greater than
    opCode5(a, b) {
        return a > b ? 1 : 0;
    }

    // less than
    opCode6(a, b) {
        return a < b ? 1 : 0;
    }

    // equal
    opCode7(a, b) {
        return a === b ? 1 : 0;
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
            return val;
        } else {
            const lengthTypeID = this.read(1);
            const vals = [];
            if (lengthTypeID === 0) {
                const subpacketlength = this.read(15);
                const endPC = this.pc + subpacketlength;
                while (this.pc < endPC) {
                    this.depth++;
                    vals.push(this.parse());
                    this.depth--;
                }
            } else {
                const numSubpackets = this.read(11);
                for (let i = 0; i < numSubpackets; i++) {
                    if (this.debug) {
                        this.log('subpacket', i);
                    }
                    this.depth++;
                    vals.push(this.parse());
                    this.depth--;
                }
            }

            // process values based on opcode
            if (this.debug) {
                this.log('opcode', id, 'vals', vals);
            }
            const fnName = `opCode${id}`;
            if (!this[fnName]) {
                console.log('unknown opcode', id);
                return;
            }
            const val = this[fnName](...vals);
            if (this.debug) {
                this.log('result', val);
            }
            return val;
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

    // part 2 tests
    const testPC = (prog, expResult, debug = false) => {
        const testPC = new PC(prog, {
            debug,
        });
        if (testPC.parse() !== expResult) {
            throw new Error('test failed');
        }
    };

    testPC('C200B40A82', 3);
    testPC('04005AC33890', 54);
    testPC('880086C3E88112', 7);
    testPC('CE00C43D881120', 9);
    testPC('D8005AC2A8F0', 1);
    testPC('F600BC2D8F', 0);
    testPC('9C005AC2F8F0', 0);
    testPC('9C0141080250320F1802104A08', 1);
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


    // part 2
    const ans2pc = new PC(input);
    const ans2 = ans2pc.parse();
    await Advent.Submit(ans2, 2);
}
Run();
