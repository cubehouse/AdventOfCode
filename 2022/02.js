import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(2, 2022);

// UI library
// import Window from '../lib/window.js';

const player1Map = {
    "A": "Rock",
    "B": "Paper",
    "C": "Scissors",
};
const player2Map = {
    "X": "Rock",
    "Y": "Paper",
    "Z": "Scissors",
};

const moves = [
    "Rock",
    "Paper",
    "Scissors",
];

// wrt. player 2's score
// returns 0 for draw, -1 for loss (player 1 wins), 1 for win (for player 2)
function getRoundWinner(player1, player2) {
    const player1Move = player1Map[player1];
    const player2Move = player2Map[player2];

    if (player1Move === player2Move) {
        return 0;
    } else if (player1Move === "Rock") {
        if (player2Move === "Paper") {
            return 1;
        } else {
            return -1;
        }
    } else if (player1Move === "Paper") {
        if (player2Move === "Scissors") {
            return 1;
        } else {
            return -1;
        }
    } else if (player1Move === "Scissors") {
        if (player2Move === "Rock") {
            return 1;
        } else {
            return -1;
        }
    }

    throw new Error("Invalid move");
}

// given a move, and a move requirement (X = lose, Y = draw, Z = win)
//  return the move that will satisfy the requirement
// returns string "Rock", "Paper", or "Scissors"
function getDesiredMove(player1, moveReq) {
    const player1Move = player1Map[player1];

    // Y = draw
    if (moveReq === "Y") {
        return player1Move;
    }

    // X = lose
    if (moveReq === "X") {
        // losing move is one backward in the list
        return moves[(moves.indexOf(player1Move) + 2) % 3];
    }

    // Z = win
    if (moveReq === "Z") {
        // winning move is one forward in the list
        return moves[(moves.indexOf(player1Move) + 1) % 3];
    }

    throw new Error("Invalid move");
}

function getMoveScore(move) {
    if (move === "Rock") {
        return 1;
    } else if (move === "Paper") {
        return 2;
    } else if (move === "Scissors") {
        return 3;
    }
    return 0;
}

async function Run() {
    const input = await Advent.GetInput();

    const rounds = input.map((x) => {
        return x.split(" ");
    });

    let score = 0;
    rounds.forEach((round) => {
        const player1 = round[0];
        const player2 = round[1];
        const winner = getRoundWinner(player1, player2);
        if (winner == 0) {
            score += 3;
        } else if (winner == 1) {
            score += 6;
        }
        score += getMoveScore(player2Map[player2]);
    });

    await Advent.Submit(score);

    // part 2
    let score2 = 0;
    rounds.forEach((round) => {
        const player1 = round[0];
        const player2Requirement = round[1];
        const player2Move = getDesiredMove(player1, player2Requirement);
        
        if (player2Requirement === 'Y') {
            score2 += 3;
        } else if (player2Requirement === 'Z') {
            score2 += 6;
        }
        score2 += getMoveScore(player2Move);
    });
    await Advent.Submit(score2, 2);
}
Run();
