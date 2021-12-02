import { EventEmitter } from 'events';

export class OpMachine extends EventEmitter {
    /**
     * Create a new OpMachine instance
     * @param {string} [options.delim] How to split each line of the program into arguments (eg. ' )
     */
    constructor({ delim = ' ' } = {}) {
        super();

        this.state = 'idle';
        this.pc = 0;
        this.delim = delim || ' ';
    }

    // sample transformer for LoadProgram that converts all but the first element into a number
    static OpAndNumbers(args) {
        return [
            args[0],
            ...args.slice(1).map(Number),
        ];
    }

    /**
     * Load a program into the machine
     * Takes an optional transformer function that will be applied to each line of the program
     * eg. OpMachine.OpAndNumbers, which will treat the first element as the opcode and the rest as numbers
     * @param {array<String>} program 
     * @param {function} transformer 
     */
    LoadProgram(program, transformer = null) {
        this.program = program;

        this.mem = this.program.map((x) => {
            return transformer ? transformer(x.split(this.delim)) : x.split(this.delim);
        });

        this.state = 'loaded';
        this.emit('loaded');
    }

    /**
     * Manually set the PC
     * Note this will NOT fire any events
     * @param {Number} pc 
     */
    SetPC(pc) {
        this.pc = pc;
    }

    /**
     * Run each line of the program, firing events for each line
     * Events:
     *  - 'running' - emitted when the machine starts running
     *  - 'line' - emitted for each line with all arguments as an array
     *  - 'op_${opcode}' - emitted for each opcode with all other arguments as arguments
     *  - 'pc' - emitted when the program counter changes
     *  - 'idle' - emitted when the machine has finished
     */
    Run() {
        if (this.state !== 'loaded') {
            throw new Error('Machine not loaded');
        }

        this.state = 'running';
        this.emit('running');

        this.pc = 0;
        this.emit('pc', this.pc);

        while(this.pc < this.mem.length) {
            this.emit('line', this.mem[this.pc]);
            this.emit(`op_${this.mem[this.pc][0]}`, ...this.mem[this.pc].slice(1));
            this.pc++;
            this.emit('pc', this.pc);
        }

        this.state = 'idle';
        this.emit('idle');
    }
}

export default OpMachine;
