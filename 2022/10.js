import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(10, 2022);

// UI library
import Window from '../lib/window.js';

class PC {
    constructor() {
        this.X = 1;

        this.ticks = 0;
        this.tickCallbacks = [];

        this.program = [];
        this.PC = 0;

        this.cmds = {};
    }

    reset() {
        this.X = 1;
        this.ticks = 0;
        this.PC = 0;
    }

    loadProgram(program) {
        this.program = program.map((x) => {
            const [cmd, ...args] = x.split(' ');
            return { cmd, args: args && args.map(x => parseInt(x)) };
        });
    }

    addCmd(name, fn) {
        this.cmds[name] = fn;
    }

    onTick(callback) {
        this.tickCallbacks.push(callback);
    }

    async endTick() {
        this.ticks++;
        for (const callback of this.tickCallbacks) {
            await callback(this);
        }
    }

    get isHalted() {
        return this.PC >= this.program.length;
    }

    async tick() {
        await this.endTick();
        const line = this.program[this.PC];
        const cmd = this.cmds[line.cmd];
        if (!cmd) {
            throw new Error(`Unknown command ${line.cmd}`);
        }
        await cmd(this, ...line.args);

        this.PC++;
    }
}

async function Run() {
    const input = await Advent.GetInput();

    const PC1 = new PC();
    PC1.loadProgram(input);
    // add our commands
    PC1.addCmd('noop', async (pc) => { });
    PC1.addCmd('addx', async (pc, x) => {
        // force a tick before we change the value
        await pc.endTick();
        pc.X += x;
    });

    let sum1 = 0;
    PC1.onTick(async (pc) => {
        if ((pc.ticks - 20) % 40 === 0) {
            sum1 += pc.X * pc.ticks;
        }
    });

    while (!PC1.isHalted) {
        await PC1.tick();
    }
    
    await Advent.Submit(sum1);

    // part 2
    // hack to unset previous tick callback
    PC1.tickCallbacks.length = 0;
    PC1.reset(); // reset the PC

    const W = new Window({
        width: 40,
        height: 6,
    });
    W.loop();

    PC1.onTick(async (pc) => {
        let pixel = pc.ticks % 40;
        if (pixel === 0) pixel = 40;

        const pixelLit = Math.abs(pc.X - pixel + 1) < 2;

        W.setPixel(pixel - 1, Math.floor((pc.ticks - 1) / 40), pixelLit ? Window.red : Window.white);

        await new Promise((resolve) => setTimeout(resolve, 30));
    });

    while (!PC1.isHalted) {
        await PC1.tick();
    }
    await W.stop();
    // read the input and submit manually!
    // await Advent.Submit(null, 2);
}
Run();
