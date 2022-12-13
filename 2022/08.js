import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(8, 2022);

// UI library
import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const forrestWidth = input[0].length;
    const forrestHeight = input.length;

    const W = new Window({ width: forrestWidth, height: forrestHeight });

    // draw our forrest!
    const forrest = input.map((line) => line.split(''));
    forrest.forEach((row, y) => {
        row.forEach((cell, x) => {
            W.setPixel(x, y, Window.colourLerp(Window.red, Window.green, (cell / 9)));
        });
    });
    W.loop();

    // delay a moment so we can appreciate the forrest
    await new Promise((resolve) => setTimeout(resolve, 500));

    const testDirection = (visibilityData, dirKey = 'left', searchKey = 'x', searchFrom, searchTo, rowCol, cellValue) => {
        if (!visibilityData[dirKey]) {
            visibilityData[dirKey] = true;
            for (let i = searchFrom; i !== searchTo; i += searchTo > searchFrom ? 1 : -1) {
                const cell = searchKey === 'x' ? forrest[rowCol][i] : forrest[i][rowCol];
                visibilityData[`${dirKey}Num`]++;
                if (cell >= cellValue) {
                    visibilityData[dirKey] = false;
                    break;
                }
            }
        }
    }

    const isCellVisible = (x, y) => {
        const visibilityData = {
            top: false,
            bottom: false,
            left: false,
            right: false,
            topNum: 0,
            bottomNum: 0,
            leftNum: 0,
            rightNum: 0,
        };
        // edges of the forrest are always visible
        if (x <= 0) {
            visibilityData.left = true;
        }
        if (x >= forrestWidth - 1) {
            visibilityData.right = true;
        }
        if (y <= 0) {
            visibilityData.top = true;
        }
        if (y >= forrestHeight - 1) {
            visibilityData.bottom = true;
        }

        const cellValue = forrest[y][x];
        testDirection(visibilityData, 'left', 'x', x - 1, -1, y, cellValue);
        testDirection(visibilityData, 'right', 'x', x + 1, forrestWidth, y, cellValue);
        testDirection(visibilityData, 'top', 'y', y - 1, -1, x, cellValue);
        testDirection(visibilityData, 'bottom', 'y', y + 1, forrestHeight, x, cellValue);

        visibilityData.visible = visibilityData.top || visibilityData.bottom || visibilityData.left || visibilityData.right;
        visibilityData.treeScore = visibilityData.topNum * visibilityData.bottomNum * visibilityData.leftNum * visibilityData.rightNum;
        return visibilityData;
    };

    let countVisibleTrees = 0;
    await W.forEach(async (cell, x, y) => {
        const visible = isCellVisible(x, y);
        W.setKey(x, y, 'data', visible);
        if (visible.visible) {
            countVisibleTrees++;
            W.setPixel(x, y, Window.red);
        } else {
            W.setPixel(x, y, Window.blue);
        }
        // slow down the loop so it animates nicely :)
        if (x % 20 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 1));
        }
    });

    await Advent.Submit(countVisibleTrees);

    // part 2
    // pick cell with highest tree score
    const bestSpot = W.reduce((acc, cell, x, y) => {
        if (cell.data.treeScore > acc) {
            return cell.data.treeScore;
        }
        return acc;
    }, 0);
    await Advent.Submit(bestSpot, 2);

    await W.stop();
}
Run();
