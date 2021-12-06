import { Advent as AdventLib } from './lib/advent.js';
const Advent = new AdventLib(4, 2021);

class Bingo {
    constructor(input) {
        this.inputRaw = input;

        this.board = [];
        this.numbersCalled = [];
        this.complete = false;

        this.Reset();
    }

    Reset() {
        this.board = this.inputRaw.split('\n').map(row => {
            return row.trim().split(/\s+/).map(Number);
        });

        // check we get a square board
        for (let boardRow of this.board) {
            if (boardRow.length != this.board.length) {
                throw new Error('Invalid input ' + this.inputRaw);
            }
        }
        this.vertMarks = new Array(this.board.length).fill(0);
        this.horizMarks = new Array(this.board.length).fill(0);

        this.complete = false;
        this.numbersCalled = [];
    }

    MarkNumber(number) {
        if (this.complete) return;
        
        this.numbersCalled.push(number);

        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board.length; j++) {
                if (this.board[i][j] == number) {
                    this.board[i][j] = 'X';
                    this.vertMarks[i]++;
                    this.horizMarks[j]++;

                    if (this.vertMarks[i] == this.board.length) {
                        this.complete = true;
                        return true;
                    }
                    if (this.horizMarks[j] == this.board.length) {
                        this.complete = true;
                        return true;
                    }
                }
            }
        }

        return false;
    }

    ScoreBoard() {
        let score = 0;
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board.length; j++) {
                if (this.board[i][j] !== 'X') {
                    score += this.board[i][j];
                }
            }
        }
        return score * this.numbersCalled[this.numbersCalled.length - 1];
    }

}

async function Run() {
    const input = await Advent.GetInput();
    const input2 = `7,4,9,5,11,17,23,2,0,14,21,24,10,16,13,6,15,25,12,22,18,20,8,19,3,26,1

22 13 17 11  0
8  2 23  4 24
21  9 14 16  7
6 10  3 18  5
1 12 20 15 19

3 15  0  2 22
9 18 13 17  5
19  8  7 25 23
20 11 10 24  4
14 21 16 12  6

14 21 17 24  4
10 16 15  9 19
18  8 23 26 20
22 11 13  6  5
2  0 12  3  7
`.split(/[\r\n]/g);

    // create our bingo cards
    const cards = [];
    const card = [];
    for (let i = 1; i < input.length; i++) {
        if (input[i] == '') {
            if (card.length > 0) {
                cards.push(new Bingo(card.join('\n')));
                card.splice(0, card.length);
            }
        } else {
            card.push(input[i]);
        }
    }
    if (card.length > 0) {
        cards.push(new Bingo(card.join('\n')));
    }

    // keep running through numbers until a card completes
    const nums = input[0].split(',').map(Number);
    nums.find((x) => {
        // MarkNumber returns true when a card completes
        return cards.find(card => card.MarkNumber(x));
    });
    await Advent.Submit(cards.find((x) => x.complete).ScoreBoard());

    // part 2

    // reset all cards
    cards.forEach(card => card.Reset());

    // play until we have 1 remaining incomplete card (reduce counts the number of incomplete cards)
    let numIdx = 0;
    while(cards.reduce((acc, cur) => acc + (!cur.complete ? 1 : 0), 0) > 1) {
        // mark all cards with the next number
        cards.forEach(card => card.MarkNumber(nums[numIdx]));
        numIdx++;
    }

    const remainingCard = cards.filter(card => !card.complete);
    // sanity check in case multiple cards are completed in our last step (meaning multiple cards would be a solution??)
    if (remainingCard.length !== 1) {
        throw new Error('Failed to get one remaining card ' + remainingCard);
    }
    
    // we have the last card, finish completing it so we can score it
    while(!remainingCard[0].complete) {
        remainingCard[0].MarkNumber(nums[numIdx]);
        numIdx++;
    }

    await Advent.Submit(remainingCard[0].ScoreBoard(), 2);
}
Run();
