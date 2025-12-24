import { Advent as AdventLib } from '../lib/advent.js';
import Colour from '../lib/colour.js';
const Advent = new AdventLib(9, 2025);

// UI library
import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const points = input.map((x) => x.split(",").map(Number));

    const maxX = Math.max(...points.map(p => p[0])) + 1;
    const maxY = Math.max(...points.map(p => p[1])) + 1;

    const W = new Window({
        screenHeight: maxY,
        screenWidth: maxX,
    });

    points.forEach((p, i) => {
        W.setPixel(p[0], p[1], Colour.red);
        W.setKey(p[0], p[1], 'point', true);
    });

    W.loop();

    const calculateRectangleArea = (p1, p2) => {
        const width = Math.abs(p2[0] - p1[0]) + 1;
        const height = Math.abs(p2[1] - p1[1]) + 1;
        return width * height;
    };

    const rectangles = [];

    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const area = calculateRectangleArea(points[i], points[j]);
            rectangles.push({ p1: points[i], p2: points[j], area });
        }
    }

    rectangles.sort((a, b) => b.area - a.area);

    const part1 = rectangles[0].area;
    await Advent.Submit(part1);

    // part 2
    const drawLine = (p1, p2) => {
        const x1 = p1[0];
        const y1 = p1[1];
        const x2 = p2[0];
        const y2 = p2[1];

        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = (x1 < x2) ? 1 : -1;
        const sy = (y1 < y2) ? 1 : -1;
        let err = dx - dy;

        let x = x1;
        let y = y1;

        while (true) {
            if (!W.getKey(x, y, 'point')) {
                W.setPixel(x, y, Colour.green);
            }
            W.setKey(x, y, 'line', true);

            if (x === x2 && y === y2) break;
            const e2 = err * 2;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    };

    // draw lines between each point and the next in the list (looping back to the start)
    const lines = [];
    for (let i = 0; i < points.length; i++) {
        const nextIndex = (i + 1) % points.length;
        drawLine(points[i], points[nextIndex]);
        lines.push([points[i], points[nextIndex]]);
    }

    // ray cast and count how many lines we cross
    const rayCast = (point, direction) => {
        // Add small epsilon to y coordinate to avoid hitting vertices exactly
        const epsilon = 0.0001;
        const adjustedPoint = [point[0], point[1] + epsilon];

        let intersections = [];
        for (const line of lines) {
            const [p1, p2] = line;

            // check if the ray intersects with the line segment
            const denom = (p2[1] - p1[1]) * (direction[0]) - (p2[0] - p1[0]) * (direction[1]);
            if (denom === 0) continue; // parallel lines

            const t = ((p1[0] - adjustedPoint[0]) * (direction[1]) - (p1[1] - adjustedPoint[1]) * (direction[0])) / denom;
            const u = -((p2[0] - p1[0]) * (p1[1] - adjustedPoint[1]) - (p2[1] - p1[1]) * (p1[0] - adjustedPoint[0])) / denom;

            if (t >= 0 && t <= 1 && u >= 0) {
                intersections.push({ line, t, u });
            }
        }
        return intersections;
    };

    // Check if a cell is inside the shape (no cache - it was causing memory issues)
    const isCellInsideShape = (x, y) => {
        // if cell is on a line or a point, it is inside
        if (W.getKey(x, y, 'line') || W.getKey(x, y, 'point')) {
            return true;
        }

        const intersections = rayCast([x, y], [1, 0]); // cast ray to the right
        return (intersections.length % 2 === 1);
    }

    // for each rectangle, check if all cells inside are within the shape
    const maxRectanglesToCheck = 50000; // Limit to prevent infinite loops
    const rectanglesToCheck = Math.min(rectangles.length, maxRectanglesToCheck);
    console.log(`Checking up to ${rectanglesToCheck} of ${rectangles.length} rectangles...`);

    for (let i = 0; i < rectanglesToCheck; i++) {
        const rect = rectangles[i];
        if (i % 250 === 0) {
            console.log(`Checked ${i}/${rectanglesToCheck} rectangles`);
            await W.delay(0);
        }

        const xStart = Math.min(rect.p1[0], rect.p2[0]);
        const xEnd = Math.max(rect.p1[0], rect.p2[0]);
        const yStart = Math.min(rect.p1[1], rect.p2[1]);
        const yEnd = Math.max(rect.p1[1], rect.p2[1]);

        // Quick check: verify all 4 corners are inside first (fast fail)
        if (!isCellInsideShape(xStart, yStart) ||
            !isCellInsideShape(xStart, yEnd) ||
            !isCellInsideShape(xEnd, yStart) ||
            !isCellInsideShape(xEnd, yEnd)) {
            continue;
        }

        // Also check midpoints of each edge
        if (!isCellInsideShape((xStart + xEnd) >> 1, yStart) ||
            !isCellInsideShape((xStart + xEnd) >> 1, yEnd) ||
            !isCellInsideShape(xStart, (yStart + yEnd) >> 1) ||
            !isCellInsideShape(xEnd, (yStart + yEnd) >> 1)) {
            continue;
        }

        // Check perimeter cells
        let allInside = true;

        // Check top and bottom edges
        for (let x = xStart; x <= xEnd; x++) {
            if (!isCellInsideShape(x, yStart) || !isCellInsideShape(x, yEnd)) {
                allInside = false;
                break;
            }
        }

        // Check left and right edges (skip corners already checked)
        if (allInside) {
            for (let y = yStart + 1; y < yEnd; y++) {
                if (!isCellInsideShape(xStart, y) || !isCellInsideShape(xEnd, y)) {
                    allInside = false;
                    break;
                }
            }
        }

        if (allInside) {
            // found the largest valid rectangle

            const part2 = rect.area;
            Advent.Assert(part2, 24);
            await Advent.Submit(part2, 2);

            break;
        }
    }

}
Run();
