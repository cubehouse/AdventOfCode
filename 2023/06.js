import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(6, 2023);

// UI library
// import Window from '../lib/window.js';

class Race {
    constructor(time, distance) {
        this.time = time;
        this.distance = distance;
    }

    TestAccelerationTime(time_accelerator_held = 0) {
        // distance travelled is
        //  (this.time - time_accelerator_held) * time_accelerator_held
        // BUG: didn't read the question right, we don't travel while accelerator is held
        //    + Math.floor(0.5 * time_accelerator_held * time_accelerator_held)
        return (this.time - time_accelerator_held) * time_accelerator_held;
    }

    Part1() {
        // test all times
        const validTimes = [];
        for(let time = 0; time <= this.time; time++) {
            const distance = this.TestAccelerationTime(time);
            if(distance > this.distance) {
                validTimes.push(time);
            }
        }
        return validTimes;
    }
}

async function Run() {
    const input = await Advent.GetInput();

    const times = input[0].substring(6).split(/\s+/).splice(1).map(Number);
    const distances = input[1].substring(10).split(/\s+/).splice(1).map(Number);

    const races = [];
    times.forEach((time, idx) => {
        const race = new Race(time, distances[idx]);
        races.push(race);
    });

    // unit test the sample data
    Advent.Assert(races[0].TestAccelerationTime(0), 0);
    Advent.Assert(races[0].TestAccelerationTime(1), 6);
    Advent.Assert(races[0].TestAccelerationTime(2), 10);
    Advent.Assert(races[0].TestAccelerationTime(3), 12);
    Advent.Assert(races[0].TestAccelerationTime(4), 12);
    Advent.Assert(races[0].TestAccelerationTime(5), 10);
    Advent.Assert(races[0].TestAccelerationTime(6), 6);
    Advent.Assert(races[0].TestAccelerationTime(7), 0);
    Advent.Assert(races[0].Part1().length, 4);
    Advent.Assert(races[1].Part1().length, 8);
    Advent.Assert(races[2].Part1().length, 9);

    const ans1 = races.map((race) => {
        return race.Part1().length;
    }).reduce((p, x) => p * x, 1);

    await Advent.Submit(ans1);

    // == Part 2 ==
    const race2 = new Race(
        parseInt(input[0].substring(6).replace(/[^\d]+/g, '')),
        parseInt(input[1].substring(9).replace(/[^\d]+/g, ''))
    );
    const ans2 = race2.Part1().length;
    await Advent.Submit(ans2, 2);
}
Run();
