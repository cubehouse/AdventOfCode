import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(5, 2023);

// UI library
// import Window from '../lib/window.js';

class Mapping {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.ranges = [];
    }

    AddRange(source_start, destination_start, length) {
        this.ranges.push({
            source_start,
            source_end: source_start + length - 1,
            destination_start,
            destination_end: destination_start + length - 1,
            length,
        });
    }

    Map(value) {
        // map the value to first matching range
        for (const range of this.ranges) {
            if (value >= range.source_start && value <= range.source_end) {
                return range.destination_start + (value - range.source_start);
            }
        }

        // if no mapping exists, return the value unchanged
        return value;
    }
}

async function Run() {
    const input = await Advent.GetInput();

    const seeds = input[0].substring(7).split(' ').map(x => parseInt(x)).map((x) => {
        return {
            seed: x,
        };
    });
    
    const maps = [];
    var idx = 1;
    while(idx < input.length) {
        // look for "x-to-y map:" string
        const reg = /(\w+)-to-(\w+) map:/;
        const match = reg.exec(input[idx]);
        if (!match) {
            idx++;
            continue;
        }
        const mapping = new Mapping(match[1], match[2]);
        idx++;
        while(input[idx] !== '' && idx < input.length) {
            const range = input[idx].split(' ').map(x => parseInt(x));
            mapping.AddRange(range[1], range[0], range[2]);
            idx++;
        }
        maps.push(mapping);
    }

    // unit tests against sample input
    Advent.Assert(maps[0].Map(79), 81);
    Advent.Assert(maps[0].Map(14), 14);
    Advent.Assert(maps[0].Map(55), 57);
    Advent.Assert(maps[0].Map(13), 13);

    seeds.forEach((seed) => {
        maps.forEach((mapping) => {
            seed[mapping.to] = mapping.Map(seed[mapping.from]);
        });
    });
    Advent.Assert(seeds[0].location, 82);
    Advent.Assert(seeds[1].location, 43);
    Advent.Assert(seeds[2].location, 86);
    Advent.Assert(seeds[3].location, 35);
    
    const ans1 = Math.min(...seeds.map(x => x.location));
    await Advent.Submit(ans1);

    // brute force solution for part 2
    //  not proud, but this runs faster than I could write a better solution =)
    const seeds2Input = input[0].substring(7).split(' ').map(x => parseInt(x));
    let bestSeedLocation = 1000000000;
    for (var i = 0; i < seeds2Input.length; i+=2) {
        const start = seeds2Input[i];
        const end = seeds2Input[i] + seeds2Input[i+1] - 1;
        for(var j = start; j <= end; j++) {
            const seed = {
                seed: j,
            };
            maps.forEach((mapping) => {
                seed[mapping.to] = mapping.Map(seed[mapping.from]);
            });
            if (seed.location < bestSeedLocation) {
                bestSeedLocation = seed.location;
            }
        }
    }
    const ans2 = bestSeedLocation;
    Advent.Assert(ans2, 46);
    await Advent.Submit(ans2, 2);
}
Run();
