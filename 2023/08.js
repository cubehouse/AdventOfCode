import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(8, 2023);

// UI library
// import Window from '../lib/window.js';

class Node {
    constructor(id) {
        this.id = id;
        this.left = null;
        this.right = null;
    }

    AddLeft(node) {
        this.left = node;
    }

    AddRight(node) {
        this.right = node;
    }
}

const D_LEFT = 0;
const D_RIGHT = 1;

async function Run() {
    const input = await Advent.GetInput();

    // build our maze
    const maze = {};
    const instructions = [];
    input.forEach((line, idx) => {
        if (idx == 0) {
            // TODO - instructions
            line.split('').map((x) => {
                if (x === 'L') {
                    return D_LEFT;
                } else if (x === 'R') {
                    return D_RIGHT;
                }
                return undefined;
            }).filter((x) => x !== undefined).forEach((x) => instructions.push(x));
        } else {
            const m = line.match(/(\w+) \= \((\w+), (\w+)\)/);
            if (m) {
                maze[m[1]] = new Node(m[1]);
                maze[m[1]]._left = m[2];
                maze[m[1]]._right = m[3];
            }
        }
    });
    Object.keys(maze).forEach((name) => {
        const node = maze[name];
        if (maze[node._left]) {
            node.AddLeft(maze[node._left]);
            delete node._left;
        }
        if (maze[node._right]) {
            node.AddRight(maze[node._right]);
            delete node._right;
        }
    });

    Advent.Assert(maze['AAA'].left.id, 'BBB');
    Advent.Assert(maze['AAA'].right.id, 'BBB');
    //Advent.Assert(maze['BBB'].left.id, 'AAA');
    //Advent.Assert(maze['BBB'].right.id, 'ZZZ');
    Advent.Assert(maze['ZZZ'].left.id, 'ZZZ');
    Advent.Assert(maze['ZZZ'].right.id, 'ZZZ');

    const state = {
        position: maze['AAA'],
        steps: 0,
        instuctionIdx: 0,
    };
    while(state.position.id !== 'ZZZ') {
        instructions.forEach((instruction) => {
            if (instruction === D_LEFT) {
                state.position = state.position.left;
            } else if (instruction === D_RIGHT) {
                state.position = state.position.right;
            }
            state.steps++;
        });
    }
    
    Advent.Assert(state.steps, 6);
    const ans1 = state.steps;

    await Advent.Submit(ans1);
    // await Advent.Submit(null, 2);
}
Run();
