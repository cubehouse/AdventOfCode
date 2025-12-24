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

    // await Advent.Submit(null, 2);
}
Run();
