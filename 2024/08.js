import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(8, 2024);

import Screen from '../lib/screen.js';

async function Run() {
    const input = await Advent.GetInput(`............
........0...
.....0......
.......0....
....0.......
......A.....
............
............
........A...
.........A..
............
............`);

    const S = new Screen();

    S.AddStyle(/(\.)/, '{green-fg}');
    S.AddStyle(/([a-zA-Z0-9])/g, '{red-fg}');
    S.AddStyle(/(\#)/, '{yellow-fg}{bold}');

    // draw grid and find all our antennas
    const antennas = [];
    input.forEach((line, y) => {
        line.split('').forEach((cell, x) => {
            S.Set(x, y, cell);
            if (cell !== '.') {
                S.SetKey(x, y, 'antenna', cell);
                antennas.push({ x, y, id: cell });
            }
        });
    });

    // group antennas by id
    const antennaGroups = antennas.reduce((acc, antenna) => {
        const group = acc.find((g) => g.id === antenna.id);
        if (group) {
            group.antennas.push(antenna);
        } else {
            acc.push({ id: antenna.id, antennas: [antenna] });
        }
        return acc;
    }, []);

    const lineTraceAntennaPair = (a, b) => {
        const delta = { x: b.x - a.x, y: b.y - a.y };

        const points = [
            {
                x: b.x + delta.x,
                y: b.y + delta.y,
                id: b.id,
            },
            {
                x: a.x - delta.x,
                y: a.y - delta.y,
                id: a.id,
            }
        ];

        return points;
    };

    // for each antenna group, trace a line between each pair of antennas
    for(const group of antennaGroups) {
        for(let i = 0; i < group.antennas.length; i++) {
            for(let j = i + 1; j < group.antennas.length; j++) {
                const [a, b] = [group.antennas[i], group.antennas[j]];
                const points = lineTraceAntennaPair(a, b);
                for(const point of points) {
                    if (point.x < 0 || point.y < 0 || point.x >= input[0].length || point.y >= input.length) {
                        continue;
                    }

                    S.Set(point.x, point.y, '#');
                    const antinodes = S.GetKey(point.x, point.y, 'antinode') || [];
                    antinodes.push(point.id);
                    S.SetKey(point.x, point.y, 'antinode', antinodes);
                }
                await new Promise((resolve) => setTimeout(resolve, 0));
            }
        }
    }

    const ans1 = S.Cells.reduce((acc, cell) => {
        if (cell?.antinode) {
            return acc + 1;
        }
        return acc;
    }, 0);

    Advent.Assert(ans1, 14);
    await Advent.Submit(ans1);

    const traceAntennaPairToExtents = (a, b) => {
        const delta = { x: b.x - a.x, y: b.y - a.y };

        const points = [a, b];

        const tracePath = (start, delta) => {
            let x = start.x;
            let y = start.y;
            while(x >= 0 && y >= 0 && x < input[0].length && y < input.length) {
                if (x < 0 || y < 0 || x >= input[0].length || y >= input.length) {
                    break;
                }
                points.push({ x, y, id: start.id });
                x += delta.x;
                y += delta.y;
            }
        };
        tracePath(a, delta);
        tracePath(a, { x: -delta.x, y: -delta.y });

        return points;
    };

    // for each antenna group, trace a line between each pair of antennas
    for(const group of antennaGroups) {
        for(let i = 0; i < group.antennas.length; i++) {
            for(let j = i + 1; j < group.antennas.length; j++) {
                const [a, b] = [group.antennas[i], group.antennas[j]];
                const points = traceAntennaPairToExtents(a, b);
                for(const point of points) {
                    if (point.x < 0 || point.y < 0 || point.x >= input[0].length || point.y >= input.length) {
                        continue;
                    }

                    S.Set(point.x, point.y, '#');
                    const antinodes = S.GetKey(point.x, point.y, 'antinode') || [];
                    antinodes.push(point.id);
                    S.SetKey(point.x, point.y, 'antinode', antinodes);
                }
                await new Promise((resolve) => setTimeout(resolve, 0));
            }
        }
    }
    const ans2 = S.Cells.reduce((acc, cell) => {
        if (cell?.antinode) {
            return acc + 1;
        }
        return acc;
    }, 0);
    Advent.Assert(ans2, 34);

    await Advent.Submit(ans2, 2);
}
Run();
