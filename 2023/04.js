import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(4, 2023);

// UI library
// import Window from '../lib/window.js';


class Card {
    constructor(input) {
        // parse input, format: Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
        const cardRegex = /Card\s+(\d+): ([\d\s]+)\|([\d ]+)/g;
        const matches = cardRegex.exec(input);
        if (matches === null) {
            debugger;
        }
        this.id = parseInt(matches[1]);
        this.winningNumbers = matches[2].split(' ').map(x => parseInt(x));
        this.entry = matches[3].split(' ').map(x => parseInt(x));
    }

    ScorePart1() {
        let score = 0;
        for(let i = 0; i < this.winningNumbers.length; i++) {
            if (this.entry.indexOf(this.winningNumbers[i]) !== -1) {
                if (score === 0) {
                    score = 1;
                } else {
                    score = score * 2;
                }
            }
        }
        return score;
    }
}

async function Run() {
    const input = await Advent.GetInput();

    const cards = input.map((x) => {
        const card = new Card(x);
        return card;
    });

    const ans1 = cards.reduce((acc, card) => {
        return acc + card.ScorePart1();
    }, 0);

    await Advent.Submit(ans1);
    // await Advent.Submit(null, 2);
}
Run();
