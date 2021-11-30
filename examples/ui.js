import Screen from '../screen.js';

// create new screen object
const S = new Screen();

const plotTravellingCos = async () => {
    return new Promise((resolve) => {
        S.Clear();

        // console.log will be redirected to a new panel
        console.log('Plotting cos(x) to canvas for 500 ticks...');

        let x = 0;
        const canvasHeight = S.canvasHeight;
        const intervalFn = setInterval(() => {
            x++;
            const y = Math.floor(Math.cos(x / 10) * canvasHeight / 2) + canvasHeight / 2;
            S.Set(x, y, '~');
            S.FitPositionOntoScreen(x, y);

            // plot for a while
            if (x > 500) {
                console.log('Done!');
                clearInterval(intervalFn);
                resolve();
            }
        }, 1);
    });
};



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

const buildMaze = async () => {
    return new Promise(async (resolve) => {
        console.log('Building maze...');
        S.Clear();

        const mazeWidth = Math.floor((S.canvasWidth - 2) / 2) * 2;
        const mazeHeight = Math.floor((S.canvasHeight - 2) / 2) * 2;

        const wallSymbol = '█';

        // fill a 20x20 grid with walls
        for (let x = 0; x < mazeWidth; x += 2) {
            for (let y = 0; y < mazeHeight; y += 2) {
                S.Set(x, y, wallSymbol);
                S.Set(x + 1, y, wallSymbol);
                S.Set(x, y + 1, wallSymbol);
            }
        }
        for (let x = 0; x < mazeWidth; x++) {
            S.Set(x, mazeHeight, wallSymbol);
        }
        for (let y = 0; y < mazeHeight; y++) {
            S.Set(mazeWidth, y, wallSymbol);
        }
        S.Set(mazeWidth, mazeHeight, wallSymbol);

        const carve = (x, y) => {
            if (S.GetKey(x, y, 'visited')) return [];

            S.SetKey(x, y, 'visited', true);

            // find possible tunnels to connect us back to the maze
            const possibleTunnels = moves.filter((dir) => {
                const [nx, ny] = move(x, y, dir, 2);
                if (nx < 1 || ny < 1 || nx > mazeWidth - 1 || ny > mazeHeight - 1) return false;
                return !!S.GetKey(nx, ny, 'visited');
            });

            // if we have any possible tunnels, connect us to one of them
            if (possibleTunnels.length > 0) {
                const tunnel = possibleTunnels[Math.floor(Math.random() * possibleTunnels.length)];
                const [nx, ny] = move(x, y, tunnel);
                S.Set(nx, ny, ' ');
            }

            // find all adjacent cells that haven't been visited
            const unvisitedAdjacentCells = moves.filter((dir) => {
                const [nx, ny] = move(x, y, dir, 2);
                if (nx < 1 || ny < 1 || nx > mazeWidth - 1 || ny > mazeHeight - 1) return false;
                return !S.GetKey(nx, ny, 'visited');
            }).map((dir) => {
                const [x2, y2] = move(x, y, dir, 2);
                return { x: x2, y: y2 };
            });

            return unvisitedAdjacentCells;
        };

        // visit first square
        S.SetKey(1, 1, 'visited', true);

        const yieldSteps = 15;
        let steps = 0;

        const todo = [{ x: 1, y: 3 }];
        while (todo.length > 0) {
            const { x, y } = todo.splice(Math.floor(Math.random() * todo.length), 1)[0];
            const nextMoves = carve(x, y);
            todo.push(...nextMoves);
            steps++;
            if (steps % yieldSteps === 0) {
                await new Promise((resolve) => setTimeout(resolve, 1));
            }
        }

        const targetSpot = { x: mazeWidth - 1, y: mazeHeight - 1 };
        S.Set(targetSpot.x, targetSpot.y, 'X');

        console.log('Done!');
        resolve();
    });
}

const solveMaze = async () => {
    return new Promise(async (resolve) => {
        console.log('Flooding maze...');

        // add some style to our flood
        const floodStyle = S.AddStyle(/(~)/, '{blue-fg}');
        const targetStyle = S.AddStyle(/(X)/, '{red-fg}');
        const routeStyle = S.AddStyle(/(@)/, '{green-fg}');

        let targetCell = S.find((cell) => cell.val === 'X');

        const shortestPath = await S.SolveRoute(1, 1, targetCell.x, targetCell.y, (cell) => {
            return (cell.val == 'X' || cell.val === ' ' || cell.val === undefined);
        });
        if (!shortestPath) {
            console.log('No route found!');
        } else {
            // mark the shortest path on the maze
            for (const cell of shortestPath) {
                S.Set(cell.x, cell.y, '@');
                await new Promise((resolve) => setTimeout(resolve, 1));
            }
        }

        console.log('Done!');

        await new Promise((resolve) => { setTimeout(resolve, 2000); });

        // remove style from flood after a few seconds to let it draw to screen
        setTimeout(() => {
            S.RemoveStyle(floodStyle);
            S.RemoveStyle(targetStyle);
            S.RemoveStyle(routeStyle);
        }, 10);
        resolve();
    });
}

const run = async () => {
    // while(true) {
    await plotTravellingCos();
    await buildMaze();
    await solveMaze();
    S.Stop();
    // }

    console.log('Closed');
};

run();
