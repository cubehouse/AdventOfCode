import { performance } from 'perf_hooks';
import EventEmitter from 'events';
import blessed from 'blessed';
import util from 'util';

const dirs = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
];

const moves = {
    up: dirs[3],
    down: dirs[1],
    left: dirs[2],
    right: dirs[0],
};

export class Screen extends EventEmitter {
    constructor({ fps, logWidth, simulate } = {}) {
        super();

        this.Grid = {};
        this.Cells = [];
        this.styles = [];

        this.simulate = simulate || false;
        this.paused = false;

        this.draws = [];

        this.minX = null;
        this.minY = null;
        this.maxX = null;
        this.maxY = null;

        this.shiftX = 0;
        this.shiftY = 0;

        this.log = [];
        this.logWidth = logWidth || 80;
        this.logRedraw = false;

        this.screen = blessed.screen({
            smartCSR: true,
        });
        this.logBox = blessed.text({
            top: 0,
            right: 0,
            width: this.logWidth || 80,
            height: '100%',
            border: {
                type: 'line'
            },
            style: {
                fg: 'white',
                bg: 'black',
                border: {
                    fg: '#ffa500'
                },
            },
            tags: false,
        });
        this.screen.append(this.logBox);

        this.originalConsoleLog = console.log;
        console.log = (...args) => {
            if (args.length > 0) {
                this.logBox.unshiftLine(args.map(util.inspect).join(' '));
                this.logRedraw = true;
            }
        };

        this.mapBox = blessed.text({
            top: 0,
            right: this.logWidth,
            width: "100%",
            scrollable: true,
            tags: true,
        });
        this.screen.append(this.mapBox);
        this.mapLines = {};

        this.fps = fps || 60;
        this.lastFrameTime = performance.now();
        this.ticks = [];

        process.stdout.on('resize', this.OnResize.bind(this));
        this.OnResize();

        this.screen.key(['escape', 'q', 'C-c'], () => {
            process.exit(0);
        });
        this.screen.key('p', () => {
            this.paused = !this.paused;
        });

        // start ticking
        this.tickHandle = setTimeout(this.Tick.bind(this), 0);

        this.screen.render();
    }

    /**
     * Disable this screen object
     */
    Stop() {
        this.paused = true;
        console.log = this.originalConsoleLog;
        clearTimeout(this.tickHandle);
        this.screen.destroy();
        process.stdout.off('resize', this.OnResize.bind(this));
    }

    static get moves() {
        return moves;
    }

    static get dirs() {
        return dirs;
    }

    /**
     * Helper function to loop over every cell in the grid
     * @param {function} func 
     * @returns 
     */
    ForEachCell(func) {
        return this.Cells.forEach(func);
    }

    find(fn) {
        return this.Cells.find(fn);
    }

    /**
     * Return an array of cells that are neighbors of the given cell
     * @param {Cell} cell 
     * @returns 
     */
    GetNeighbours(cell) {
        return dirs.map(d => { return { x: cell.x + d.x, y: cell.y + d.y } }).map(p => this.GetCell(p.x, p.y));
    }

    /**
     * Clean canvas panel
     */
    Clear() {
        Object.keys(this.Grid).forEach((k) => {
            delete this.Grid[k];
        });
        Object.keys(this.mapLines).forEach((k) => {
            delete this.mapLines[k];
        });
        this.Cells = [];
        this.draws.splice(0, this.draws.length);
        this.minX = null;
        this.minY = null;
        this.maxX = null;
        this.maxY = null;
        this.shiftX = 0;
        this.shiftY = 0;

        this.mapBox.setContent('');

        this.styleIdx = 0;
    }

    /**
     * Add a style to the screen
     * Eg. search: /(\#)/, style = '{red-fg}'
     * See https://github.com/chjj/blessed#content--tags
     * @param {regex} search 
     * @param {String} style 
     * @returns Style ID (need this later to remove)
     */
    AddStyle(search, style) {
        this.styleIdx++;
        this.styles.push({
            search: search,
            style,
            id: this.styleIdx,
        });
        return this.styleIdx;
    }

    /**
     * Remove a previously added style
     * @param {Number} id 
     */
    RemoveStyle(id) {
        this.styles = this.styles.filter(s => s.id !== id);
    }

    Redraw() {
        this.draws.splice(0, this.draws.length);
        for (let y = this.minY; y <= this.maxY; y++) {
            this.draws.push(y);
        }
    }

    OnResize() {
        this.width = process.stdout.columns;
        this.frameWidth = this.width - this.logWidth;
        this.height = process.stdout.rows;
        this.Redraw();

        this.emit('resize', this.width, this.height);
    }

