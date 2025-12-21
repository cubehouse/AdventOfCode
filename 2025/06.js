import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(6, 2025);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const problems = [];
    input.forEach((line) => {
        const split = line.split(/\s+/).map((x) => x.trim()).filter((x) => x.length > 0);
        for (let i = 0; i < split.length; i++) {
            if (!problems[i]) problems[i] = [];
            problems[i].push(split[i]);
        }
    });
    problems.forEach((problem, idx) => {
        problems[idx] = {
            op: problem[problem.length - 1],
            args: problem.slice(0, -1).map(Number),
        };
    });
    
    const solve = (problem) => {
        let result = 0;
        switch (problem.op) {
            case '*':
                result = problem.args.reduce((a, b) => a * b, 1);
                break;
            case '+':
                result = problem.args.reduce((a, b) => a + b, 0);
                break;
            default:
                throw new Error(`Unknown operation: ${problem.op}`);
        }
        return result;
    };

    const part1 = problems.map(solve).reduce((a, b) => a + b, 0);
    await Advent.Submit(part1);

    // await Advent.Submit(null, 2);
}
Run();
