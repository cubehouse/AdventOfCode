import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(7, 2023);


const cardMap = {
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    'T': 10, // 10
    'J': 11, // Jack
    'Q': 12, // Queen
    'K': 13, // King
    'A': 14, // Ace
};

class Hand {
    constructor(input) {
        const [cardsIn, bidIn] = input.split(' ');
        this.bid = parseInt(bidIn);
        this.cards = cardsIn.split('').map((card) => cardMap[card]);

        // calculate groups of matching values
        this.groups = {};
        this.cards.forEach((card) => {
            if (!this.groups[card]) {
                this.groups[card] = 0;
            }
            this.groups[card]++;
        });

        const jokers = this.groups[1] || 0;
        if (jokers > 0) {
            delete this.groups[1]; // ignore jokers for now
        }
        
        this.groupSizes = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
        };
        Object.values(this.groups).forEach((group) => {
            this.groupSizes[group]++;
        });

        const uniqueCards = Object.keys(this.groups).length;
        const largestGroupOfCards = +Object.values(this.groups).sort().pop() + jokers;
        this.handValue = (5 - uniqueCards) + largestGroupOfCards;
        if (jokers === 5) {
            // edgecase when you have 5 jokers
            this.handValue = 9;
        }

        // generate a "high card value" that breaks ties
        //  it's early, this will do
        this.highCardValue = 
        (this.cards[0] * 100000000) +
        (this.cards[1] * 1000000) +
        (this.cards[2] * 10000) +
        (this.cards[3] * 100) +
        (this.cards[4]);
    };

    Compare(other) {
        if (this.handValue > other.handValue) {
            return 1;
        } else if (this.handValue < other.handValue) {
            return -1;
        } else {
            if (this.highCardValue > other.highCardValue) {
                return 1;
            } else if (this.highCardValue < other.highCardValue) {
                return -1;
            } else {
                return 0;
            }
        }
    }
}

async function Run() {
    const input = await Advent.GetInput();

    // build hands and sort them
    const hands = input.map((line) => new Hand(line));
    hands.sort((a, b) => a.Compare(b));

    const ans1 = hands.reduce((acc, hand, idx) => {
        return acc + (hand.bid * (idx + 1));
    }, 0);
    Advent.Assert(ans1, 6440);

    await Advent.Submit(ans1);

    // == Part 2 ==
    cardMap['J'] = 1;

    // rebuild hands with new Joker value
    const hands2 = input.map((line) => new Hand(line));
    hands2.sort((a, b) => a.Compare(b));
    const ans2 = hands2.reduce((acc, hand, idx) => {
        return acc + (hand.bid * (idx + 1));
    }, 0);

    Advent.Assert(ans2, 5905);
    await Advent.Submit(ans2, 2);
}
Run();
