import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(5, 2016);

import crypto from 'crypto';
import {setTimeout as sleep} from 'timers/promises';

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const password = [0,0,0,0,0,0,0,0];

    let i = 0;
    let foundChars = 0;
    while (foundChars < 8) {
        const hash = crypto.createHash('md5').update(input + i).digest('hex');
        if (hash.startsWith('00000')) {
            password[foundChars] = hash[5];
            foundChars++;
        }
        i++;
    }

    await Advent.Submit(password.join(''), 1);

    i = 0;
    foundChars = 0;
    while (foundChars < 8) {
        const hash = crypto.createHash('md5').update(input + i).digest('hex');
        if (hash.startsWith('00000')) {
            const pos = parseInt(hash[5]);
            if (pos < 8 && !password[pos]) {
                password[pos] = hash[6];
                foundChars++;
                await sleep(0);
            }
        }
        i++;
    }

    await Advent.Submit(password.join(''), 2);
}
Run();
