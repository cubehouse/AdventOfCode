import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(17, 2022);

const shapes = [
    [
        ['#', '#', '#', '#'],
    ],
    [
        ['.', '#', '.'],
        ['#', '#', '#'],
        ['.', '#', '.'],
    ],
    [
        ['.', '.', '#'],
        ['.', '.', '#'],
        ['#', '#', '#'],
    ],
    [
        ['#'],
        ['#'],
        ['#'],
        ['#'],
    ],
    [
        ['#', '#'],
        ['#', '#'],
    ],
];

async function Run() {
    const input = await Advent.GetInput();

    const gusts = input.split('').map((x) => {
        if (x === '>') return 1;
        if (x === '<') return -1;
        throw new Error('Unknown direction');
    });

    const runSimulation = async ({
        gridWidth = 7,
        pieces = 2022,
    } = {}) => {
        let pieceIDX = 0;
        let gustIDX = 0;
        let highestX = 0;

        const cells = new Set();

        const draw = () => {
            const grid = Array.from({ length: highestX + 1 }, () => Array.from({ length: gridWidth }, () => '.'));

            cells.forEach((cell) => {
                const [x, y] = cell.split(',').map((x) => parseInt(x, 10));
                grid[y][x] = '#';
            });

            // flip the grid so that the top left is 0,0
            grid.reverse();

            console.log(grid.map((x) => x.join('')).join('\n'));
        };

        const collisionTest = (piece, x, y) => {
            // test if piece collides with floor
            if (y - piece.length + 1 < 0) {
                return true;
            }
            // test if piece collides with wall
            if (x < 0 || x + piece[0].length > gridWidth) {
                return true;
            }

            // test each cell of the piece for collision with rested pieces
            for (let i = 0; i < piece.length; i++) {
                for (let j = 0; j < piece[i].length; j++) {
                    if (piece[i][j] === '#' && cells.has(`${x + j},${y - i}`)) {
                        return true;
                    }
                }
            }
            return false;
        };

        const dropPiece = async (pieceId) => {
            const piece = shapes[pieceId];

            let x = 2;
            let y = highestX + 3 + piece.length - 1;

            while (true) {
                const gust = gusts[gustIDX];
                gustIDX = (gustIDX + 1) % gusts.length;

                // new piece position based on gust
                const gustX = x + gust;
                // update piece position if it fits
                // make sure we don't collide with anything first
                if (!collisionTest(piece, gustX, y)) {
                    x = gustX;
                }

                const newY = y - 1;
                if (collisionTest(piece, x, newY)) {
                    // we've hit something, so we need to rest the piece
                    for (let i = 0; i < piece.length; i++) {
                        for (let j = 0; j < piece[i].length; j++) {
                            if (piece[i][j] === '#') {
                                // update highest X
                                const highestPieceX = y - i + 1;
                                if (highestPieceX > highestX) {
                                    highestX = highestPieceX;
                                }

                                cells.add(`${x + j},${y - i}`);
                            }
                        }
                    }
                    
                    // if (pieceId == 0 && highestX > 1) {
                    //     draw();
                    //     process.exit();
                    // }
                    break;
                }
                y = newY;
            }
        };

        let lastPercent = -1;
        for (let i = 0; i < pieces; i++) {
            await dropPiece(pieceIDX);
            pieceIDX = (pieceIDX + 1) % shapes.length;
            const percentComplete = Math.round((i / pieces) * 100);
            if (percentComplete !== lastPercent) {
                lastPercent = percentComplete;
                console.log(`Completed ${percentComplete}%`);
                // yield
                await new Promise((resolve) => setTimeout(resolve, 0));
            }
        }
        return highestX;
    };

    const part1X = await runSimulation({ gridWidth: 7, pieces: 2022 });
    await Advent.Submit(part1X);

    // part 2
    // ... maybe come back to this later.......
    // const part2X = await runSimulation({ gridWidth: 10, pieces: 1000000000000 });
    // await Advent.Submit(part2X, 2);
}
Run();
