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

    // build mapping of all replacements possible
    const map = input.slice(2).map((x) => {
        return x.split(' -> ');
    }).reduce((acc, x) => {
        acc[x[0]] = [
            `${x[0][0]}${x[1]}`,
            `${x[1]}${x[0][1]}`,
        ];
        return acc;
    }, {});

    // track symbol pair occurences
    const symbols = Object.values(map).reduce((acc, x) => {
        acc[x[0]] = 0;
        acc[x[1]] = 0;
        return acc;
    }, {});
    Object.keys(map).forEach((x) => {
        symbols[x] = 0;
    });

    // initial symbol set from our initial sequence
    const seq = input[0].split('');
    for (let i = 1; i < seq.length; i++) {
        const x = `${seq[i - 1]}${seq[i]}`;
        symbols[x]++;
    }

    // separately count each symbol added for the answer
    const count = Object.keys(symbols).reduce((acc, x) => {
        acc[x[0]] = 0;
        acc[x[1]] = 0;
        return acc;
    }, {});
    seq.forEach((x) => {
        count[x]++;
    });

    // step function
    const step = () => {
        const newSym = Object.keys(symbols).reduce((acc, x) => {
            const mapping = map[x];
            mapping.forEach((y) => {
                acc[y] = (acc[y] || 0) + (symbols[x] || 0);
            });
            count[mapping[0][1]] += symbols[x] || 0;
            return acc;
        }, {});
        
        // update symbol object
        Object.keys(symbols).forEach((x) => {
            symbols[x] = newSym[x] === undefined ? 0 : newSym[x];
        });
    };
    
    for (let i = 0; i < 10; i++) {
        step();
    }
    const ans1 = Math.max(...Object.values(count)) - Math.min(...Object.values(count));

    await Advent.Submit(ans1);

    // part 2
    //  OH. it's lanternfish again! Optimising........

    for (let i = 0; i < 30; i++) {
        step();
    }
    const ans2 = Math.max(...Object.values(count)) - Math.min(...Object.values(count));
    await Advent.Submit(ans2, 2);
}
Run();
