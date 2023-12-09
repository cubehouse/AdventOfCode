import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(9, 2023);

class Sequence {
    constructor(input) {
        this.numbers = input.split(/\s/g).map(Number);

        this.sequences = [[].concat(this.numbers)];

        this.Evaluate();
    }

    static GenerateDiffArray(in_arr) {
        const arr = in_arr.slice();
        const diffs = [];
        for (let i = 0; i < arr.length - 1; i++) {
            diffs.push(arr[i + 1] - arr[i]);
        }
        return diffs;
    }

    static IsArrayAllZeroes(arr) {
        return arr.every((x) => x === 0);
    }

    Evaluate() {
        let sequenceDepth = 0;
        let currentSequence = [].concat(this.numbers);
        
        while (!Sequence.IsArrayAllZeroes(currentSequence)) {
            currentSequence = Sequence.GenerateDiffArray(currentSequence);
            this.sequences.push(currentSequence);
            sequenceDepth++;
        }

        this.depth = sequenceDepth;
        return sequenceDepth;
    }

    GenerateNextValue() {
        return this.sequences.reduce((acc, sequence) => {
            return acc + sequence[ sequence.length - 1 ];
        }, 0);
    }

    GeneratePreviousValue() {
        const vals = [0];
        for (let i = 1; i < this.depth; i++) {
            vals.push(
                this.sequences[this.sequences.length - i - 1][0] - vals[vals.length - 1]
            );
        }

        return this.numbers[0] - vals[vals.length - 1];
    }
}

async function Run() {
    const input = await Advent.GetInput();

    const sequences = input.map((line) => new Sequence(line));
    Advent.Assert(sequences[0].GenerateNextValue(), 18);
    Advent.Assert(sequences[1].GenerateNextValue(), 28);
    Advent.Assert(sequences[2].GenerateNextValue(), 68);

    const ans1 = sequences.reduce((acc, sequence) => {
        const nextNum = sequence.GenerateNextValue();
        return acc + nextNum;
    }, 0);

    await Advent.Submit(ans1);

    //  === Part 2 ===
    Advent.Assert(sequences[0].GeneratePreviousValue(), -3);
    Advent.Assert(sequences[1].GeneratePreviousValue(), 0);
    Advent.Assert(sequences[2].GeneratePreviousValue(), 5);

    const ans2 = sequences.reduce((acc, sequence) => {
        const prevNum = sequence.GeneratePreviousValue();
        return acc + prevNum;
    }, 0);
    Advent.Assert(ans2, 2);
    
    await Advent.Submit(ans2, 2);
}
Run();
