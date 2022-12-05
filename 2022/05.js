import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(5, 2022);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const map = [];
    const steps = [];
    let mapFound = false;
    input.forEach((line) => {
        if (!mapFound) {
            if (line === "") {
                mapFound = true;
            } else {
                map.push(line);
            }
        } else {
            // parse steps in format "move 1 from 2 to 1"
            const regex = /move (\d+) from (\d+) to (\d+)/;
            const match = line.match(regex);
            if (match === null) {
                throw new Error("Invalid input");
            }
            const [, num, from, to] = match;
            steps.push({
                num: parseInt(num),
                from: parseInt(from),
                to: parseInt(to),
            });
        }
    });

    // parse map into array of arrays
    const state = [
        [], [], [], [], [], [], [], [], [],
    ];
    map.forEach((line, y) => {
        // match all letters in squar brackets, or four spaces
        const regex = /(\[[A-Z]\])|(\s{4})/g;
        const matches = line.matchAll(regex);
        let bucket = 0;
        for (const match of matches) {
            const [, letter, space] = match;
            if (letter !== undefined) {
                // letter found
                state[bucket].push(match[1][1]);
            }

            bucket++;
        }
    });
    // save state
    const initialState = state.map((x) => x.slice());

    const moveItem = (stateObj, from, to) => {
        if (stateObj[from - 1].length === 0) {
            return;
        }
        const item = stateObj[from - 1].shift();
        stateObj[to - 1].unshift(item);
    };

    const runLinePart1 = (stateObj, line) => {
        // run moveItem x times based on line.num
        for (let i = 0; i < line.num; i++) {
            moveItem(stateObj, line.from, line.to);
        }
    };
    for (const line of steps) {
        runLinePart1(state, line);
    }

    // get final state
    const topLetters = state.map((x) => x[0]).join("");
    await Advent.Submit(topLetters);

    // part 2

    // reset state
    state.forEach((x, i) => {
        x.length = 0;
        x.push(...initialState[i]);
    });

    const runLinePart2 = (stateObj, line) => {
        // run moveItem x times based on line.num (in a group this time)
        const group = stateObj[line.from - 1].splice(0, line.num);
        stateObj[line.to - 1].unshift(...group);
    };
    for (const line of steps) {
        runLinePart2(state, line);
    }
    const topLettersPart2 = state.map((x) => x[0]).join("");
    await Advent.Submit(topLettersPart2, 2);
}
Run();
