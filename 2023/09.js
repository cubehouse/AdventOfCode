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

    
    // await Advent.Submit(null, 2);
}
Run();
