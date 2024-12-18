import EventEmitter from 'events';

export class PC extends EventEmitter {
    constructor({ memory = [] } = {}) {
        super();

        this.memory = memory;
        this.PC = 0;
        this.ops = {};
        this.running = false;
        
        this.inputs = [];
        // array of promises wanting for inputs
        this.inputWaits = [];

        this.outputs = [];

        this.debug = false;
    }

    get(address) {
        if (this.debug) {
            //console.log(`get ${address} = ${this.memory[address]}`);
        }
        return this.memory[address];
    }

    set(address, value) {
        if (this.debug) {
            console.log(`set ${address} = ${value}`);
        }
        this.memory[address] = value;
    }

    getPC() {
        return this.PC;
    }

    setPC(value) {
        this.PC = value;
    }

    jump(address) {
        this.setPC(address);
    }

    incPC() {
        this.PC++;
    }

    decPC() {
        this.PC--;
    }

    inc(address) {
        this.memory[address]++;
    }

    dec(address) {
        this.memory[address]--;
    }

    add(address, value) {
        this.memory[address] += value;
    }

    sub(address, value) {
        this.memory[address] -= value;
    }

    mul(address, value) {
        this.memory[address] *= value;
    }

    div(address, value) {
        this.memory[address] /= value;
    }

    mod(address, value) {
        this.memory[address] %= value;
    }

    and(address, value) {
        this.memory[address] &= value;
    }

    or(address, value) {
        this.memory[address] |= value;
    }

    xor(address, value) {
        this.memory[address] ^= value;
    }

    not(address) {
        this.memory[address] = ~this.memory[address];
    }

    /**
     * Push a value onto the end of our memory
     * @param {*} value 
     */
    push(value) {
        this.memory.push(value);
    }

    /**
     * Pop the last value of memory
     * @returns {*}
     */
    pop() {
        return this.memory.pop();
    }

    /**
     * Add an operation to the processor
     * @param {String} op 
     * @param {functiom} func 
     */
    addOp(op, func, autoIncrement = true, args = 1) {
        this.ops[op] = {
            func,
            autoIncrement,
            args,
        };
    }

    async preprocessor(code) {
        return code;
    }

    /**
     * Tick our processor one step, using the current PC value
     */
    async tick() {
        // Get the opcode
        let op = await this.preprocessor(this.get(this.PC));

        if (!this.running) {
            return;
        }

        // Get the opcode function
        let func = this.ops[op];

        // call the function for this opcode
        if (func && func.func) {
            let args = [];
            for (let i = 0; i < func.args; i++) {
                args.push(this.get(this.PC + i + 1));
            }
            if (this.debug) {
                console.log(`calling [${this.PC}]: ${op} (${args.join(', ')})`);
            }
            await func.func.call(this, ...args);
        } else {
            this.emit('error', `Unknown opcode ${op}`);
            console.error(`Unknown op: ${op}`);
        }

        // move program counter along
        if (func && func.autoIncrement) {
            this.setPC(this.PC + func.args + 1);
        }
    }

    /**
     * Run the processor until we hit a halt opcode
     * @returns {Promise}
     */
    async run() {
        this.running = true;
        while (this.running) {
            await this.tick();
        }
        return this.get(this.PC);
    }

    /**
     * Stop the processor
     */
    stop() {
        this.running = false;
    }

    /**
     * Load a new program into memory
     */ 
    loadProgram(program) {
        this.memory = program;
    }

    /**
     * Push a new input value into the PC
     */
    input(value) {
        this.inputs.push(value);

        // resolve any waiting promises
        if (this.inputWaits.length > 0) {
            this.inputWaits.shift()(value);
        }
    }

    async getInput() {
        if (this.inputs.length > 0) {
            return this.inputs.shift();
        }

        // wait for input
        return new Promise((resolve) => {
            this.inputWaits.push(resolve);
        });
    }

    output(value) {
        this.outputs.push(value);

        console.log(`output: ${value}`);
    }

    getOutput() {
        return this.outputs;
    }
}

export default PC;
