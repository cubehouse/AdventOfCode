import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(19, 2024);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput(`r, wr, b, g, bwu, rb, gb, br

brwrr
bggr
gbbr
rrbgbr
ubwu
bwurrg
brgr
bbrgwb`);

    // parse input
    const towels = input[0].split(',').map((towel) => {
        return towel.trim().split('');
    });
    const patterns = [];
    for (let i = 2; i < input.length; i++) {
        patterns.push(input[i].split(''));
    }

    const cache = {};
    const longestTowel = towels.reduce((acc, towel) => {
        return Math.max(acc, towel.length);
    }, 0);

    // given a pattern, find all the towels that could start this pattern
    const findTowelsAtStartOfPattern = (pattern) => {
        const patternToMatch = pattern.slice(0, longestTowel);
        if (cache[patternToMatch]) {
            return cache[patternToMatch];
        }

        const matchingTowels = [];
        for (const towel of towels) {
            let found = true;
            for (let towelIndex = 0; towelIndex < towel.length; towelIndex++) {
                if (towel[towelIndex] != pattern[towelIndex]) {
                    found = false;
                    break;
                }
            }

            if (found) {
                matchingTowels.push(towel);
            }
        }

        cache[patternToMatch] = matchingTowels;
        return matchingTowels;
    };

    const patternCache = {};
    const testPattern = (pattern) => {
        const cacheKey = pattern.join('');
        if (patternCache[cacheKey]) {
            return patternCache[cacheKey];
        }

        if (pattern.length == 0) {
            return [true, 1];
        }

        const matchingTowelsToStart = findTowelsAtStartOfPattern(pattern);
        if (matchingTowelsToStart.length == 0) {
            patternCache[cacheKey] = [false, 0];
            // if we have no matching towels, pattern cannot be matched, bail
            return [false, 0];
        }

        // otherwise, recurse with the rest of the pattern
        let total = 0;
        for (const towel of matchingTowelsToStart) {
            const newPattern = pattern.slice(towel.length);
            const [success, matches] = testPattern(newPattern);
            if (success) {
                total += matches;
            }
        }
        patternCache[cacheKey] = [true, total];
        return [total > 0, total];
    };

    let ans2 = 0;
    const ans1 = patterns.reduce((acc, pattern) => {
        const [success, matches] = testPattern(pattern);
        if (success) {
            ans2 += matches;
            return acc + 1;
        }
        return acc;
    }, 0);
    await Advent.Submit(ans1);

    await Advent.Submit(ans2, 2);
}
Run();
