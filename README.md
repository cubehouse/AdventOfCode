# Advent Of Code

My Advent of Code Solutions.

I have built a framework that automates downloading inputs, but also submitting the answers.

## Setup

Create file `.env`, adding in your AdventOfCode session token.

Example format is available in .env.sample

## Usage

Run day scripts using `node 2021/01.js` (for example).

Your unique puzzle input will be automatically downloaded.

To submit an answer, run `node 2021/01.js --submit`. Without this, the answer will be generated, but not submitted to AoC.

To generate a year's solution files from template, run `node generate_files.js [YEAR]`
