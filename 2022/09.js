import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(9, 2022);

// UI library
import Window from '../lib/window.js';

const part1AnimSpeed = 10;
const part2AnimSpeed = 100;

class Node {
    constructor({
        x = 0,
        y = 0,
    } = {}) {
        this.x = x;
        this.y = y;
    }

    get pos() {
        return [this.x, this.y];
    }

    set pos(pos) {
        [this.x, this.y] = pos;
    }

    move(direction) {
        switch (direction) {
            case 'U':
                this.y--;
                break;
            case 'D':
                this.y++;
                break;
            case 'L':
                this.x--;
                break;
            case 'R':
                this.x++;
                break;
        }
    }

    chase(targetPos) {
        // update the tail of the rope to follow the head
        // get distance of tail from end
        if (
            (Math.abs(this.x - targetPos[0]) > 1)
            ||
            (Math.abs(this.y - targetPos[1]) > 1)
        ) {
            if (this.x == targetPos[0]) {
                // vertical
                if (this.y > targetPos[1]) {
                    // down
                    this.y = targetPos[1] + 1;
                } else {
                    // up
                    this.y = targetPos[1] - 1;
                }
            } else if (this.y == targetPos[1]) {
                // horizontal
                if (this.x > targetPos[0]) {
                    // right
                    this.x = targetPos[0] + 1;
                } else {
                    // left
                    this.x = targetPos[0] - 1;
                }
            } else {
                // diagonal
                const diagonals = [
                    [this.x - 1, this.y - 1],
                    [this.x + 1, this.y - 1],
                    [this.x - 1, this.y + 1],
                    [this.x + 1, this.y + 1],
                ];
                // find diagonal closest to the target
                let closestDiagonal = null;
                let closestDistance = null;
                diagonals.forEach((diagonal) => {
                    const distance = Math.abs(diagonal[0] - targetPos[0]) + Math.abs(diagonal[1] - targetPos[1]);
                    if (closestDistance === null || distance < closestDistance) {
                        closestDiagonal = diagonal;
                        closestDistance = distance;
                    }
                });
                this.pos = closestDiagonal;
            }
        }
    }
}

function calculateUISize(instructions) {
    let minX = 0;
    let maxX = 0;
    let minY = 0;
    let maxY = 0;
    let currPos = [0, 0];
    for (const direction of instructions) {
        // update the current position
        switch (direction) {
            case 'U':
                currPos[1] -= 1;
                break;
            case 'D':
                currPos[1] += 1;
                break;
            case 'L':
                currPos[0] -= 1;
                break;
            case 'R':
                currPos[0] += 1;
                break;
        };

        // update the min/max values
        minX = Math.min(minX, currPos[0]);
        maxX = Math.max(maxX, currPos[0]);
        minY = Math.min(minY, currPos[1]);
        maxY = Math.max(maxY, currPos[1]);
    }

    const windowWidth = - minX + maxX + 3;
    const windowHeight = - minY + maxY + 3;

    const startPos = [
        Math.abs(minX) + 1,
        Math.abs(minY) + 1,
    ];

    return {
        width: windowWidth,
        height: windowHeight,
        startPos,
    };
}

async function Run() {
    const input = await Advent.GetInput();

    // expand instructions
    const instructions = [];
    for (const line of input) {
        const [direction, distance] = line.split(' ');
        const count = Number(distance);
        for (let i = 0; i < count; i++) {
            instructions.push(direction);
        }
    }

    // generate UI
    const UIConfig = calculateUISize(instructions);

    const W = new Window({
        width: UIConfig.width,
        height: UIConfig.height,
    });
    W.loop();

    const part1Head = new Node({
        x: UIConfig.startPos[0],
        y: UIConfig.startPos[1],
    });
    const part1Tail = new Node({
        x: UIConfig.startPos[0],
        y: UIConfig.startPos[1],
    });

    const part1Draw = async () => {
        W.setPixel(part1Tail.x, part1Tail.y, Window.green);
        W.setPixel(part1Head.x, part1Head.y, Window.red);
    };

    // move the rope
    let i = 0;
    W.setKey(part1Tail.x, part1Tail.y, 'visited', true);
    for (const instruction of instructions) {
        const cell = W.get(part1Head.x, part1Head.y);
        if (cell.visited) {
            W.setPixel(part1Head.x, part1Head.y, Window.green);
        } else {
            W.setPixel(part1Head.x, part1Head.y, Window.white);
        }

        part1Head.move(instruction);
        part1Tail.chase(part1Head.pos);
        W.setKey(part1Tail.x, part1Tail.y, 'visited', true);
        await part1Draw();
        if (i % part1AnimSpeed == 0) {
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
        i++;
    }
    await part1Draw();

    // count the visited spaces
    const visitedSpaces = W.reduce((count, cell) => {
        if (cell.visited) {
            count++;
        }
        return count;
    }, 0);

    await Advent.Submit(visitedSpaces);

    // part 2

    // reset the window
    W.resetPixels();
    await W.forEach((cell) => {
        W.setKey(cell.x, cell.y, 'visited', false);
    });

    // create 10 ropes
    const nodes = [];
    for (let i = 0; i < 10; i++) {
        nodes.push(new Node({
            x: UIConfig.startPos[0],
            y: UIConfig.startPos[1],
        }));
    }
    const head = nodes[0];

    const part2Draw = async () => {
        W.resetPixels();
        await W.forEach((cell) => {
            if (cell.visited) {
                W.setPixel(cell.x, cell.y, Window.blue);
            }
        });
        let i = 0;
        for (const node of nodes) {
            const col = Window.colourLerp(Window.red, Window.green, i / nodes.length);
            W.setPixel(node.x, node.y, col);
            i++;
        }
    };

    i = 0;
    for (const instruction of instructions) {
        // move the ropes
        head.move(instruction);

        // update each rope to follow the head
        for (let i = 1; i < nodes.length; i++) {
            nodes[i].chase(nodes[i - 1].pos);
        }

        // mark tail as visited
        const tailPos = nodes[nodes.length - 1].pos;
        W.setKey(tailPos[0], tailPos[1], 'visited', true);

        if (i % part2AnimSpeed == 0) {
            await part2Draw();
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
        i++;
    }

    const visitedSpaces2 = W.reduce((count, cell) => {
        if (cell.visited) {
            count++;
        }
        return count;
    }, 0);

    await Advent.Submit(visitedSpaces2, 2);
}
Run();
