import Grid from './grid.js';

import Colour from './colour.js';

// renderer
import sdl from '@kmamal/sdl';
import Canvas from 'canvas';

import { setTimeout } from 'timers/promises';
import fs from 'node:fs/promises';
import path from 'node:path';

// FFMPEG
if (!process.env.FFMPEG_PATH) {
    process.env.FFMPEG_PATH = path.resolve('./bin/ffmpeg.exe');
}
import ffmpeg from 'fluent-ffmpeg'

const args = process.argv.slice(2);
const renderEnabled = args.indexOf('--render') !== -1;

const exportToVideoAvailable = !!process.env.FFMPEG_PATH;

export default class GridWindow {
    constructor({
        title = 'AoC',
        screenWidth = null,
        screenHeight = null,
        size = 800, // shortcut to make square window
        clearColour = Colour.black,
        // should we export the window as a video file?
        renderToVideo = false,
        videoPath = './output.mp4',
    } = {}) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        this.forceSquare = false;

        if (size) {
            this.screenWidth = size;
            this.screenHeight = size;
            this.forceSquare = true;
        }

        this.clearColour = clearColour;

        // our grid object
        this.grid = new Grid();

        // render to video settings
        this.renderToVideo = (renderEnabled || renderToVideo) && exportToVideoAvailable;
        this.videoPath = videoPath;
        this._rendering = false;

        // create our output window
        this.window = sdl.video.createWindow({
            title: `${title} [xxx fps]`,
            width: this.screenWidth,
            height: this.screenHeight,
            resizable: true,
            ratio: 1,
        });

        this._windowClosing = false;
        this.window.on('beforeClose', ({ prevent }) => {
            if (this._windowClosing) {
                return;
            }
            this._windowClosing = true;

            prevent();
            this.stop();
        });

        const rebuildCanvas = () => {
            this.canvas = Canvas.createCanvas(this.screenWidth, this.screenHeight);
            this.ctx = this.canvas.getContext('2d');
            this.ctx.fillStyle = this.resetColour;
            this.ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
        };

        // allow resizing of the window
        this.window.on('resize', ({ width, height }) => {
            if (this.forceSquare) {
                if (width !== height) {
                    this.window.setSize(Math.min(width, height), Math.min(width, height));
                    return;
                }
            }

            this.screenWidth = width;
            this.screenHeight = height;

            rebuildCanvas();
            this.redrawCanvas();
        });

        // build our canvas
        rebuildCanvas();

        // start pixel grid size at 1x1
        this.width = 1;
        this.height = 1;

        // reset canvas to calculate pixel size
        this.redrawCanvas();

        // track the last frame time to calculate delta time
        this.lastFrameTime = Date.now();
        this.framesRendered = 0;

        this.fpsCounter = {
            lastTime: Date.now(),
            frames: 0,
            tick: () => {
                this.fpsCounter.frames++;
                const now = Date.now();
                if (now - this.fpsCounter.lastTime >= 1000) {
                    this.window.setTitle(`${title} [${this.fpsCounter.frames} fps]`);
                    this.fpsCounter.lastTime = now;
                    this.fpsCounter.frames = 0;
                }
            },
        };

        // allow for custom ticks
        this.ticks = [];

        // shortcuts
        this.setPixel = this.drawPixel;
        this.forEach = this.grid.forEach.bind(this.grid);
        this.reduce = this.grid.reduce.bind(this.grid);
        this.map = this.grid.map.bind(this.grid);
        this.filter = this.grid.filter.bind(this.grid);
        this.loop = () => { }; // nop
        this.get = this.grid.ReadCell.bind(this.grid);
        this.find = this.grid.find.bind(this.grid);

