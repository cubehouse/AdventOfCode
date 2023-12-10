import sdl from '@kmamal/sdl'
import Canvas from 'canvas'
import { setTimeout } from 'timers/promises'
import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'

const args = process.argv.slice(2);
const renderEnabled = args.indexOf('--render') !== -1;

let frameNumber = 0;
if (renderEnabled) {
    if (fs.existsSync('frames')) {
        fs.rmSync('frames', { recursive: true });
    }
    fs.mkdirSync('frames', { recursive: true });
}

export class Window {
    constructor({ width, height, title = '2D', pixelSize, windowWidth = 600, windowHeight = 600, resetColour = 'white' }) {
        this.pixelNum = width * height
        this.pixels = new Array(this.pixelNum);
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                this.pixels[x + y * width] = {
                    r: 255,
                    g: 255,
                    b: 255,
                    x,
                    y,
                };
            }
        }

        if (pixelSize === undefined) {
            // calculate pixelsize based on window size
            this.pixelSize = Math.ceil(Math.min(windowWidth / width, windowHeight / height));
        } else {
            this.pixelSize = pixelSize;
        }

        this.width = width;
        this.height = height;
        this.screenWidth = width * this.pixelSize;
        this.screenHeight = height * this.pixelSize;

        this.window = sdl.video.createWindow({
            title,
            width: this.screenWidth,
            height: this.screenHeight,
        });

        this.resetColour = resetColour;

        this.canvas = Canvas.createCanvas(this.screenWidth, this.screenHeight);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = this.resetColour;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ticks = [];

        // fps counter
        this.tic = Date.now();
        this.toc
        this.frames = 0;

        this.draws = [];
        this.drawIndex = {};
        this.forceRedraw = true;

        this.rendering = false;
    }

    resetPixels() {
        this.draws = [];

        for (let i = 0; i < this.pixels.length; i++) {
            const pix = this.pixels[i];
            pix.r = 255;
            pix.g = 255;
            pix.b = 255;
        }

        this.ctx.fillStyle = this.resetColour;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    static yellow = { r: 255, g: 255, b: 0 };
    static red = { r: 255, g: 0, b: 0 };
    static blue = { r: 0, g: 0, b: 255 };
    static green = { r: 0, g: 255, b: 0 };
    static white = { r: 255, g: 255, b: 255 };
    static black = { r: 0, g: 0, b: 0 };
    static orange = { r: 255, g: 165, b: 0 };
    static purple = { r: 255, g: 0, b: 255 };
    static pink = { r: 255, g: 192, b: 203 };
    static aqua = { r: 0, g: 255, b: 255 };
    static brown = { r: 165, g: 42, b: 42 };
    static grey = { r: 128, g: 128, b: 128 };
    static violet = { r: 238, g: 130, b: 238 };

    static colourLerp(a, b, alpha) {
        return {
            r: Math.round(a.r + (b.r - a.r) * alpha),
            g: Math.round(a.g + (b.g - a.g) * alpha),
            b: Math.round(a.b + (b.b - a.b) * alpha),
        };
    }

    static hslToRgb(h, s, l) {
        let r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;

                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
        };
    }

    async loop() {
        while (!this.window.destroyed) {
            // fps counter
            this.frames++;
            this.toc = Date.now();
            const ellapsed = (this.toc - this.tic) / 1e3;
            if (ellapsed >= 1) {
                const fps = Math.round(this.frames / ellapsed)

                this.window.setTitle(`FPS: ${fps}`)

                this.tic = this.toc
                this.frames = 0
            }

            for (let i = 0; i < this.ticks.length; i++) {
                this.ticks[i]();
            }

            await this.tickDraw();

            const pixelBuffer = this.canvas.toBuffer('raw');
            this.window.render(this.screenWidth, this.screenHeight, this.screenWidth * 4, 'bgra32', pixelBuffer);

            await setTimeout(0);
        }
    }

    addTick(func) {
        this.ticks.push(func);
    }

    applyASCIIMap(x, y, map, symbols) {
        for (let i = y; i < map.length; i++) {
            const row = map[i];
            for (let j = x; j < row.length; j++) {
                const char = row[j];
                const idx = i * this.width + j;
                const symbol = symbols[char];
                if (symbol) {
                    this.setPixel(j, i, { r: symbol.r || 0, g: symbol.g || 0, b: symbol.b || 0 });
                    this.pixels[idx] = {
                        ...this.pixels[idx],
                        ...symbol,
                    };
                }
            }
        }
    }

    async forEach(func) {
        for (let i = 0; i < this.pixels.length; i++) {
            await func(this.pixels[i], i % this.width, Math.floor(i / this.width));
        }
    }

    reduce(func, initialValue) {
        let accumulator = initialValue;
        for (let i = 0; i < this.pixels.length; i++) {
            accumulator = func(accumulator, this.pixels[i], i % this.width, Math.floor(i / this.width));
        }
        return accumulator;
    }

    setPixel(x, y, { r, g, b }) {
        // TODO - support auto exapansion?
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

        const idx = x + (y * this.width);
        const pix = this.pixels[idx];
        if (!pix) return false;
        if (pix.r === r && pix.g === g && pix.b === b) return false;

        pix.r = r;
        pix.g = g;
        pix.b = b;

        if (!this.drawIndex[idx]) {
            this.draws.push(idx);
            this.drawIndex[idx] = true;
        }

        return true;
    }

    get(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return undefined;
        }
        return this.pixels[x + y * this.width];
    }

    setKey(x, y, key, value) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        this.pixels[x + y * this.width][key] = value;
    }

    getKey(x, y, key) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return undefined;
        }
        if (!this.pixels[x + y * this.width]) {
            return undefined;
        }
        return this.pixels[x + y * this.width][key];
    }

    async floodFill(x, y, conditionFunction, fillFunction) {
        const visited = new Array(this.pixelNum);
        const queue = [];
        queue.push({ x, y, depth: 0 });

        while (queue.length > 0) {
            const { x, y, depth } = queue.shift();

            if (visited[x + y * this.width]) {
                continue;
            }
            visited[x + y * this.width] = true;

            const cellData = this.get(x, y);
            if (cellData === undefined) continue;

            const cell = { ...cellData, depth };
            if (await conditionFunction(cell, x, y)) {
                await fillFunction(cell, x, y);
                queue.push({ x: x - 1, y, depth: depth + 1 });
                queue.push({ x: x + 1, y, depth: depth + 1 });
                queue.push({ x, y: y - 1, depth: depth + 1 });
                queue.push({ x, y: y + 1, depth: depth + 1 });
            }
        }
    }

    async tickDraw() {
        // wait until rendering is done
        while (this.rendering) {
            await setTimeout(0);
        }

        if (!this.forceRedraw) {
            if (this.draws.length > 0) {
                for (let i = 0; i < this.draws.length; i++) {
                    const idx = this.draws[i];
                    const pixel = this.pixels[idx];
                    this.ctx.fillStyle = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;
                    this.ctx.fillRect(idx % this.width * this.pixelSize, Math.floor(idx / this.width) * this.pixelSize, this.pixelSize, this.pixelSize);
                }
                this.draws = [];
                this.drawIndex = {};
            }
            // export frame to file
            if (renderEnabled) {
                this.rendering = true;
                this.canvas.toBuffer((err, buf) => {
                    if (err) throw err;
                    frameNumber++;
                    // make sure firectory exists
                    if (!fs.existsSync('./frames')) {
                        fs.mkdirSync('./frames');
                    }
                    // pad frame number with 0s
                    const frameNum = frameNumber.toString().padStart(5, '0');
                    fs.writeFile(`./frames/${frameNum}.png`, buf, (err) => {
                        if (err) throw err;
                        this.rendering = false;
                    });
                });
            }
        } else {
            this.forceRedraw = false;

            this.ctx.fillStyle = this.resetColour;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // draw all our cells
            for (let i = 0; i < this.pixelNum; i++) {
                const x = i % this.width;
                const y = Math.floor(i / this.width);
                const pixel = this.pixels[i];
                this.ctx.fillStyle = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
                this.ctx.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
            }
        }

        this.ctx.restore();
    }

    drawLine(x1, y1, x2, y2, fn) {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = (x1 < x2) ? 1 : -1;
        const sy = (y1 < y2) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            fn(x1, y1);
            if ((x1 === x2) && (y1 === y2)) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x1 += sx; }
            if (e2 < dx) { err += dx; y1 += sy; }
        }
    }

    async exportVideo() {
        console.log('Exporting rendered frames to video...');
        return new Promise((resolve, reject) => {
            const video = ffmpeg();
            video
                .input('./frames/%05d.png')
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
                    reject(err);
                })
                .on('end', () => {
                    resolve();
                })
                .save('./output.mp4');
        });
    }

    async stop() {
        // if we're rendering, wait until we're done and then export the video
        if (renderEnabled) {
            while (this.rendering) {
                await setTimeout(0);
            }
            await this.exportVideo();
        }

        this.window.destroy();
    }
}

export default Window;
