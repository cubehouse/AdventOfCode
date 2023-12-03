import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(3, 2023);

import {Grid} from '../lib/grid.js';

async function Run() {
    const input = await Advent.GetInput();

    // parse input into a list of elements
    const elems = [];
    input.forEach((x, y) => {
        const regNumbers = /(\d+)/g;
        const regSymbols = /([\D])/g; 
        const processMatch = (regexIn) => {
            let m;
            while (m = regexIn.exec(x)) {
                // skip periods
                if (m[1] === '.') continue;

                const num = parseInt(m[1]);
                const elem = {};
                elem.value = m[1];
                if (!isNaN(num)) {
                    elem.num = num;
                }
                elem.x = m.index;
                elem.y = y;
    
                elems.push(elem);
            }
        };
        
        processMatch(regNumbers);
        processMatch(regSymbols);
    });
    
    // build a 2D grid of elements
    const grid = new Grid();
    elems.forEach((x, elemIdx) => {
        if (x.num === undefined) {
            // store symbols in grid
            grid.Write(x.x, x.y, x.value);
        } else {
            // split number by character and store in grid
            const chars = x.value.split('');
            chars.forEach((char, charIdx) => {
                grid.Write(x.x + charIdx, x.y, char);
                grid.WriteKey(x.x + charIdx, x.y, 'elemIdx', elemIdx);
            });
        }
    });

    // helper function to find adjacent numbers to an element
    const findAdjacentNumbers = (elem) => {
        // skip numbers, we are only checking symbols
        if (elem.num !== undefined) {
            return undefined;
        }

        const adjacentNumberIDXs = [];

        let x = elem.x;
        let y = elem.y;

        // check each position, including diagonals for numbers in the grid
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j ++) {
                if (i === 0 && j === 0) {
                    continue;
                }

                const num = grid.Read(x + i, y + j);
                if (num !== undefined && !isNaN(num)) {
                    // look for elemIdx in the grid
                    //  this is the index of the element this grid position represents
                    const elemIdx = grid.ReadKey(x + i, y + j, 'elemIdx');
                    // check if we already have added this element to our list
                    if (elemIdx !== undefined && adjacentNumberIDXs.indexOf(elemIdx) === -1) {
                        adjacentNumberIDXs.push(elemIdx);
                    }
                }
            }
        }

        return adjacentNumberIDXs.map((x) => {
            return {
                index: x,
                num: elems[x].num,
            };
        });
    };

    // for each symbol, find neighbouring numbers
    const numberIndexes = [];
    elems.forEach((elem) => {
        const numbers = findAdjacentNumbers(elem);
        if (numbers === undefined) {
            return;
        }
        // combine all the symbol indexes we find (so we don't duplicate elements that match twice)
        numbers.forEach((x) => {
            if (numberIndexes.indexOf(x.index) === -1) {
                numberIndexes.push(x.index);
            }
        });
    });

    // loop over the unique number indexes and find the actual values to add them up
    const ans1 = numberIndexes.reduce((p, x) => {
        return p + elems[x].num;
    }, 0);
    await Advent.Submit(ans1);


    // find all elements that are * (gears)
    const gears = elems.filter((x) => {
        return x.value === '*';
    });
    const gearRatios = gears.map((x) => {
        const numbers = findAdjacentNumbers(x);
        // must have at least two adjacent numbers
        if (numbers.length <= 1) {
            return undefined;
        }

        return numbers.reduce((p, x) => {
            return p * x.num;
        }, 1);
    }).filter((x) => !!x); // remove gears that are only next to one element

    const ans2 = gearRatios.reduce((p, x) => {
        return p + x;
    }, 0);

    await Advent.Submit(ans2, 2);
}
Run();
