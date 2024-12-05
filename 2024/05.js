import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(5, 2024);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput(`47|53
97|13
97|61
97|47
75|29
61|13
75|53
29|13
97|29
53|29
61|53
97|53
61|29
47|13
75|47
97|75
47|61
75|61
47|29
75|13
53|13

75,47,61,53,29
97,61,53,29,13
75,29,13
75,97,47,61,53
61,13,29
97,13,75,29,47`);

    const [ruleInput, pagesInput] = input.join("\n").split("\n\n").map(x => x.split("\n"));

    const rules = ruleInput.map((x) => {
        return x.split("|").map(Number);
    });
    const pages = pagesInput.map((x) => {
        return x.split(",").map(Number);
    });

    const testPages = (pages) => {
        // for each page
        for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
            // check each page ahead
            for (let aheadIdx = pageIdx + 1; aheadIdx < pages.length; aheadIdx++) {
                const page = pages[pageIdx];
                const ahead = pages[aheadIdx];

                // check each rule
                for (const rule of rules) {
                    const [a, b] = rule;
                    if (page === b && ahead === a) {
                        return false;
                    }
                }
            }
        }

        return true;
    };

    const getValidPages = (pages) => {
        const validPages = [];
        const invalidPages = [];
        for (const page of pages) {
            if (!testPages(page)) {
                invalidPages.push([...page]);
            } else {
                validPages.push([...page]);
            }
        }
        return [validPages, invalidPages];
    };

    const [validPages, invalidPages] = getValidPages(pages);
    const ans1 = validPages.reduce((acc, p) => {
        // get middle value
        const val = p[p.length / 2 | 0];
        return acc + val;
    }, 0);

    Advent.Assert(ans1, 143);
    await Advent.Submit(ans1);

    // === Part 2 ===

    invalidPages.forEach((page) => {
        page.sort((a, b) => {
            // find a rules where a is the first element and b is the second
            const rule = rules.find(([x, y]) => x === a && y === b);
            // if found, a must come before b
            if (rule) {
                return -1;
            }

            // find a rules where b is the first element and a is the second
            const rule2 = rules.find(([x, y]) => x === b && y === a);
            // if found, b must come before a
            if (rule2) {
                return 1;
            }

            return 0;
        });
    });

    const ans2 = invalidPages.reduce((acc, p) => {
        // get middle value
        const val = p[p.length / 2 | 0];
        return acc + val;
    }, 0);

    Advent.Assert(ans2, 123);

    await Advent.Submit(ans2, 2);
}
Run();
