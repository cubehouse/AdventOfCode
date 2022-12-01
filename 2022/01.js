import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(1, 2022);

async function Run() {
    const input = await Advent.GetInput();
    /*const input = `1000
2000
3000

4000

5000
6000

7000
8000
9000

10000`.split('\n');*/

    // == Part 1 ==

    // gather groups of calories
    const groups = [];
    groups.push([]);
    for (let i = 0; i < input.length; i++) {
        if (input[i] == '') {
            groups.push([]);
        } else {
            groups[groups.length - 1].push(Number(input[i]));
        }
    }
    // total up each group
    const sums = groups.map(g => g.reduce((a, b) => a + b, 0));
    // sort sums descending
    sums.sort((a, b) => b - a);
    
    // get largest group and submit
    await Advent.Submit(sums[0], 1);


    // == Part 2 ==
    // total top 3 groups
    const top3 = sums.slice(0, 3).reduce((a, b) => a + b, 0);

    await Advent.Submit(top3, 2);
}
Run();
