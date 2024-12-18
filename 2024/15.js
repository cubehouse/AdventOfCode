import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(15, 2024);

// UI library
import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput(`########
#..O.O.#
##@.O..#
#...O..#
#.#.O..#
#...O..#
#......#
########

<^^>>>vv<v>>v<<`);

    const input2Dir = {
        '^': { x: 0, y: -1 },
        'v': { x: 0, y: 1 },
        '<': { x: -1, y: 0 },
        '>': { x: 1, y: 0 },
    };

    const W = new Window({
        size: 400,
    });

    let parsingMoves = false;
    const moves = [];
    const boxes = [];
    const robot = {};
    input.forEach((line, y) => {
        if (line == '') {
            parsingMoves = true;
            return;
        }
        if (parsingMoves) {
            line.split('').forEach((move) => {
                moves.push(input2Dir[move]);
            });
            return;
        }

        line.split('').forEach((cell, x) => {
            W.setKey(x, y, 'wall', cell === '#');
            W.setPixel(x, y, cell === '#' ? Window.black : Window.white);

            if (cell === 'O') {
                boxes.push({ x, y, width: 1, height: 1 });
            }
            if (cell === '@') {
                robot.x = x;
                robot.y = y;
            }
        });
    });

    const isPointWithinBox = (point, box) => {
        return point.x >= box.x && point.x < box.x + box.width &&
            point.y >= box.y && point.y < box.y + box.height;
    }

    const getBoxCoordinates = (box) => {
        const coords = [];
        for (let x = box.x; x < box.x + box.width; x++) {
            for (let y = box.y; y < box.y + box.height; y++) {
                coords.push({ x, y });
            }
        }
        return coords;
    };

    const testBoxMove = (box, delta) => {
        // test if box can move into the new position
        // calculate spaces to test based on box width and height
        const boxSpaces = getBoxCoordinates(box);
        const spacesToTest = boxSpaces.map((point) => {
            return { x: point.x + delta.x, y: point.y + delta.y };
        }).filter((point) => {
            // remove spaces that are still within the box
            return !isPointWithinBox(point, box);
        });

        // test each space for a wall
        const hitWall = spacesToTest.find((point) => {
            return !!W.getKey(point.x, point.y, 'wall');
        });

        // if we hit a wall, return empty array (no things moved)
        if (hitWall) {
            return [];
        }

        // otherwise, look for any boxes in the way
        const hitBoxes = boxes.filter((otherBox) => {
            return spacesToTest.some((point) => {
                return isPointWithinBox(point, otherBox);
            });
        });

        // if we hit no boxes, return ourselves as a moved box
        if (hitBoxes.length === 0) {
            return [box];
        }

        // otherwise, recursively test the boxes
        const hitBoxesMoves = [box];
        for (const otherBox of hitBoxes) {
            const moves = testBoxMove(otherBox, delta);
            // if any box can't move, return empty array (no things moved)
            if (moves.length == 0) {
                return [];
            }
            hitBoxesMoves.push(...moves);
        }

        // if all boxes can move, return all boxes
        return hitBoxesMoves;
    }

    const moveRobot = (delta) => {
        const newRobot = { x: robot.x + delta.x, y: robot.y + delta.y };

        // look for walls in the way
        const hitWall = W.getKey(newRobot.x, newRobot.y, 'wall');
        if (hitWall) {
            return false;
        }

        // look for boxes in the way
        const hitBox = boxes.find((box) => {
            return isPointWithinBox(newRobot, box);
        });

        if (hitBox) {
            const newBoxes = testBoxMove(hitBox, delta);
            if (newBoxes.length === 0) {
                return false;
            }
            // success! move all boxes
            newBoxes.filter((box, idx, arr) => {
                // remove duplicates
                return arr.indexOf(box) === idx;
            }).forEach((box) => {
                for(const point of getBoxCoordinates(box)) {
                    W.setPixel(point.x, point.y, Window.white);
                }
                box.x += delta.x;
                box.y += delta.y;
                for(const point of getBoxCoordinates(box)) {
                    W.setPixel(point.x, point.y, Window.orange);
                }
            });
        }

        // made it this far, move the robot too
        W.setPixel(robot.x, robot.y, Window.white);
        robot.x = newRobot.x;
        robot.y = newRobot.y;
        W.setPixel(robot.x, robot.y, Window.green);
        return true;
    };

    const redraw = () => {
        W.forEach((x, y) => {
            const wall = W.getKey(x, y, 'wall');
            if (wall) {
                W.setPixel(x, y, Window.black);
            } else {
                W.setPixel(x, y, Window.white);
            }
        });

        boxes.forEach((box) => {
            getBoxCoordinates(box).forEach((point) => {
                W.setPixel(point.x, point.y, Window.orange);
            });
        });
    };

    redraw();

    let counter = 0;
    for (const move of moves) {
        moveRobot(move);
        counter++;
        if (counter % 10 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    }

    const ans1 = boxes.reduce((acc, box) => {
        return acc + (box.x + (box.y * 100));
    }, 0);
    await Advent.Submit(ans1);

    // Part 2
    // clear the board
    W.forEach((x, y) => {
        W.setKey(x, y, 'wall', undefined);
        W.setPixel(x, y, Window.white);
    });
    boxes.length = 0;

    // rebuild map with new boxes
    parsingMoves = false;
    input.forEach((line, y) => {
        if (line == '' || parsingMoves) {
            parsingMoves = true;
            return;
        }

        line.split('').forEach((cell, x) => {
            if (cell === '#') {
                W.setKey(x * 2, y, 'wall', true);
                W.setKey((x * 2) + 1, y, 'wall', true);
                W.setPixel(x * 2, y, Window.black);
                W.setPixel((x * 2) + 1, y, Window.black);
            } else if (cell === 'O') {
                boxes.push({ x: x * 2, y, width: 2, height: 1 });
                W.setKey(x * 2, y, 'wall', false);
                W.setKey((x * 2) + 1, y, 'wall', false);
            } else if (cell === '@') {
                robot.x = x * 2;
                robot.y = y;
                W.setKey(x * 2, y, 'wall', false);
                W.setKey((x * 2) + 1, y, 'wall', false);
            } else {
                W.setKey(x * 2, y, 'wall', false);
                W.setKey((x * 2) + 1, y, 'wall', false);
            }
        });
    });

    redraw();
    counter = 0;
    await new Promise((resolve) => setTimeout(resolve, 0));
    for (const move of moves) {
        moveRobot(move);
        counter++;
        if (counter % 10 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    }

    const ans2 = boxes.reduce((acc, box) => {
        return acc + (box.x + (box.y * 100));
    }, 0);
    await Advent.Submit(ans2, 2);
}
Run();