    /**
     * Get a grid position (x,y) cell object's key (eg. 'val')
     * @param {Number} x 
     * @param {Number} y 
     * @param {String} key 
     * @returns 
     */
    GetKey(x, y, key) {
        const cell = this.GetCell(x, y);
        if (cell === undefined) return undefined;
        return cell[key];
    }

    /**
     * Get a grid position (x,y) cell object
     * Query .val to get the character value
     * @param {Number} x 
     * @param {Number} y 
     * @returns 
     */
    GetCell(x, y) {
        return this.Grid[`${x}_${y}`];
    }

    /**
     * Get the character at position x, y
     * @param {Number} x 
     * @param {Number} y 
     * @returns 
     */
    Get(x, y) {
        return this.GetKey(x, y, 'val');
    }

    /**
     * Set a grid position (x,y) to a character value
     * @param {Number} x 
     * @param {Number} y 
     * @param {String} char 
     * @returns 
     */
    Set(x, y, char) {
        char.split(/[\r\n]/).forEach((line, i) => {
            line.split('').forEach((c, j) => {
                this.SetKey(x + j, y + i, 'val', c);
            });
        });
    }

    SetKey(x, y, key, val) {
        const gridKey = `${x}_${y}`;

        if (this.Grid[gridKey] === undefined) {
            this.Grid[gridKey] = {
                x,
                y,
            };
            this.Cells.push(this.Grid[gridKey]);
        }
        const cell = this.Grid[gridKey];

        cell[key] = val;

        const redrawCell = (key === 'val') || (key === 'style');

        if (redrawCell) {
            if (this.mapLines[y] === undefined) {
                this.mapLines[y] = [];
            }
            if (this.mapLines[y].length < x) {
                this.mapLines[y] = this.mapLines[y].concat(new Array(x - this.mapLines[y].length).fill(' '));
            }
            this.mapLines[y][x] = cell.val;

            if (this.minX === null || this.minX > x || this.minY > y || this.maxX < x || this.maxY < y) {
                this.minX = Math.min(x, this.minX);
                this.minY = Math.min(y, this.minY);
                this.maxX = Math.max(x, this.maxX);
                this.maxY = Math.max(y, this.maxY);

                this.Redraw();
            } else {
                this.draws.push(y);
            }
        }
    }

    /** Runs func on everything in array todo until todo is empty */
    RunTodoList(todo, func) {
        return new Promise((resolve) => {
            const Queue = () => {
                if (this.paused) return;
                if (this.simulate && (this.draws.length > 0 || this.logRedraw)) {
                    setTimeout(Step, 0);
                } else {
                    setImmediate(Step);
                }
            }
            const Step = async () => {
                if (todo.length > 0) {
                    const res = await func(todo.shift());
                    if (res !== undefined && res.then !== undefined) {
                        res.then(() => {
                            Queue();
                        });
                    } else {
                        Queue();
                    }
                    return;
                }
                return resolve();
            };
            process.nextTick(Step);
        });
    }

    /**
     * Flood fill from x, y using condition to determine if a cell should be filled
     * @param {Number} x Starting x position of the fill
     * @param {Number} y Starting y position of the fill
     * @param {function} cond - function that returns true if we want to flood fill this cell
     * @param {function} func - function that does the flood fill
     * @returns 
     */
    async FloodFill(x, y, cond, func) {
        const todo = [{ x, y, depth: 0 }];
        const visited = {};
        const fill = async (c) => {
            visited[`${c.x},${c.y}`] = true;
            const cell = this.GetCell(c.x, c.y);
            if (await cond(cell)) {
                await func({ x: c.x, y: c.y, ...cell, depth: c.depth });
                dirs.map(d => {
                    return {
                        x: c.x + d.x,
                        y: c.y + d.y,
                        depth: c.depth + 1,
                    };
                }).filter(pos => visited[`${pos.x},${pos.y}`] === undefined).forEach(pos => {
                    if (todo.find(t => t.x === pos.x && t.y === pos.y) === undefined) {
                        todo.push({ x: pos.x, y: pos.y, depth: pos.depth });
                    }
                });
            }
        };
        return this.RunTodoList(todo, fill);
    }

    GenCellString(cell) {
        if (cell.val === undefined) return ' ';
        let val = cell.val;
        this.styles.forEach((s) => {
            // TODO - run each regex over original val, but transplant any results into the built-up result string manually
            if (cell.val.match(s.search)) {
                val = cell.val.replace(s.search, `${s.style}$1{/}`);
            }
        });
        if (cell.style !== undefined) {
            val = `${cell.style}${val}{/}`;
        }
        return val;
    }

