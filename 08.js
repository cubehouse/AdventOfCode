import { Advent as AdventLib } from './lib/advent.js';
const Advent = new AdventLib(8, 2021);

async function Run() {
    const input = await Advent.GetInput();
    const input2 = `be cfbegad cbdgef fgaecd cgeb fdcge agebfd fecdb fabcd edb | fdgacbe cefdb cefbgd gcbe
edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec | fcgedb cgb dgebacf gc
fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef | cg cg fdcagb cbg
fbegcd cbd adcefb dageb afcb bc aefdc ecdab fgdeca fcdbega | efabcd cedba gadfec cb
aecbfdg fbg gf bafeg dbefa fcge gcbea fcaegb dgceab fcbdga | gecf egdcabf bgf bfgea
fgeab ca afcebg bdacfeg cfaedg gcfdb baec bfadeg bafgc acf | gebdcfa ecba ca fadegcb
dbcfg fgd bdegcaf fgec aegbdf ecdfab fbedc dacgb gdcebf gf | cefg dcbef fcge gbcadfe
bdfegc cbegaf gecbf dfcage bdacg ed bedf ced adcbefg gebcd | ed bcgafe cdgba cbgef
egadfb cdbfeg cegd fecab cgb gbdefca cg fgcdab egfdb bfceg | gbdfcae bgc cg cgb
gcafb gcf dcaebfg ecagb gf abcdeg gaef cafbge fdbac fegbdc | fgae cfgab fg bagce`.split('\n');

    const lines = input.map((line) => {
        return line.split('|').map((x) => x.split(' ').map((b) => b.split('')).filter((x) => x.length > 0));
    });
    lines.forEach((x) => {
        x[0].forEach(y => y.sort());
        x[0] = x[0].map(x => x.join(''));
        x[1].forEach(y => y.sort());
        x[1] = x[1].map(x => x.join(''));
    });
    // console.log(lines[0]);

    // console.log(sequence, result);

    // part 1
    const ans1 = lines.reduce((acc, line) => {
        return acc + line[1].reduce((acc, x) => {
            switch (x.length) {
                case 2:
                case 3:
                case 4:
                case 7:
                    return acc + 1;
                default:
                    return acc;
            }
        }, 0);
    }, 0);

    await Advent.Submit(ans1);

    // part 2

    const findItemsOfLength = (line, length) => {
        // console.log(line);
        return line.filter((x) => x.length === length);
    };

    const removeMatches = (a, b) => {
        const aarr = a.split('');
        const barr = b.split('');
        const aFiltered = aarr.filter((x) => !barr.includes(x));
        const bFiltered = barr.filter((x) => !aarr.includes(x));
        return [...aFiltered, ...bFiltered];
    };

    // return letters in a that are not in b
    const missingFromB = (a, b) => {
        const aarr = a.split('');
        const barr = b.split('');
        return aarr.filter((x) => !barr.includes(x));
    };

    const solveNumbers = (line) => {
        const segments = {};
        // calculate a by comparing 1 and 7
        const numbers = {
            1: findItemsOfLength(line[0], 2)[0],
            7: findItemsOfLength(line[0], 3)[0],
            4: findItemsOfLength(line[0], 4)[0],
            8: findItemsOfLength(line[0], 7)[0],
        };
        segments['a'] = removeMatches(numbers[1], numbers[7])[0];

        // figure out c and f (components of 1)
        //  0, 6, and 9 all contain 6 digits, but 6 is missing c
        //  deduce c by finding digit without any segments from 1
        const zeroSixNine = findItemsOfLength(line[0], 6);
        numbers[6] = zeroSixNine.find((x) => {
            return numbers[1].split('').find((y) => !x.includes(y));
        });
        segments['c'] = missingFromB(numbers[1], numbers[6])[0];
        segments['f'] = missingFromB(numbers[1], segments['c'])[0];

        // numbers with 5 segments
        const twoThreeFive = findItemsOfLength(line[0], 5);
        // 3 contains all the segments from 7
        numbers[3] = twoThreeFive.find((x) => {
            const numSplit = x.split('');
            return numbers[7].split('').filter((y) => numSplit.includes(y)).length === 3;
        });
        // 2 and 5 differ by segment c, so deduce 2 and 5 by comparing absense of c
        numbers[2] = twoThreeFive.find((x) => {
            return x != numbers[3] && x.split('').includes(segments['c']);
        });
        numbers[5] = twoThreeFive.find((x) => {
            return x !== numbers[2] && x !== numbers[3];
        });

        // we can compare 5 and 6 to find segment e
        segments['e'] = removeMatches(numbers[5], numbers[6])[0];
        // ... which lets us figure out 0 and 9
        numbers[9] = zeroSixNine.find((x) => {
            return x !== numbers[6] && !x.split('').includes(segments['e']);
        });
        numbers[0] = zeroSixNine.find((x) => {
            return x !== numbers[6] && x !== numbers[9];
        });

        // reverse our mapping so it's easy to go from letters -> digit
        const lookupMap = Object.keys(numbers).reduce((acc, key) => {
            acc[numbers[key]] = Number(key);
            return acc;
        }, {});

        return lookupMap;
    };

    const outputs = lines.map((x) => {
        const lookupMap = solveNumbers(x);
        const digits = x[1].map((y) => {
            return lookupMap[y];
        });
        return Number(digits.join(''));
    });
    const ans2  = outputs.reduce((acc, x) => {
        return acc + x;
    }, 0);

    await Advent.Submit(ans2, 2);
}
Run();
