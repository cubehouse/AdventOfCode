import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(7, 2024);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput(`190: 10 19
3267: 81 40 27
83: 17 5
156: 15 6
7290: 6 8 6 15
161011: 16 10 13
192: 17 8 14
21037: 9 7 18 13
292: 11 6 16 20`);

    const equations = input.map((line) => {
        const [left, right] = line.split(': ');
        return [parseInt(left), right.split(' ').map((x) => parseInt(x))];
    });

    const runTest = (target, values, ops) => {
        const testEquation = (current, remainingValues, target) => {
            if (remainingValues.length === 0) {
                if (current === target) {
                    // found a match
                    return 1;
                }
                // ran out of values to test
                return 0;
            }

            let result = 0;
            for (const op of ops) {
                result += testEquation(
                    op(current, remainingValues[0]),
                    remainingValues.slice(1),
                    target
                );
            }
            return result;
        };

        return testEquation(values[0], values.slice(1), target);
    };

    // sample test cases
    const p1Ops = [(a, b) => a + b, (a, b) => a * b];
    if (Advent.SampleMode) {
        const sampleAnswers = [1, 2, 0, 0, 0, 0, 0, 0, 1];
        for (let i = 0; i <= 8; i++) {
            const eq = equations[i];
            Advent.Assert(runTest(eq[0], eq[1], p1Ops), sampleAnswers[i]);
        }
    }

    const ans1 = equations.reduce((acc, [target, values]) => {
        if (runTest(target, values, p1Ops) > 0) {
            return acc + target;
        }
        return acc;
    }, 0);
    Advent.Assert(ans1, 3749);

    await Advent.Submit(ans1);

    const p2Ops = [
        (a, b) => a + b,
        (a, b) => a * b,
        (a, b) => Number(`${a}${b}`),
    ];
    const ans2 = equations.reduce((acc, [target, values]) => {
        if (runTest(target, values, p2Ops) > 0) {
            return acc + target;
        }
        return acc;
    }, 0);
    Advent.Assert(ans2, 11387);
    await Advent.Submit(ans2, 2);
}
Run();
