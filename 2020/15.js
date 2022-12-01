import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(15, 2020);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = (await Advent.GetInput()).split(',').map(x => parseInt(x));
    
    for(let i = input.length; i < 2020; i++) {
        let last = input[i-1];
        let lastpos = input.lastIndexOf(last, i-2);
        if(lastpos == -1) {
            input.push(0);
        } else {
            input.push(i - lastpos - 1);
        }
    }
    await Advent.Submit(input[2019]);
    
    // part 2
    let lastpos = new Map();
    for(let i = 0; i < input.length - 1; i++) {
        lastpos.set(input[i], i);
    }
    let last = input[input.length - 1];
    for(let i = input.length; i < 30000000; i++) {
        let next = 0;
        if(lastpos.has(last)) {
            next = i - lastpos.get(last) - 1;
        }
        lastpos.set(last, i - 1);
        last = next;
    }
    await Advent.Submit(last, 2);
}
Run();
