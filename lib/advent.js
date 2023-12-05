import dotenv from 'dotenv';
dotenv.config();

const quietMode = false;

const args = process.argv.slice(2);
const submitEnabled = args.indexOf('--submit') !== -1;
const sampleMode = args.indexOf('--sample') !== -1;

if (sampleMode) {
    console.log('!!! Sample mode enabled !!!');
}

import fs from 'fs';
import util from 'util';
import path from 'path';
import http from 'https';
import querystring from 'querystring';
import { PerformanceObserver, performance } from 'perf_hooks';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const session = process.env.AOCSESSION;
if (!session) {
    console.error('No session token found');
    process.exit(1);
}

const obs = new PerformanceObserver((items) => {
    if (!quietMode) console.log(`Took ${(items.getEntries()[0].duration / 1000).toFixed(2)} seconds`);
    performance.clearMarks();
});
obs.observe({ entryTypes: ['measure'] });
performance.mark('A');
function exitHandler(e) {
    if (e) {
        console.error(e);
    }
    performance.mark('B');
    performance.measure('A to B', 'A', 'B');
    process.exit(0);
}
process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('uncaughtException', exitHandler);

export class Advent {
    constructor(day, year) {
        this.Day = day;
        this.Year = year || 2015;
    }

    get DateName() {
        return this.Day.toString().padStart(2, '0');
    }

    get InputDir() {
        return path.join(__dirname, '..', 'inputs', this.Year.toString());
    }

    // are we running in sample mode?
    //  returns boolean
    get SampleMode() {
        return sampleMode;
    }

    get InputFilename() {
        if (sampleMode) {
            return path.join(this.InputDir, `${this.DateName}-sample.txt`);
        }
        return path.join(this.InputDir, `${this.DateName}.txt`);
    }

    get RecordFilename() {
        if (sampleMode) {
            return path.join(this.InputDir, `${this.DateName}-sample.json`);
        }
        return path.join(this.InputDir, `${this.DateName}.json`);
    }

    DownloadInput() {
        return new Promise((resolve, reject) => {
            console.log(`Downloading input to ${this.InputFilename}...`);
            if (!fs.existsSync(this.InputDir)) {
                fs.mkdirSync(this.InputDir, {
                    recursive: true,
                });
            }
            const req = http.request({
                hostname: 'adventofcode.com',
                port: 443,
                path: `/${this.Year}/day/${this.Day}/input`,
                method: 'GET',
                headers: {
                    'Cookie': `session=${session}`,
                }
            }, (res) => {
                const inputFile = fs.openSync(this.InputFilename, 'w');
                res.on('data', (chunk) => {
                    fs.writeSync(inputFile, chunk);
                });
                res.on('end', () => {
                    if (!quietMode) console.log('Done');
                    resolve();
                });
            });

            req.on('error', (e) => {
                console.error(e);
                reject(e);
            });
            req.end();
        });
    }

    ReadInput() {
        if (!fs.existsSync(this.InputFilename)) return Promise.reject(new Error('Input file doesn\'t exist'));
        return util.promisify(fs.readFile)(this.InputFilename);
    }

    GetInputRaw() {
        if (!fs.existsSync(this.InputFilename)) {
            return this.DownloadInput().then(() => {
                return this.ReadInput();
            });
        }

        return this.ReadInput();
    }

    GetInput() {
        return this.GetInputRaw().then((fileBuffer) => {
            const lines = fileBuffer.toString().split(/\r\n|\r|\n/g);
            if (lines[lines.length - 1] === '') {
                lines.splice(lines.length - 1);
            }
            return Promise.resolve(lines.length == 1 ? lines[0] : lines);
        });
    }

    GetInputNumbers() {
        return this.GetInput().then((lines) => {
            return Promise.resolve(lines.map((line) => parseInt(line)));
        });
    }

    // Get input and parse each line with a regex
    //  regexMap: Map of regexes to parse each line with
    //   eg. {"op1": {regex: /(.*)/}, "op2": {regex: /(.*)/}}
    //  returns: Array of objects with keys matching the regexMap
    GetInputRegexLines(regexMap) {
        return this.GetInput().then((lines) => {
            return Promise.resolve(lines.map((line) => {
                const obj = {};
                Object.keys(regexMap).forEach((key) => {
                    const match = regexMap[key].regex.exec(line);
                    if (match) {
                        obj[key] = regexMap[key].parse(match);
                    }
                });
                return obj;
            }));
        });
    }

    ReadRecord() {
        if (this.Record !== undefined) return Promise.resolve(this.Record);

        if (!fs.existsSync(this.RecordFilename)) {
            this.Record = {
                parts: [
                    {
                        answer: null,
                        guesses: [],
                    },
                    {
                        answer: null,
                        guesses: [],
                    }
                ]
            };

            return Promise.resolve(this.Record);
        }

        return util.promisify(fs.readFile)(this.RecordFilename).then((fileBuffer) => {
            this.Record = JSON.parse(fileBuffer.toString());
            return Promise.resolve(this.Record);
        });
    }

