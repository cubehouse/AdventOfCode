import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(4, 2024);

import Screen from '../lib/screen.js';


async function Run() {
    const input = await Advent.GetInput(`.M.S......
..A..MSMS.
.M.S.MAA..
..A.ASMSM.
.M.S.M....
..........
S.S.S.S.S.
.A.A.A.A..
M.M.M.M.M.
..........`);

    const S = new Screen();

    // print input into screen
    input.forEach((line, y) => {
        line.split('').forEach((char, x) => {
            S.Set(x, y, char);
        });
    });

    const searchForWord = async (x, y, word) => {
        if (S.Get(x, y) !== word[0]) {
            return false;
        }

        // trace in all directions
        const directions = [
            [1, 0],
            [0, 1],
            [1, 1],
            [-1, 1],
            [1, -1],
            [-1, -1],
            [-1, 0],
            [0, -1],
        ];

        let wordsFound = 0;

        for(const dir of directions) {
            let letter = 0;
            const cells = [];
            S.Trace(x, y, dir[0], dir[1], (cell) => {
                if (!cell) return false;

                if (letter >= word.length) {
                    return false;
                }

                if (cell.val == word[letter]) {
                    letter++;
                    cells.push([cell.x, cell.y]);
                    return true;
                }

                return false;
            });

            if (cells.length === word.length) {
                // colour cells
                cells.forEach((cell) => {
                    S.SetKey(cell[0], cell[1], 'style', '{green-fg}');
                });

                wordsFound++;
            }
        }

        // animation
        //await new Promise((resolve) => setTimeout(resolve, 0));

        return wordsFound;
    };

    let totalWordsFound = 0;
    for (let y = 0; y < S.height; y++) {
        for (let x = 0; x < S.width; x++) {
            totalWordsFound += await searchForWord(x, y, 'XMAS');
        }
    }

    await Advent.Submit(totalWordsFound);

    // reset style
    S.ForEachCell((cell) => {
        cell.style = undefined;
    });


    // 4 possible diagonals and their partners
    const diagonals = [
        [
            [-1, -1],
            [1, 1]
        ],
        [
            [1, -1],
            [-1, 1]
        ],
        [
            [1, 1],
            [-1, -1]
        ],
        [
            [-1, 1],
            [1, -1]
        ],
    ];
    const searchXMas = (x, y) => {
        const center = S.Get(x, y);
        if (center !== 'A') {
            return false;
        }

        const masCount = diagonals.reduce((acc, diagonal) => {
            const diag1 = S.Get(x + diagonal[0][0], y + diagonal[0][1]);
            const diag2 = S.Get(x + diagonal[1][0], y + diagonal[1][1]);

            if (diag1 === 'M' && diag2 === 'S') {
                acc++;
                S.SetKey(x, y, 'style', '{green-fg}');
                S.SetKey(x + diagonal[0][0], y + diagonal[0][1], 'style', '{green-fg}');
                S.SetKey(x + diagonal[1][0], y + diagonal[1][1], 'style', '{green-fg}');
            }

            return acc;
        }, 0);

        if (masCount === 2) {
            return true;
        }
        return false;
    };

    let xMasCount = 0;
    for (let y = 0; y < S.height; y++) {
        for (let x = 0; x < S.width; x++) {
            if (searchXMas(x, y)) {
                xMasCount++;
            }
        }
    }

    await Advent.Submit(xMasCount, 2);

    // colour unused cell in red because Christmas
    S.ForEachCell((cell) => {
        if (cell.style === undefined) {
            cell.style = '{red-fg}';
        }
    });
}
Run();
