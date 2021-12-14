import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(14, 2021);

async function Run() {
    const input = await Advent.GetInput();
    const input2 = `NNCB

CH -> B
HH -> N
CB -> H
NH -> C
HB -> C
HC -> B
HN -> C
NN -> C
BH -> H
NC -> B
NB -> B
BN -> B
BB -> N
BC -> B
CC -> N
CN -> C`.split(/\n/);

    const sequence = input[0].split('');
    const map = input.slice(2).map((x) => {
        return x.split(' -> ');
    });

    const step = () => {
        for (let i = 1; i < sequence.length; i++) {
            const pair = `${sequence[i - 1]}${sequence[i]}`;
            const match = map.find((x) => x[0] === pair);
            if (match) {
                sequence.splice(i, 0, match[1]);
            } else {
                throw new Error(`No match for ${pair}`);
            }
            i++;
        }
    };

    for (let i = 0; i < 10; i++) {
        step();
    }
    const charCount = sequence.reduce((acc, x) => {
        acc[x] = (acc[x] || 0) + 1;
        return acc;
    }, {});
    const ans1 = Math.max(...Object.values(charCount)) - Math.min(...Object.values(charCount));

    await Advent.Submit(ans1);
    // await Advent.Submit(null, 2);
}
Run();
