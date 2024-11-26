import Window from '../lib/window.js';
import astar from '../lib/astar.js';

// very basic maze generator - would like to replace with one that makes more interesting mazes

const moves = [
    'up',
    'down',
    'left',
    'right',
];

const move = (x, y, dir, distance = 1) => {
    switch (dir) {
        case 'up':
        case 0:
            return [x, y - distance];
        case 'down':
        case 1:
            return [x, y + distance];
        case 'left':
        case 2:
            return [x - distance, y];
        case 'right':
        case 3:
            return [x + distance, y];
    }
    return [x, y];
}

const run = async () => {
    const W = new Window({
        size: 800,
    });

    const buildMaze = async ({ width, height }) => {
        const makeWall = ({ x, y }) => {
            if (x < 0 || y < 0 || x >= width || y >= height) return;
            W.setPixel(x, y, Window.blue);
            W.setKey(x, y, 'wall', true);
        };
        const makeHole = ({ x, y }) => {
            W.setPixel(x, y, Window.white);
            W.setKey(x, y, 'wall', false);
        };

        // clear existing walls
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                makeHole({ x, y });
            }
        }

        // fill a 20x20 grid with walls
        for (let x = 0; x < width; x += 2) {
            for (let y = 0; y < height; y += 2) {
                makeWall({ x, y });
                makeWall({ x: x + 1, y });
                makeWall({ x, y: y + 1 });
            }
        }
        for (let x = 0; x < width; x++) {
            makeWall({ x, y: height });
        }
        for (let y = 0; y < height; y++) {
            makeWall({ x: width, y });
        }
        makeWall({ x: width, y: height });

        const visited = {};

        const carve = (x, y) => {
            if (visited[`${x},${y}`]) return [];

            visited[`${x},${y}`] = true;

            // find possible tunnels to connect us back to the maze
            const possibleTunnels = moves.filter((dir) => {
                const [nx, ny] = move(x, y, dir, 2);
                if (nx < 1 || ny < 1 || nx > width - 1 || ny > height - 1) return false;
                return !!visited[`${nx},${ny}`];
            });

            // if we have any possible tunnels, connect us to one of them
            if (possibleTunnels.length > 0) {
                const tunnel = possibleTunnels[Math.floor(Math.random() * possibleTunnels.length)];
                const [nx, ny] = move(x, y, tunnel);
                makeHole({ x: nx, y: ny });
            }

            // find all adjacent cells that haven't been visited
            const unvisitedAdjacentCells = moves.filter((dir) => {
                const [nx, ny] = move(x, y, dir, 2);
                if (nx < 1 || ny < 1 || nx > width - 1 || ny > height - 1) return false;
                return !visited[`${nx},${ny}`];
            }).map((dir) => {
                const [x2, y2] = move(x, y, dir, 2);
                return { x: x2, y: y2 };
            });

            return unvisitedAdjacentCells;
        };

        const yieldSteps = 15;
        let steps = 0;

        const todo = [{ x: 1, y: 1 }];
        while (todo.length > 0) {
            const { x, y } = todo.splice(Math.floor(Math.random() * todo.length), 1)[0];
            const nextMoves = carve(x, y);
            todo.push(...nextMoves);
            steps++;
            if (steps % yieldSteps === 0) {
                await new Promise((resolve) => setTimeout(resolve, 1));
            }
        }
    };

    const buildAndSolveMaze = async () => {
        await buildMaze({ width: 99, height: 99 });

        const route = await astar(W, 1, 1, W.width - 2, W.height - 2, (cell) => !cell.wall);
        let idx = 0;
        for (const { x, y } of route) {
            const col = Window.colourLerp(Window.green, Window.red, idx / route.length);
            W.setPixel(x, y, col);
            idx++;
            await new Promise(resolve => setTimeout(resolve, 1));
        }

        // flood fill the maze to be pretty
        const maxDepth = route.length;
        let lastDepth = -1;
        await W.floodFill(1, 1, (cell) => !cell.wall, async ({x, y, depth}) => {
            if (depth > maxDepth) return;
            const col = Window.colourLerp(Window.green, Window.red, depth / maxDepth);
            W.setPixel(x, y, col);
            if (depth !== lastDepth) {
                lastDepth = depth;
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        });
    };

    // start renderer
    W.loop();

    while (true) {
        await buildAndSolveMaze();
    }
};
run();
