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
            // argsStr: problem.slice(0, -1),
            maxDigits: Math.max(...problem.slice(0, -1).map((x) => x.length)),
        };
    });
    // some nonense to get the argsStr with the original whitespace so columns line up later
    let idxOffset = 0;
    problems.forEach((problem) => {
        problem.argsStr = problem.args.map((arg, idx) => {
            const str = input[idx].slice(idxOffset, idxOffset + problem.maxDigits);
            return str;
        });
        idxOffset += problem.maxDigits + 1; // +1 for space
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

    // part 2
    // reprocess our problems with the new right-to-left order nonsense
    problems.forEach((problem) => {
        const newArgs = [];

        for (let digitIdx = problem.argsStr.length - 1; digitIdx >= 0; digitIdx--) {
            let digits = [];
            problem.argsStr.forEach((argStr) => {
                if (argStr.length > digitIdx) {
                    digits.push(argStr[digitIdx]);
                } else {
                    digits.push('0');
                }
            });
            newArgs.push(Number(digits.join('')));
        }
        problem.args = newArgs.filter((x) => {
            return x > 0;
        })
    });

    console.log(problems);

    const part2 = problems.map(solve).reduce((a, b) => a + b, 0);
    await Advent.Submit(part2, 2);
}
Run();
