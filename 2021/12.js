import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(12, 2021);

async function Run() {
    const input = await Advent.GetInput();
    const input2 = `fs-end
    he-DX
    fs-he
    start-DX
    pj-DX
    end-zg
    zg-sl
    zg-pj
    pj-he
    RW-he
    fs-DX
    pj-RW
    zg-RW
    start-pj
    he-WI
    zg-he
    pj-fs
    start-RW`.split(/\n/);

    const map = {};
    for (const line of input) {
        const [from, to] = line.trim().split('-');
        if (!map[from]) {
            map[from] = [];
        }
        map[from].push(to);
        if (!map[to]) {
            map[to] = [];
        }
        map[to].push(from);
    }

    const part1 = () => {
        const queue = [['start']];
        const paths = [];
        while (queue.length > 0) {
            const path = queue.shift();
            const last = path[path.length - 1];
            if (last === 'end') {
                paths.push(path);
            } else {
                for (const next of map[last]) {
                    // can't visit lowercase caves more than once
                    if (next.toLowerCase() === next && path.includes(next)) {
                        continue;
                    }

                    const newPath = path.slice();
                    newPath.push(next);
                    queue.push(newPath);
                }
            }
        }
        return paths;
    };

    await Advent.Submit(part1().length);

    // part 2

    const isSmallCave = (cave) => {
        return cave.toLowerCase() === cave && cave !== 'end' && cave !== 'start';
    };

    let debug = 0;
    const part2 = () => {
        const queue = [['start']];
        const paths = [];
        while (queue.length > 0) {
            const path = queue.pop(); // pop from the end to get through the list faster
            const last = path[path.length - 1];
            if (last === 'end') {
                paths.push(path);
            } else {
                for (const next of map[last]) {
                    // can't go back to start
                    if (next === 'start') continue;

                    // can't visit lowercase caves more than once
                    if (isSmallCave(next) && path.includes(next)) {
                        // detect if we have already visitied a small cave twice
                        const alreadyHaveTwoSmallCavePath = path.find((x, idx, arr) => {
                            return isSmallCave(x) && arr.lastIndexOf(x) !== idx;
                        });
                        if (alreadyHaveTwoSmallCavePath) {
                            continue;
                        }
                    }

                    const newPath = path.slice();
                    newPath.push(next);

                    queue.push(newPath);
                }
            }
        }
        return paths;
    };

    const part2Paths = part2();
    await Advent.Submit(part2Paths.length, 2);
}
Run();
