import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(13, 2024);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInputRaw(`Button A: X+94, Y+34
Button B: X+22, Y+67
Prize: X=8400, Y=5400

Button A: X+26, Y+66
Button B: X+67, Y+21
Prize: X=12748, Y=12176

Button A: X+17, Y+86
Button B: X+84, Y+37
Prize: X=7870, Y=6450

Button A: X+69, Y+23
Button B: X+27, Y+71
Prize: X=18641, Y=10279`);

    const machines = [];
    const machineRegex = /Button A: X((?:\+|\-)\d+), Y((?:\+|\-)\d+)\nButton B: X((?:\+|\-)\d+), Y((?:\+|\-)\d+)\nPrize: X=(\d+), Y=(\d+)/g;

    let match;
    while (match = machineRegex.exec(input)) {
        machines.push({
            a: { x: parseInt(match[1]), y: parseInt(match[2]) },
            b: { x: parseInt(match[3]), y: parseInt(match[4]) },
            prize: { x: parseInt(match[5]), y: parseInt(match[6]) },
        });
    }

    // cba.
    const bruteForceMachine = (machine) => {
        const validCombos = [];
        for (let x = 0; x < 100; x++) {
            for (let y = 0; y < 100; y++) {
                const pos = [
                    machine.a.x * x + machine.b.x * y,
                    machine.a.y * x + machine.b.y * y,
                ];

                if (pos[0] === machine.prize.x && pos[1] === machine.prize.y) {
                    validCombos.push({
                        x,
                        y,
                        cost: (x * 3) + y,
                    });
                }
            }
        }
        validCombos.sort((a, b) => a.cost - b.cost);

        return validCombos;
    };

    const validCombos = machines.map(bruteForceMachine);

    const ans1 = validCombos.reduce((acc, x) => {
        if (x.length === 0) {
            return acc;
        }
        return acc + x[0].cost;
    }, 0);
    Advent.Assert(ans1, 480);
    await Advent.Submit(ans1);

    // Part 2
    const validCombos2 = [];
    machines.forEach((machine) => {
        machine.prize.x += 10000000000000;
        machine.prize.y += 10000000000000;
        
        // damn linear algebra :|
        const a = machine.a.x;
        const b = machine.b.x;
        const c = machine.a.y;
        const d = machine.b.y;
        const e = machine.prize.x;
        const f = machine.prize.y;

        const det = (a * d) - (b * c);
        if (det !== 0) {
            const x = ((d * e) - (b * f)) / det;
            const y = ((a * f) - (c * e)) / det;

            // make sure it's a valid combo (i.e. x and y are both integers and >= 0)
            if (Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0) {
                validCombos2.push({
                    x,
                    y,
                    cost: (x * 3) + y,
                });
            }
        }
    });
    const ans2 = validCombos2.reduce((acc, p) => {
        return acc + p.cost;
    }, 0);
    await Advent.Submit(ans2, 2);
}
Run();
