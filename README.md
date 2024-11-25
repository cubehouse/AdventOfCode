# Advent Of Code

My Advent of Code Solutions.

I have built a framework that automates downloading inputs, but also submitting the answers.

## Setup

Create file `.env`, adding in your AdventOfCode session token.

Example format is available in .env.sample

## Dependencies

You will need GTK (cairo) installed to run the window library.
https://github.com/Automattic/node-canvas/wiki/Installation:-Windows

Run `npm install` to install dependencies.

## Usage

Run day scripts using `node 2021/01.js` (for example).

Your unique puzzle input will be automatically downloaded.

To submit an answer, run `node 2021/01.js --submit`. Without this, the answer will be generated, but not submitted to AoC.

To generate a year's solution files from template, run `node generate_files.js [YEAR]`

## Libs

### Window

Creates a window that can render pixels.

Run with `--render` to automatically capture the window as a video.

Copy ffmpeg.exe into bin/ to get video support.

```
import Window from '../lib/window.js';

// create window with defined width and height (in pixels)
const W = new Window({ width: 5, height: 5 });

// set a pixel colour
W.setPixel(0, 0, Window.green);

// set arbitrary data on each cell
W.setKey(0, 0, 'wall', true);

// loop over all cells in window
W.forEach((cellObj, x, y) => {

});

// start window renderer
W.loop();
```