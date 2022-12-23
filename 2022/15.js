import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(15, 2022);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const sensors = input.map((x) => {
        // match sensors like "Sensor at x=0, y=11: closest beacon is at x=2, y=10"
        const match = x.match(/Sensor at x=([-\d]+), y=([-\d]+): closest beacon is at x=([-\d]+), y=([-\d]+)/);
        if (!match) {
            throw new Error(`Invalid input: ${x}`);
        }
        const s = {
            x: parseInt(match[1]),
            y: parseInt(match[2]),
            beaconX: parseInt(match[3]),
            beaconY: parseInt(match[4]),
        };
        // calculate distance to beacon for each sensor
        s.distance = Math.abs(s.x - s.beaconX) + Math.abs(s.y - s.beaconY);
        return s;
    });


    const getRangesForY = (y) => {
        const ranges = [];
        sensors.forEach((sensor) => {
            // is sensor y within sensor.distance of y
            if (Math.abs(sensor.y - y) <= sensor.distance) {
                // sensor in range of our chosen line
                // how far are we from the edge of the sensor distance?
                const distanceFromEdge = sensor.distance - Math.abs(sensor.y - y);
                ranges.push({
                    x1: sensor.x - distanceFromEdge,
                    x2: sensor.x + distanceFromEdge,
                });
            }
        });

        // get all beacons where y == y, and remove duplicates
        const beaconsAtY = sensors.filter((x) => x.beaconY === y).map((x) => x.beaconX).filter((x, i, a) => a.indexOf(x) === i);

        // sort ranges
        ranges.sort((a, b) => a.x1 - b.x1);

        // merge ranges
        const mergedRanges = [];
        let currentRange = null;
        ranges.forEach((range) => {
            if (!currentRange) {
                currentRange = range;
            } else {
                if (range.x1 <= currentRange.x2) {
                    // merge
                    currentRange.x2 = Math.max(currentRange.x2, range.x2);
                } else {
                    // new range
                    mergedRanges.push(currentRange);
                    currentRange = range;
                }
            }
        });
        // add last range
        mergedRanges.push(currentRange);

        return { mergedRanges, beaconsAtY };
    };

    // count cells
    //const count = mergedRanges.reduce((a, b) => a + (b.x2 - b.x1 + 1), 0) - beaconsAtY.length;
    const part1 = getRangesForY(Advent.SampleMode ? 10 : 2000000);
    const count = part1.mergedRanges.reduce((a, b) => a + (b.x2 - b.x1 + 1), 0) - part1.beaconsAtY.length;

    await Advent.Submit(count);

    // part 2
    const maxPos = 4000000;

    let beaconPos = {
        x: 0,
        y: 0,
    };

    // scan each row
    for (let y = 0; y < maxPos; y++) {
        const { mergedRanges, beaconsAtY } = getRangesForY(y);

        // are there any spaces where we can place a beacon?
        let found = false;
        for(const range of mergedRanges) {
            if (
                (range.x2 < maxPos || range.x1 > 0)
            ) {
                // there is space to place a beacon
                found = true;
                beaconPos.y = y;
                if (range.x2 < maxPos) {
                    beaconPos.x = range.x2 + 1;
                } else {
                    beaconPos.x = range.x1 - 1;
                }
                break;
            }
        }

        if (found) {
            break;
        }
    }

    const part2Score = (beaconPos.x * maxPos) + beaconPos.y;
    await Advent.Submit(part2Score, 2);
}
Run();
