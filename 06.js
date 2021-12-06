import { Advent as AdventLib } from './lib/advent.js';
const Advent = new AdventLib(6, 2021);

async function Run() {
    const input = await Advent.GetInput();
    const input2 = `3,4,3,1,2`;

    const fishes = input.split(',').map(x => parseInt(x));

    const processFish = (fishes, cycleLength, initialOffset, days) => {
        // build array of cycleLength + initialOffset which we will shift along to add up
        const fish = new Array(cycleLength + initialOffset).fill(0);

        // add initial fish
        fishes.forEach((f) => {
            fish[f]++;
        });

        for(let day=0; day<days; day++) {
            // how many fish are we adding today? (remove from start of array)
            const newFish = fish.shift();
            // add our brand new fish at the end (which will now be at cycleLength + initialOffset days away)
            fish.push(newFish);
            // inject today's new fish (which will create even more fish) cycleLength days away
            fish[cycleLength - 1] += newFish;
        }

        // reduce to count up all our fish
        return fish.reduce((a, b) => a + b, 0);
    };

    const ans1 = processFish(fishes, 7, 2, 80);
    await Advent.Submit(ans1);

    const ans2 = processFish(fishes, 7, 2, 256);
    await Advent.Submit(ans2, 2);
}
Run();
