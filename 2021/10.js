import { Advent as AdventLib } from '../lib/advent.js';
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

    // returns [line, firstInvalidCharacter]
    const validate = (line) => {
        // remove valid pairs of symbols until we cannot find any more
        while (pairs.find((pair) => {
            const newLine = line.replace(pair, '');
            if (newLine !== line) {
                line = newLine;
                return true;
            }
            return false;
        }) !== undefined) { }
        return [line, line.split('').find((x) => {
            return Object.values(chars).indexOf(x) >= 0;
        })];
    };

    const results = input.map(validate);
    const points = {
        ')': 3,
        ']': 57,
        '}': 1197,
        '>': 25137,
    };
    const ans1 = results.reduce((acc, x) => {
        return acc + (points[x[1]] || 0);
    }, 0);

    await Advent.Submit(ans1);

    // part 2

    // filter out lines that have no syntax error in part 1
    const incompleteLines = results.filter((x) => x[1] === undefined).map((x) => x[0]);

    // note we're scoring the opening brackets
    //  the "solution" to closing each line is the reverse of the remaining line
    //  so let's just add up the symbols we already have
    const points2 = {
        '(': 1,
        '[': 2,
        '{': 3,
        '<': 4,
    };
    const scores = incompleteLines.map((line) => {
        // reverse the line so we get the "closing symbols" in the correct order
        const chars = line.split('').reverse();
        return chars.reduce((acc, x) => {
            return (acc * 5) + points2[x];
        }, 0);
    });
    // grab the median score
    scores.sort((a, b) => b - a);
    const ans2 = scores[(scores.length - 1) / 2];

    await Advent.Submit(ans2, 2);
}
Run();
