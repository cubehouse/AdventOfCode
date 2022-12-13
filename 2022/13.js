import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(13, 2022);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    // parse input
    const pairs = [];
    input.forEach((line) => {
        if (line === '') return;
        const arr = JSON.parse(line);
        if (pairs.length === 0 || pairs[pairs.length - 1].length === 2) {
            pairs.push([arr]);
        } else {
            pairs[pairs.length - 1].push(arr);
        }
    });

    const compare = (a, b) => {
        // if a and b are both numbers
        if (typeof a === 'number' && typeof b === 'number') {
            if (a < b) {
                //console.log('a < b', a, b);
                return true;
            }
            if (a > b) {
                //console.log('a > b', a, b);
                return false;
            }
            return undefined;
        }

        // if a and b are both arrays
        if (Array.isArray(a) && Array.isArray(b)) {
            for(let i = 0; i < a.length; i++) {
                // ran out of b, so we're in the correct order
                if (b.length <= i) {
                    //console.log('ran out of b', a, b);
                    return false;
                }
                // compare the two values
                const result = compare(a[i], b[i]);
                // if we have a result, return it
                if (result !== undefined) return result;
            }
            // b was longer than a, in wrong order
            if (b.length > a.length) {
                //console.log('b was longer than a', a, b);
                return true;
            }
        }

        if (typeof a === 'number') return compare([a], b);
        if (typeof b === 'number') return compare(a, [b]);

        return undefined;
    };

    // compare each pair
    let sum = 0;
    pairs.forEach((pair, idx) => {
        const result = compare(pair[0], pair[1]);
        if (result) {
            sum += (idx + 1);
        }
    });

    await Advent.Submit(sum);

    // part 2
    const items = [];
    // extract pairs into a list
    pairs.forEach((x) => {
        items.push(x[0], x[1]);
    });
    // add our decoder keys
    items.push([[2]]);
    items.push([[6]]);

    // sort using our compare function we wrote for part 1 (:D)
    items.sort((a,b) => {
        const result = compare(a, b);
        if (result === undefined) return 0;
        return result ? -1 : 1;
    });

    // find our keys [[2]] and [[6]]
    const keys = [];
    items.forEach((item, idx) => {
        if (item.length === 1 && item[0].length === 1) {
            if (item[0][0] === 2 || item[0][0] === 6) {
                keys.push(idx + 1);
            }
        }
    });
    const answer = keys[0] * keys[1];

    await Advent.Submit(answer, 2);
}
Run();
