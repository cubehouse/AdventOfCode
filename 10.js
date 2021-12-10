import { Advent as AdventLib } from './lib/advent.js';
const Advent = new AdventLib(10, 2021);

async function Run() {
    const input = await Advent.GetInput();
    const input2 = `[({(<(())[]>[[{[]{<()<>>
[(()[<>])]({[<{<<[]>>(
{([(<{}[<>[]}>{[]{[(<()>
(((({<>}<{<{<>}{[]{[]{}
[[<[([]))<([[{}[[()]]]
[{[{({}]{}}([{[{{{}}([]
{<[[]]>}<{[{[{[]{()[[[]
[<(<(<(<{}))><([]([]()
<{([([[(<>()){}]>(<<{{
<{([{{}}[<[[[<>{}]]]>[]]`.split(/\n/);

    const chars = {
        '(': ')',
        '[': ']',
        '<': '>',
        '{': '}',
    };

    const pairs = Object.keys(chars).map(key => [key, chars[key]].join(''));

    // return undefined if all is fine, otherwise return invalid character
    const validate = (line) => {
        // remove valid pairs of symbols until we cannot find any more
        while (pairs.find((pair) => {
            const newLine = line.replace(pair, '');
            if (newLine !== line) {
                line = newLine;
                return true;
            }
            return false;
        }) !== undefined) {}
        return line.split('').find((x) => {
            return Object.values(chars).indexOf(x) >= 0;
        });
    };

    const invalidChars = input.map(validate);
    const points = {
        ')': 3,
        ']': 57,
        '}': 1197,
        '>': 25137,
    };
    const ans1 = invalidChars.reduce((acc, x) => {
        return acc + (points[x] || 0);
    }, 0);

    await Advent.Submit(ans1);
    // await Advent.Submit(null, 2);
}
Run();
