import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(11, 2022);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    // parse monkeys
    const monkeys = [];
    let currentMonkey = null;
    for (const line of input) {
        if (line.startsWith('Monkey')) {
            monkeys.push({
                inspections: 0,
                worryDivider: BigInt(3),
            });
            currentMonkey = monkeys[monkeys.length - 1];
            const match = line.match(/Monkey (\d+)/);
            currentMonkey.id = match[1];
        }
        else if (line.startsWith('  Starting items: ')) {
            currentMonkey.startingItems = line.slice(18).split(', ').map(BigInt);
            currentMonkey.items = currentMonkey.startingItems.slice();
        }
        else if (line.startsWith('  Operation: new = ')) {
            currentMonkey.operation = line.slice(19).split(' ');
        }
        else if (line.startsWith('  Test: divisible by ')) {
            currentMonkey.test = BigInt(line.slice(21));
        }
        else if (line.startsWith('    If ')) {
            const match = line.match(/If (true|false)\: throw to monkey (\d+)/);
            if (!currentMonkey.if) currentMonkey.if = {};
            currentMonkey.if[match[1] == 'true'] = Number(match[2]);
        }
    }

    // this is the trick...
    //  keep modulo'ing by the product of all the monkey tests
    //  this means the test will keep working correctly, but the number will be smaller and saner to handle
    const monkeyTotalDiv = monkeys.reduce((a, b) => a * b.test, BigInt(1));

    const getNum = (inputNum, val) => {
        if (val === 'old') return inputNum;
        return BigInt(val);
    }

    const op = (inputNum, ops) => {
        switch (ops[1]) {
            case '+':
                return getNum(inputNum, ops[0]) + getNum(inputNum, ops[2]);
            case '*':
                return getNum(inputNum, ops[0]) * getNum(inputNum, ops[2]);
            case '-':
                return getNum(inputNum, ops[0]) - getNum(inputNum, ops[2]);
            case '/':
                return getNum(inputNum, ops[0]) / getNum(inputNum, ops[2]);
        }
        throw new Error('Unknown op ' + ops[1]);
    };

    const throw1 = (monkeyId) => {
        // grab first object
        monkeys[monkeyId].inspections++;
        const obj = monkeys[monkeyId].items.shift();
        let newObjValue = op(obj, monkeys[monkeyId].operation); 
        if (monkeys[monkeyId].worryDivider > 1) {
            newObjValue = newObjValue / monkeys[monkeyId].worryDivider;
        }
        newObjValue = newObjValue % monkeyTotalDiv;
        const testValue = newObjValue % monkeys[monkeyId].test;
        const newMonkeyId = monkeys[monkeyId].if[testValue == 0];
        //console.log('Throwing ' + obj + ' from ' + monkeyId + ' to ' + newMonkeyId + ' = ' + newObjValue);
        monkeys[newMonkeyId].items.push(newObjValue);
    };

    const turn1 = (monkeyId) => {
        const monkey = monkeys[monkeyId];
        //console.log('Monkey ' + monkeyId + ' has ' + monkey.items);
        while (monkey.items.length > 0) {
            throw1(monkeyId);
        }
    };

    const round1 = () => {
        for (const monkey of monkeys) {
            turn1(monkey.id);
        }
    };
    const roundsToRun1 = 20;
    for (let i = 0; i < roundsToRun1; i++) {
        round1();
    }
    const monkeyInspections = monkeys.map(m => m.inspections);
    // sort descending
    monkeyInspections.sort((a, b) => b - a);
    const answer1 = monkeyInspections[0] * monkeyInspections[1];

    await Advent.Submit(answer1);

    // part 2

    // reset everything
    for (const monkey of monkeys) {
        monkey.items = monkey.startingItems.slice();
        monkey.inspections = 0;
        monkey.worryDivider = BigInt(1);
    }
    const roundsToRun2 = 10000;
    for (let i = 0; i < roundsToRun2; i++) {
        round1();
    }
    const monkeyInspections2 = monkeys.map(m => m.inspections);
    // sort descending
    monkeyInspections2.sort((a, b) => b - a);
    const answer2 = monkeyInspections2[0] * monkeyInspections2[1];
    await Advent.Submit(answer2, 2);
}
Run();
