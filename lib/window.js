import sdl from '@kmamal/sdl'
import Canvas from 'canvas'
import { setTimeout } from 'timers/promises'

export class Window {
    constructor({ width, height, title = '2D', pixelSize, windowWidth = 600, windowHeight = 600 }) {
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
            this.pixelSize = Math.min(windowWidth / width, windowHeight / height);
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

        this.canvas = Canvas.createCanvas(this.screenWidth, this.screenHeight);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ticks = [];

        // fps counter
        this.tic = Date.now();
        this.toc
        this.frames = 0;

        this.draws = [];
        this.forceRedraw = true;
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

            this.tickDraw();

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

    setPixel(x, y, { r, g, b }) {
        const idx = x + y * this.width;
        if (this.pixels[idx]?.r !== r || this.pixels[idx]?.g !== g || this.pixels[idx]?.b !== b) {
            this.pixels[idx].r = r;
            this.pixels[idx].g = g;
            this.pixels[idx].b = b;

            this.draws.push(idx);

            return true;
        }
        return false;
    }

    get(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return undefined;
        }
        return this.pixels[x + y * this.width];
    }

    setKey(x, y, key, value) {
        this.pixels[x + y * this.width][key] = value;
    }

    getKey(x, y, key) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
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

    tickDraw() {
        if (!this.forceRedraw) {
            if (this.draws.length > 0) {
                for (let i = 0; i < this.draws.length; i++) {
                    const idx = this.draws[i];
                    const pixel = this.pixels[idx];
                    this.ctx.fillStyle = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;
                    this.ctx.fillRect(idx % this.width * this.pixelSize, Math.floor(idx / this.width) * this.pixelSize, this.pixelSize, this.pixelSize);
                }
                this.draws = [];
            }
        } else {
            this.forceRedraw = false;

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

    stop() {
        this.window.destroy();
    }
}

export default Window;