    WriteRecord() {
        fs.writeFileSync(this.RecordFilename, JSON.stringify(this.Record, null, 2));
    }

    RecordGuess(answer, level) {
        this.Record.parts[level - 1].guesses.push(answer);
        this.WriteRecord();
    }

    Submit(answer, level = 1) {
        if (!quietMode) console.log(`Submitting answer ${answer} for part ${level}...`);
        return this.ReadRecord().then((record) => {
            // skip if we already have the corret answer
            if (record.parts[level - 1].answer !== null) {
                if (!quietMode) console.log(`* Already submitted correct answer for part ${level} (${record.parts[level - 1].answer})`);

                return Promise.resolve();
            }

            if (record.parts[level - 1].guesses.indexOf(answer) >= 0) {
                return Promise.reject(new Error('Already incorrectly guessed this answer'));
            }

            return new Promise((resolve, reject) => {
                if (!submitEnabled) {
                    if (!quietMode) console.log(`* Skipping submission, use --submit to enable`);
                    return resolve();
                }

                if (sampleMode) {
                    return Promise.reject(new Error('Can\'t submit answers in sample mode'));
                }

                const postData = querystring.stringify({
                    level: level,
                    answer: answer,
                });

                const req = http.request({
                    hostname: 'adventofcode.com',
                    port: 443,
                    path: `/${this.Year}/day/${this.Day}/answer`,
                    method: 'POST',
                    headers: {
                        'Cookie': `session=${session}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': postData.length,
                    }
                }, (res) => {
                    let response = '';
                    res.on('data', (chunk) => {
                        response += chunk;
                    });
                    res.on('end', () => {
                        if (response.indexOf('not the right answer') >= 0) {
                            this.RecordGuess(answer, level);
                            return reject(new Error('Incorrect answer'));
                        }

                        if (response.indexOf('You gave an answer too recently') >= 0) {
                            const m = /You have(?: ([0-9]+)m)? ([0-9]+)s left to wait/.exec(response);
                            let seconds = 0;
                            if (m) {
                                if (m[2]) {
                                    seconds = Number(m[1]) * 60 + Number(m[2]);
                                } else {
                                    seconds = Number(m[1]);
                                }
                            } else {
                                seconds = 60;
                            }

                            if (seconds <= 5 || Number.isNaN(seconds)) seconds = 60;

                            if (!quietMode) console.log(`Too many incorrect guesses. Waiting ${seconds} seconds...`);

                            return new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    this.Submit(answer, level).then(resolve).catch(reject);
                                }, seconds * 1000);
                            });
                        }

                        if (response.indexOf('That\'s the right answer!') >= 0) {
                            record.parts[level - 1].answer = answer;
                            this.WriteRecord();

                            if (!quietMode) console.log(`Correct answer submitted!`);

                            return resolve();
                        }

                        if (response.indexOf('Did you already complete it') >= 0) {
                            record.parts[level - 1].answer = answer;
                            this.WriteRecord();

                            if (!quietMode) console.log(`Correct answer already submitted!`);

                            return resolve();
                        }

                        return reject(new Error('Unknown response'));
                    });
                });

                req.on('error', (e) => {
                    console.error(e);
                    reject(e);
                });

                req.write(postData);
                req.end();
            });
        });
    }

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    wait(ms) {
        return this.sleep(ms);
    }

    getPermutations(arr) {
        // https://www.30secondsofcode.org/js/s/permutations
        if (arr.length <= 2) return arr.length === 2 ? [arr, [arr[1], arr[0]]] : arr;
        return arr.reduce(
            (acc, item, i) =>
                acc.concat(
                    this.getPermutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map(val => [
                        item,
                        ...val,
                    ])
                ),
            []
        );
    }

    // helper assert for unit testing against sample input
    Assert(value, message) {
        // only assert if in sample mode
        if (sampleMode) {
            
            const err = getErrorObject();
            const segs = err.stack.split("\n");
            const caller_line = segs[segs.length - 1];
            const pieces = caller_line.split(":");
            const lineNumber = pieces[pieces.length - 2];

            if (!value) {
                if (message) {
                    console.error(`Assertion failed: Line ${lineNumber}: ${message}`);
                } else {
                    console.error(`Assertion failed: Line ${lineNumber}`);
                }
                console.trace();
                process.exit(1);
            } else {
                // colour green
                if (!quietMode) {
                    console.log('\x1b[32m%s\x1b[0m', `Assertion passed: Line ${lineNumber}`);
                }
            }
        }
    }
}

function getErrorObject(){
    try { throw Error('') } catch(err) { return err; }
}

export default Advent;
