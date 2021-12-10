const dirs = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 }
];

export default async function astar(window, startX, startY, endX, endY, conditionFunction) {
    const depths = {};
    await window.floodFill(startX, startY, conditionFunction, async (cell, x, y) => {
        depths[`${x},${y}`] = cell.depth;
    });

    // fail if we can't reach the end
    if (!depths[`${endX},${endY}`]) {
        return undefined;
    }

    const shortestPath = [];
    let currentCell = { x: endX, y: endY, depth: depths[`${endX},${endY}`] };
    while (depths[`${currentCell.x},${currentCell.y}`] > 0) {
        // find all our neighbors that we can travel to
        const neighbors = dirs.map((dir) => {
            const [x, y] = [currentCell.x + dir.x, currentCell.y + dir.y];
            return window.get(x, y) || { x, y };
        }).filter(conditionFunction);

        // find the neighbor with the shortest path
        const neighbor = neighbors.sort((a, b) => {
            return depths[`${a.x},${a.y}`] - depths[`${b.x},${b.y}`];
        })[0];

        shortestPath.push(neighbor);
        currentCell = neighbor;
    }

    shortestPath.reverse();
    shortestPath.push({ x: endX, y: endY });
    return shortestPath;
}