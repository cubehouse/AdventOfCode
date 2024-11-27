import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(4, 2016);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const rooms = input.map((x) => {
        const parts = x.split('-');
        const name = parts.slice(0, -1).join('-');
        const [sector, checksum] = parts.slice(-1)[0].split('[');

        const letters = name.split('').filter((x) => x !== '-');
        const letterCounts = letters.reduce((acc, letter) => {
            acc[letter] = (acc[letter] || 0) + 1;
            return acc;
        }, {});
        const letterCountsSorted = Object.entries(letterCounts).sort((a, b) => {
            if (a[1] === b[1]) {
                return a[0].localeCompare(b[0]);
            }
            return b[1] - a[1];
        });
        const checksumCalculated = letterCountsSorted.slice(0, 5).map((x) => x[0]).join('');

        const actualName = name.split('').map((x) => {
            if (x === '-') {
                return ' ';
            }
            return String.fromCharCode(((x.charCodeAt(0) - 97 + parseInt(sector)) % 26) + 97);
        });

        return {
            name,
            actualName: actualName.join(''),
            sector: parseInt(sector),
            checksum: checksum.slice(0, -1),
            isValid: checksumCalculated === checksum.slice(0, -1),
        };
    });

    await Advent.Submit(rooms.filter(x => x.isValid).reduce((acc, x) => acc + x.sector, 0), 1);

    const findRoom = rooms.find((x) => x.actualName === 'northpole object storage');
    await Advent.Submit(findRoom.sector, 2);
}
Run();
