import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(4, 2024);

import Screen from '../lib/screen.js';


async function Run() {
    const input = await Advent.GetInput(`MMMSXXMASM
MSAMXMSMSA
AMXSXMAAMM
MSAMASMSMX
XMASAMXAMM
XXAMMXXAMA
SMSMSASXSS
SAXAMASAAA
MAMMMXMMMM
MXMXAXMASX`);

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

        await new Promise((resolve) => setTimeout(resolve, 0));

        return wordsFound;
    };

    let totalWordsFound = 0;
    for (let y = 0; y < S.height; y++) {
        for (let x = 0; x < S.width; x++) {
            totalWordsFound += await searchForWord(x, y, 'XMAS');
        }
    }

    await Advent.Submit(totalWordsFound);
    // await Advent.Submit(null, 2);
}
Run();