        // start the loop
        this._loop();
    }

    redrawCanvas() {
        this.pixelWidth = Math.floor(this.screenWidth / this.width);
        this.pixelHeight = Math.floor(this.screenHeight / this.height);
        // force grid to issue full redraw commands
        this.grid.fullRedraw = true;
    }

    setWidth(width) {
        const newWidth = Math.max(this.width, width);
        if (newWidth === this.width) {
            return;
        }

        this.width = newWidth;

        if (this.forceSquare) {
            const squareSize = Math.max(this.width, this.height);
            this.width = squareSize;
            this.height = squareSize;
        }

        this.redrawCanvas();
    }

    setHeight(height) {
        const newHeight = Math.max(this.height, height);
        if (newHeight === this.height) {
            return;
        }

        this.height = newHeight;

        if (this.forceSquare) {
            const squareSize = Math.max(this.width, this.height);
            this.width = squareSize;
            this.height = squareSize;
        }

        this.redrawCanvas();
    }

    pixelToScreen(x, y) {
        // figure out the screen position of a pixel, taking into account min x/y
        return {
            x: (x - this.grid.minX) * this.pixelWidth,
            y: (y - this.grid.minY) * this.pixelHeight,
        };
    }

    drawPixel(x, y, colour) {
        // set pixel in our grid store
        this.grid.setPixel(x, y, `rgba(${colour.r}, ${colour.g}, ${colour.b}, 255)`);
    }

    async _startRenderToVideo() {
        if (!this.renderToVideo || this._rendering) {
            return;
        }
        this._rendering = true;
        this._renderingFrame = 0;

        // clear video output (if it exists)
        if (await fs.access(this.videoPath).then(() => true).catch(() => false)) {
            await fs.unlink(this.videoPath);
        }

        // make sure directory "frames" exists
        await fs.mkdir('frames').catch(() => { });
    }

    async _endRenderToVideo() {
        if (!this.renderToVideo || !this._rendering) {
            return;
        }
        this._rendering = false;

        // render frames to video
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(path.resolve('./frames/frame-%05d.png'))
                .inputFPS(30)
                .videoCodec('libx264')
                .outputOptions([
                    '-crf 18',
                    // normal preset
                    '-preset veryfast',
                    '-pix_fmt yuv420p',
                ])
                .on('data', (data) => {
                    console.log(data);
                })
                .on('error', (err) => {
                    console.error(err);
                    reject(err);
                })
                .on('end', () => {
                    resolve();
                })
                .save(this.videoPath);
        });

        // cleanup frames
        await fs.rm('frames', { recursive: true }).catch(() => { });
    }

    /**
     * The main loop, runs until the window is destroyed
     */
    async _loop() {
        if (this.looping) {
            return;
        }
        this.looping = true;

        while (!this.window.destroyed) {
            await this._tick();
        }

        await this.stop();

        this.looping = false;
    }

    /**
     * Stop the window
     */
    async stop() {
        console.log('= Stopping window... =');
        console.log(`\tRendered ${this.framesRendered} frames`);

        if (this._rendering) {
            console.log('\tFinishing video render...');
            await this._endRenderToVideo();
        }

        if (this.window) {
            this.window.destroy();
        }
    }

    addTick(func) {
        this.ticks.push(func);
    }

    async _tick() {
        const now = Date.now();
        const deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;

        this.fpsCounter.tick();

        // tick logic
        await this.tick(deltaTime);
        for (const tick of this.ticks) {
            await tick(deltaTime);
        }
        // tick render
        await this.render(deltaTime, this.canvas);
        // run internal render to display the canvas
        await this._render(deltaTime);

        this.framesRendered++;
    }

    async _render(deltaTime) {
        // if pending a full redraw, clear the canvas first
        if (this.grid.fullRedraw) {
            // reset the size of the canvas
            const width = this.grid.Width;
            const height = this.grid.Height;
            this.setWidth(width);
            this.setHeight(height);

            this.ctx.fillStyle = `rgba(${this.clearColour.r}, ${this.clearColour.g}, ${this.clearColour.b}, 255)`;
            this.ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);
        }

        // draw the grid to the canvas
        await this.grid.draw(async (x, y, colour) => {
            const screenPos = this.pixelToScreen(x, y);
            this.ctx.fillStyle = colour;
            this.ctx.fillRect(screenPos.x, screenPos.y, this.pixelWidth, this.pixelHeight);
        });

        // export frame to file
        await this._startRenderToVideo();
        if (this._rendering) {
            this._renderingFrame++;

            const buf = this.canvas.toBuffer();
            // pad frame number with 0s
            const frameNum = this._renderingFrame.toString().padStart(5, '0');
            const framePath = `frames/frame-${frameNum}.png`;

            await fs.writeFile(framePath, buf);
        }

        this.ctx.restore();

        const pixelBuffer = this.canvas.toBuffer('raw');
        this.window.render(this.screenWidth, this.screenHeight, this.screenWidth * 4, 'bgra32', pixelBuffer);

        await setTimeout(0);
    }

    async tick(deltaTime) { }
    async render(deltaTime, canvas) { }

    /**
     * Wait for a number of milliseconds
     * @param {number} ms 
     */
    async sleep(ms) {
        await setTimeout(ms);
    }

    resetPixels() {
        this.grid.reset();
    }

    /**
     * 
     * @param {Number} x Min X to start applying the map
     * @param {Number} y Min Y to start applying the map
     * @param {Array} map 2D array of characters to apply
     * @param {Object} symbols Mapping of symbols to data. Each symbol should have an object with r, g, b values for colour, and any other data to apply to the pixel
     */
    applyASCIIMap(x, y, map, symbols) {
        for (let i = y; i < map.length; i++) {
            const row = map[i];
            for (let j = x; j < row.length; j++) {
                const char = row[j];
                const symbol = symbols[char];
                if (symbol) {
                    // draw pixel
                    this.drawPixel(j, i, { r: symbol.r || 0, g: symbol.g || 0, b: symbol.b || 0 });
                    // write all keys to the grid
                    const keys = Object.keys(symbol);
                    for (const key of keys) {
                        this.grid.WriteKey(j, i, key, symbol[key]);
                    }
                }
            }
        }
    }

    /**
     * Draw a line into the grid
     * @param {*} x1 
     * @param {*} y1 
     * @param {*} x2 
     * @param {*} y2 
     * @param {*} fn Function called on each pixel
     */
    async drawLine(x1, y1, x2, y2, fn) {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = (x1 < x2) ? 1 : -1;
        const sy = (y1 < y2) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            await fn(x1, y1);
            if ((x1 === x2) && (y1 === y2)) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x1 += sx; }
            if (e2 < dx) { err += dx; y1 += sy; }
        }
    }

    getKey(x, y, key) {
        return this.grid.ReadKey(x, y, key);
    }

    setKey(x, y, key, val) {
        this.grid.WriteKey(x, y, key, val);
    }

    async floodFill(x, y, conditionFunction, fillFunction) {
        const visited = new Array(this.grid.Width * this.grid.Height).fill(false);
        const queue = [];
        queue.push({ x, y, depth: 0 });

        while (queue.length > 0) {
            const { x, y, depth } = queue.shift();

            if (visited[x + y * this.grid.Width]) {
                continue;
            }

            // make sure we're within bounds
            if (x < this.grid.minX || x > this.grid.maxX || y < this.grid.minY || y > this.grid.maxY) {
                continue;
            }

            visited[x + y * this.grid.Width] = true;

            const cellData = this.grid.GetCreateCell(x, y);
            if (cellData === undefined) continue;

            const cell = { ...cellData, depth };
            if (await conditionFunction(cell, x, y)) {
                await fillFunction(cell, x, y, depth);
                queue.push({ x: x - 1, y, depth: depth + 1 });
                queue.push({ x: x + 1, y, depth: depth + 1 });
                queue.push({ x, y: y - 1, depth: depth + 1 });
                queue.push({ x, y: y + 1, depth: depth + 1 });
            }
        }
    }

    // inject some colours
    static yellow = Colour.yellow;
    static red = Colour.red;
    static blue = Colour.blue;
    static green = Colour.green;
    static white = Colour.white;
    static black = Colour.black;
    static orange = Colour.orange;
    static purple = Colour.purple;
    static pink = Colour.pink;
    static aqua = Colour.aqua;
    static brown = Colour.brown;
    static grey = Colour.grey;
    static violet = Colour.violet;

    static colourLerp = Colour.colourLerp;
    static hslToRgb = Colour.hslToRgb;

};
