import { Advent as AdventLib } from './lib/advent.js';
const Advent = new AdventLib(6, 2021);

async function Run() {
    const input = await Advent.GetInput();
    const input2 = [`3,4,3,1,2`];

    const fishes = input.split(',').map(x => parseInt(x));

    const processFish = (fishes, cycleLength, initialOffset, days) => {
        const fish = [];
        // mess with our intial fish values so we can calculate the number of births
        fishes.forEach(f => {
            fish.push(f - cycleLength);
        });

        let current = 0;
        while(current < fish.length) {
            // do some MATH to figure out how many fish each fish will birth
            const fishCycles = Math.floor((days - 1 - fish[current]) / cycleLength);
            for(let i=0; i<fishCycles; i++) {
                // then add each fish with a value that tells us how many fish they will birth too
                const newFishVal = fish[current] + (i + 1) * cycleLength + initialOffset;
                fish.push(newFishVal);
            }
            current++;
        }
        return fish.length;
    };

    const ans1 = processFish(fishes, 7, 2, 80);
    await Advent.Submit(ans1);

    // await Advent.Submit(null, 2);
}
Run();