    /** How wide is the drawing canvas */
    get canvasWidth() {
        return this.screen.width - this.logWidth;
    }

    /** How high is the drawing canvas */
    get canvasHeight() {
        return this.screen.height;
    }

    FitPositionOntoScreen(x, y, border = 0) {
        // skip if we haven't drawn anything yet
        if (this.minY === undefined) return;
        if (this.minX === undefined) return;

        const bufferWidth = this.maxX - this.minX + 1;
        const bufferHeight = this.maxY - this.minY + 1;

        // if our buffer already fits the canvas, don't do anything
        if (bufferWidth <= this.canvasWidth && bufferHeight <= this.canvasHeight) {
            return;
        }

        if (bufferHeight > this.canvasHeight) {
            // constrain y to the existing buffer
            if (y < this.minY) {
                y = this.minY;
            } else if (y > this.maxY) {
                y = this.maxY;
            }

            if (y > this.canvasHeight - border) {
                this.shiftY = this.canvasHeight - border - y - 1 + this.minY;
            } else if (y < border) {
                this.shiftY = border - y + this.minY;
            } else {
                this.shiftY = 0;
            }
        }

        if (bufferWidth > this.canvasWidth) {
            // constrain x to the existing buffer
            if (x < this.minX) {
                x = this.minX;
            } else if (x > this.maxX) {
                x = this.maxX;
            }

            if (x > this.canvasWidth - border) {
                this.shiftX = this.canvasWidth - border - x - 1 + this.minX;
            } else if (x < border) {
                this.shiftX = border - x + this.minX;
            } else {
                this.shiftX = 0;
            }
        }

        this.Redraw();
    }

    Draw() {
        if (this.draws.length === 0 && !this.logRedraw) return;

        const boxWidth = this.canvasWidth;
        this.draws.filter((val, idx, arr) => arr.indexOf(val) === idx).forEach((y) => {
            const frameY = y - this.minY;
            const line = [];
            for (let x = this.minX - this.shiftX; x <= this.maxX; x++) {
                const cell = this.GetCell(x, y - this.shiftY);
                if (cell === undefined) {
                    line.push(' ');
                } else {
                    line.push(this.GenCellString(cell));
                }
            }
            this.mapBox.setBaseLine(frameY, line.slice(0, boxWidth - 1).join(''));
        });

        // clear our draw list
        this.draws.splice(0, this.draws.length);
        this.logRedraw = false;

        this.screen.render();
    }

    /**
     * Add a tick callback that will be executed before each frame is drawn
     * @param {function} fn 
     */
    AddTick(fn) {
        this.ticks.push(fn);
    }

    Tick() {
        // generate rough time delta
        const now = performance.now();
        const timeDelta = now - this.lastFrameTime;
        this.lastFrameTime = now;

        if (!this.paused) {
            // tick all registered ticks
            this.ticks.forEach((tick) => {
                tick(timeDelta);
            });

            this.emit('tick', timeDelta);

            this.Draw();
        }

        // schedule next frame to try and roughly maintain target FPS
        const nextFrame = Math.max(0, (1000 / this.fps) - (performance.now() - now));
        setTimeout(this.Tick.bind(this), nextFrame);
    }

    /**
     * Find the shortest path from start to end
     * @param {Number} startX 
     * @param {Number} startY 
     * @param {Number} endX 
     * @param {Number} endY 
     * @param {function} evaluationFunction Function that determines if a cell is valid to traverse
     * @returns Array of {x, y} objects representing the path. Will contain x+1 number of moves (includes start AND end position)
     */
    async SolveRoute(startX, startY, endX, endY, evaluationFunction) {
        const depths = {};
        await this.FloodFill(startX, startY, evaluationFunction, async (cell) => {
            depths[`${cell.x},${cell.y}`] = cell.depth;
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
                return this.GetCell(x, y) || { x, y };
            }).filter(evaluationFunction);

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

    /**
     * 2D Ray Trace across the screen grid
     * @param {Number} startX 
     * @param {Number} startY 
     * @param {Number} deltaX 
     * @param {Number} deltaY 
     * @param {function} evaluationFunction 
     * @returns 
     */
    Trace(startX, startY, deltaX, deltaY, evaluationFunction) {
        const path = [];
        let x = startX;
        let y = startY;
        let runs = 10000;
        while (true && runs > 0) {
            const cell = this.GetCell(x, y);
            if (!evaluationFunction(cell)) {
                return path;
            }
            path.push(cell);
            x += deltaX;
            y += deltaY;
            runs--;
        }
        return undefined;
    }
}

export default Screen;
