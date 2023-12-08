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

function BuildMaze(input) {
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

    return [
        maze,
        instructions,
    ];
}

async function Run() {
    let input = await Advent.GetInput();

    // build our maze
    const [maze, instructions] = BuildMaze(input);

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

    // === Part 2 ===

    if (Advent.SampleMode) {
        // replace input
        const sample2 = `LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)`;
        input = sample2.split('\n');
    }

    const [maze2, instructions2] = BuildMaze(input);

    const state2 = Object.keys(maze2).filter((x) => {
        // return keys that end with A
        return x.match(/A$/);
    }).map((x) => {
        return {
            start: maze2[x],
            position: maze2[x],
            steps: 0,
        };
    });

    // find each path's cycle to their Z node
    state2.forEach((state) => {
        let idx = 0;
        while(!state.position.id.match(/Z$/)) {
            const instruction = instructions2[idx];
            if (instruction === D_LEFT) {
                state.position = state.position.left;
            } else if (instruction === D_RIGHT) {
                state.position = state.position.right;
            } else {
                Advent.Assert(false, 'Unknown instruction');
            }
            state.steps++;
            idx = (idx + 1) % instructions2.length;
        };
    });

    // thank you https://stackoverflow.com/questions/47047682/least-common-multiple-of-an-array-values-using-euclidean-algorithm
    const gcd = (a, b) => a ? gcd(b % a, a) : b;
    const lcm = (a, b) => a * b / gcd(a, b);

    const ans2 = state2.reduce((acc, state) => {
        return lcm(acc, state.steps);
    }, 1);

    await Advent.Submit(ans2, 2);
}
Run();
