import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(10, 2023);

// UI library
import Window from '../lib/window.js';

const pipes = {
    PIPE_UPDOWN: 0,
    PIPE_LEFTRIGHT: 1,
    PIPE_UPLEFT: 2,
    PIPE_UPRIGHT: 3,
    PIPE_DOWNLEFT: 4,
    PIPE_DOWNRIGHT: 5,
};

const pipeSymbols = {
    '|': pipes.PIPE_UPDOWN,
    '-': pipes.PIPE_LEFTRIGHT,
    'L': pipes.PIPE_UPRIGHT,
    'J': pipes.PIPE_UPLEFT,
    '7': pipes.PIPE_DOWNLEFT,
    'F': pipes.PIPE_DOWNRIGHT,
};

async function Run() {
    const input = await Advent.GetInput();

    const width = input[0].length;
    const height = input.length;
    
    const W = new Window({
        width: (width * 3) + 1,
        height: (height * 3) + 1,
        //pixelSize: 1,
    });

    let start = null;

    const coorToWindow = (coor) => {
        return [
            (coor[0] * 3) + 1,
            (coor[1] * 3) + 1,
        ]
    };

    input.forEach((line, y) => {
        line.split('').forEach((char, x) => {
            const windowCoor = coorToWindow([x, y]);
            if (char === 'S') {
                W.setPixel(windowCoor[0], windowCoor[1], Window.green);
                W.setKey(windowCoor[0], windowCoor[1], 'pipe', true);
                W.setKey(windowCoor[0], windowCoor[1], 'wall', true);
                start = [x, y];
            } else if (char !== '.') {
                W.setPixel(windowCoor[0], windowCoor[1], Window.blue);
                W.setKey(windowCoor[0], windowCoor[1], 'pipe', true);
                W.setKey(windowCoor[0], windowCoor[1], 'wall', true);
                W.setKey(windowCoor[0], windowCoor[1], 'pipeType', pipeSymbols[char]);
            } else {
                W.setKey(windowCoor[0], windowCoor[1], 'floor', true);
                W.setPixel(windowCoor[0], windowCoor[1], Window.green);
            }
        });
    });

    W.loop();

    const move = (x, y, dir) => {
        switch (dir) {
            case 'up':
            case 0:
                return [x, y - 1];
            case 'down':
            case 1:
                return [x, y + 1];
            case 'left':
            case 2:
                return [x - 1, y];
            case 'right':
            case 3:
                return [x + 1, y];
        }
        return [x, y];
    }

    const moveSetToPipeType = (moveSet) => {
        const containsUp = moveSet.indexOf('up') !== -1;
        const containsDown = moveSet.indexOf('down') !== -1;
        const containsLeft = moveSet.indexOf('left') !== -1;
        const containsRight = moveSet.indexOf('right') !== -1;

        if (containsUp && containsDown) {
            return pipes.PIPE_UPDOWN;
        } else if (containsLeft && containsRight) {
            return pipes.PIPE_LEFTRIGHT;
        } else if (containsUp && containsLeft) {
            return pipes.PIPE_UPLEFT;
        } else if (containsUp && containsRight) {
            return pipes.PIPE_UPRIGHT;
        } else if (containsDown && containsLeft) {
            return pipes.PIPE_DOWNLEFT;
        } else if (containsDown && containsRight) {
            return pipes.PIPE_DOWNRIGHT;
        }
    }

    const getAdjacentCells = (x, y) => {
        const windowCoor = coorToWindow([x, y]);
        const pipeType = W.getKey(windowCoor[0], windowCoor[1], 'pipeType');
        const result = [];
        switch (pipeType) {
            case pipes.PIPE_UPDOWN:
                result.push(move(x, y, 'up'));
                result.push(move(x, y, 'down'));
                break;
            case pipes.PIPE_LEFTRIGHT:
                result.push(move(x, y, 'left'));
                result.push(move(x, y, 'right'));
                break;
            case pipes.PIPE_UPLEFT:
                result.push(move(x, y, 'up'));
                result.push(move(x, y, 'left'));
                break;
            case pipes.PIPE_UPRIGHT:
                result.push(move(x, y, 'up'));
                result.push(move(x, y, 'right'));
                break;
            case pipes.PIPE_DOWNLEFT:
                result.push(move(x, y, 'down'));
                result.push(move(x, y, 'left'));
                break;
            case pipes.PIPE_DOWNRIGHT:
                result.push(move(x, y, 'down'));
                result.push(move(x, y, 'right'));
                break;
        }

        return result;
    };
    
    // figure out start cell pipe type
    const startMoves = [
        { dir: 'up', pos: move(start[0], start[1], 'up') },
        { dir: 'down', pos: move(start[0], start[1], 'down') },
        { dir: 'left', pos: move(start[0], start[1], 'left') },
        { dir: 'right', pos: move(start[0], start[1], 'right') },
    ].filter(({ pos }) => {
        const windowCoor = coorToWindow(pos);
        const pipeType = W.getKey(windowCoor[0], windowCoor[1], 'pipeType');
        return pipeType !== undefined;
    }).filter(({ pos }) => {
        // get adjacent cells, if start is not in the list, then it doesn't connect back to start
        const connectedCells = getAdjacentCells(pos[0], pos[1]);
        return connectedCells.some(([x, y]) => x === start[0] && y === start[1]);
    });

    if (startMoves.length !== 2) {
        throw new Error('Invalid start pipe');
    }
    const startPipeType = moveSetToPipeType(startMoves.map(({ dir }) => dir));
    const startWindowCoor = coorToWindow(start);
    W.setKey(startWindowCoor[0], startWindowCoor[1], 'pipeType', startPipeType);

    const getConnectedAdjacentCells = (x, y) => {
        const cells = getAdjacentCells(x, y);
        // check each cell for a pipe type in the opposite direction
        return cells.filter(([x2, y2]) => {
            const windowCoor = coorToWindow([x2, y2]);
            const pipeType = W.getKey(windowCoor[0], windowCoor[1], 'pipeType');
            if (pipeType === undefined) return false;

            const connectedCells = getAdjacentCells(x2, y2);
            return connectedCells.some(([x3, y3]) => x3 === x && y3 === y);
        });
    };

    // add pixels between pipes where they connect on the grid
    W.forEach(({ x, y }) => {
        const gridX = Math.floor(x / 3);
        const gridY = Math.floor(y / 3);

        const connectedCells = getConnectedAdjacentCells(gridX, gridY);

        // draw pixels between connected cells
        connectedCells.forEach(([x2, y2]) => {
            const windowCoor = coorToWindow([x2, y2]);
            const pipeType = W.getKey(windowCoor[0], windowCoor[1], 'pipeType');
            if (pipeType === pipes.PIPE_UPDOWN) {
                W.setPixel(windowCoor[0], windowCoor[1] - 1, Window.blue);
                W.setPixel(windowCoor[0], windowCoor[1] + 1, Window.blue);
                W.setKey(windowCoor[0], windowCoor[1] - 1, 'wall', true);
                W.setKey(windowCoor[0], windowCoor[1] + 1, 'wall', true);
            } else if (pipeType === pipes.PIPE_LEFTRIGHT) {
                W.setPixel(windowCoor[0] - 1, windowCoor[1], Window.blue);
                W.setPixel(windowCoor[0] + 1, windowCoor[1], Window.blue);
                W.setKey(windowCoor[0] - 1, windowCoor[1], 'wall', true);
                W.setKey(windowCoor[0] + 1, windowCoor[1], 'wall', true);
            } else if (pipeType === pipes.PIPE_UPLEFT) {
                W.setPixel(windowCoor[0], windowCoor[1] - 1, Window.blue);
                W.setPixel(windowCoor[0] - 1, windowCoor[1], Window.blue);
                W.setKey(windowCoor[0], windowCoor[1] - 1, 'wall', true);
                W.setKey(windowCoor[0] - 1, windowCoor[1], 'wall', true);
            } else if (pipeType === pipes.PIPE_UPRIGHT) {
                W.setPixel(windowCoor[0], windowCoor[1] - 1, Window.blue);
                W.setPixel(windowCoor[0] + 1, windowCoor[1], Window.blue);
                W.setKey(windowCoor[0], windowCoor[1] - 1, 'wall', true);
                W.setKey(windowCoor[0] + 1, windowCoor[1], 'wall', true);
            } else if (pipeType === pipes.PIPE_DOWNLEFT) {
                W.setPixel(windowCoor[0], windowCoor[1] + 1, Window.blue);
                W.setPixel(windowCoor[0] - 1, windowCoor[1], Window.blue);
                W.setKey(windowCoor[0], windowCoor[1] + 1, 'wall', true);
                W.setKey(windowCoor[0] - 1, windowCoor[1], 'wall', true);
            } else if (pipeType === pipes.PIPE_DOWNRIGHT) {
                W.setPixel(windowCoor[0], windowCoor[1] + 1, Window.blue);
                W.setPixel(windowCoor[0] + 1, windowCoor[1], Window.blue);
                W.setKey(windowCoor[0], windowCoor[1] + 1, 'wall', true);
                W.setKey(windowCoor[0] + 1, windowCoor[1], 'wall', true);
            }
        });
    });

    const queue = [
        {
            pos: start,
            moves: [],
        }
    ];
    const visited = {};
    let animCounter = 0;
    while(queue.length > 0) {
        const { pos, moves } = queue.shift();
        const key = `${pos[0]},${pos[1]}`;
        if (visited[key]) continue;
        visited[key] = true;
    
        const posCoor = coorToWindow(pos);
        const pipeType = W.getKey(posCoor[0], posCoor[1], 'pipeType');
        if (pipeType === undefined) continue;

        W.setKey(posCoor[0], posCoor[1], 'depth', moves.length);
        W.setPixel(posCoor[0], posCoor[1], Window.red);

        const connectedCells = getConnectedAdjacentCells(pos[0], pos[1]);
        connectedCells.forEach(([x, y]) => {
            queue.push({
                pos: [x, y],
                moves: [...moves, { pos, dir: moves.length === 0 ? null : moves[moves.length - 1].dir }],
            });
        });

        // let the window animate (pause for one "step" every 100 iterations)
        animCounter++;
        if (animCounter % 100 === 0)
        {
            await new Promise(resolve => setTimeout(resolve, 1));
        }
    }

    await new Promise(resolve => setTimeout(resolve, 1));

    // find max depth in the maze
    const ans1 = W.reduce((acc, cell) => {
        if (cell.depth === undefined || !cell.pipe) return acc;
        return Math.max(acc, cell.depth);
    }, 0);

    await Advent.Submit(ans1);
    
    let floodAnim = 0;
    const floodAnimSpeed = 50;

    // mark all cells that are part of the loop as isLoop
    let loopStart = coorToWindow(start);
    while(1) {
        W.setKey(loopStart[0], loopStart[1], 'isLoop', true);
        W.setPixel(loopStart[0], loopStart[1], Window.red);
        const neighbours = [
            [loopStart[0], loopStart[1] - 1],
            [loopStart[0], loopStart[1] + 1],
            [loopStart[0] - 1, loopStart[1]],
            [loopStart[0] + 1, loopStart[1]],
        ].filter((x) => {
            return !W.getKey(x[0], x[1], 'isLoop') && W.getKey(x[0], x[1], 'wall');
        });
        if (neighbours.length === 0) break;
        loopStart = neighbours[0];

        floodAnim++;
        if (floodAnim % floodAnimSpeed === 0) {
            await new Promise(resolve => setTimeout(resolve, 1));
        }
    }

    const floorPieces = W.filter((x) => {
        return x.floor || (x.pipe && !x.isLoop);
    });

    const testFloor = async (fillStart) => {
        const alreadyVisited = W.getKey(fillStart[0], fillStart[1], 'isContained');
        if (alreadyVisited !== undefined) {
            return alreadyVisited;
        }

        let touchedLoop = false;
        let touchedSideOfMap = false;
        const floors = [
            fillStart,
        ];
        await W.floodFill(fillStart[0], fillStart[1], (cell) => {
            if (cell.isLoop) touchedLoop = true;
            return !cell.isLoop && !cell.visited;
        }, async ({x, y, floor, pipe}) => {
            W.setPixel(x, y, Window.pink);
            W.setKey(x, y, 'visited', true);
            if (floor || pipe) {
                floors.push([x, y]);
            }
            if (x === 0 || y === 0 || x === W.width - 1 || y === W.height - 1) {
                touchedSideOfMap = true;
            }

        
            floodAnim++;
            if (floodAnim % floodAnimSpeed === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        });

        const isContained = touchedLoop && !touchedSideOfMap;
        floors.forEach(([x, y]) => {
            W.setKey(x, y, 'isContained', isContained);
            W.setPixel(x, y, isContained ? Window.yellow : Window.violet);
        });

        return isContained;
    };
    
    const containedFloor = [];
    for(const floor of floorPieces) {
        const res = await testFloor([floor.x, floor.y]);
        if (res) {
            containedFloor.push(floor);
        }
    }

    // I misread the question, now use our new found knowledge to find all floors and pipes inside the loop
    await W.floodFill(containedFloor[0].x, containedFloor[0].y, (cell) => {
        return !cell.isLoop;
    }, async ({x, y, floor, pipe}) => {
        if (floor || pipe) {
            W.setPixel(x, y, Window.yellow);
        } else {
            W.setPixel(x, y, Window.black);
        }
        
        floodAnim++;
        if (floodAnim % floodAnimSpeed === 0) {
            await new Promise(resolve => setTimeout(resolve, 1));
        }
    });

    const ans2 = containedFloor.length;

    await Advent.Submit(ans2, 2);

    // wait 3 seconds before stopping the renderer
    await new Promise(resolve => setTimeout(resolve, 3000));

    W.stop();
}
Run();
