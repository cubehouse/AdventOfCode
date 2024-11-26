export class Grid {
    constructor() {
        this.cells = {};

        this.minX = null;
        this.maxX = null;
        this.minY = null;
        this.maxY = null;

        this.fullRedraw = true;
        this.drawCmds = [];

        this.cacheWidth = 0;
        this.cacheHeight = 0;

        this.setPixel = this.drawPixel = this.WritePixel;
    }

    get Width() {
        return this.maxX - this.minX + 1;
    }

    get Height() {
        return this.maxY - this.minY + 1;
    }

    ReadCell(x, y) {
        return this.cells[`${x}_${y}`];
    }

    GetCreateCell(x, y) {
        const cell = this.ReadCell(x, y);
        if (cell === undefined) {
            this.cells[`${x}_${y}`] = {
                x,
                y,
                val: ' ',
            };

            // calculate min/max of our grid
            if (this.minX === null || this.maxX === null || this.minY === null || this.maxY === null) {
                this.minX = x;
                this.maxX = x;
                this.minY = y;
                this.maxY = y;
                this.fullRedraw = true;
            } else {
                // if our dimentions change, request a full redraw
                this.minX = Math.min(this.minX, x);
                this.maxX = Math.max(this.maxX, x);
                this.minY = Math.min(this.minY, y);
                this.maxY = Math.max(this.maxY, y);
            }

            if (this.cacheWidth !== this.Width || this.cacheHeight !== this.Height) {
                this.fullRedraw = true;
                this.cacheWidth = this.Width;
                this.cacheHeight = this.Height;
            }

            return this.cells[`${x}_${y}`];
        }
        return cell;
    }

    WriteKey(x, y, key, val) {
        const cell = this.GetCreateCell(x, y);

        // queue up draw calls if we're changing the pixel colour
        if (key === 'pixel' && cell.pixel != val) {
            this.AddDrawCall(x, y, val);
        }

        cell[key] = val;
    }

    Write(x, y, val) {
        this.WriteKey(x, y, 'val', val);
    }

    WritePixel(x, y, pixel) {
        this.WriteKey(x, y, 'pixel', pixel);
    }

    ReadKey(x, y, key) {
        const cell = this.ReadCell(x, y);
        if (cell !== undefined) {
            return cell[key];
        }
        return undefined;
    }

    Read(x, y) {
        return this.ReadKey(x, y, 'val');
    }

    ReadPixel(x, y) {
        return this.ReadKey(x, y, 'pixel');
    }

    Print() {
        for (let y = this.minY; y <= this.maxY; y++) {
            const row = [];
            for (let x = this.minX; x <= this.maxX; x++) {
                const cell = this.ReadCell(x, y);
                row.push(cell === undefined ? ' ' : cell.val);
            }
            console.log(row.join(''));
        }
    }

    AddDrawCall(x, y, colour) {
        this.drawCmds.push({
            colour,
            x,
            y,
        });
    }

    generateFullRedrawCmds() {
        this.drawCmds.length = 0;

        const keys = Object.keys(this.cells);
        for (const key of keys) {
            const cell = this.cells[key];
            if (cell.pixel !== undefined) {
                this.AddDrawCall(cell.x, cell.y, cell.pixel);
            }
        }
    }

    async draw(cb) {
        // if we want a full refresh, generate our draw cmds first
        if (this.fullRedraw) {
            this.generateFullRedrawCmds();
            this.fullRedraw = false;
        }

        // call our incoming callback function with our draw calls
        //  will only call changed cells
        for (const pixel of this.drawCmds) {
            await cb(pixel.x, pixel.y, pixel.colour);
        }

        // clear our draw calls
        this.drawCmds.length = 0;
    }

    async forEach(cb) {
        const keys = Object.keys(this.cells);
        for (const key of keys) {
            const cell = this.cells[key];
            await cb(cell.x, cell.y, cell);
        }
    }

    async map(cb) {
        const arr = [];
        await this.forEach(async (...args) => {
            arr.push(await cb(...args));
        });
        return arr;
    }

    reset() {
        this.cells = {};
        this.minX = null;
        this.maxX = null;
        this.minY = null;
        this.maxY = null;
        this.fullRedraw = true;
        this.drawCmds = [];
        this.cacheWidth = 0;
        this.cacheHeight = 0;
    }
}

export default Grid;