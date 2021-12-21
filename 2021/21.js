import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(21, 2021);

async function Run() {
    const input = await Advent.GetInput();
    const input2 = `Player 1 starting position: 4
Player 2 starting position: 8`.split('\n');

    const players = input.map((x) => {
        const [player, position] = x.split(': ');
        // shift to a zero based index for simplicity
        return {
            startPos: parseInt(position) - 1,
            pos: parseInt(position) - 1,
            score: 0,
        };
    });

    let dieRolls = 0;
    const turn = (playerIDX) => {
        // roll dice three times
        const spaces = ((dieRolls + 2) * 3) % 300;
        dieRolls += 3;
        // get new space
        players[playerIDX].pos = (players[playerIDX].pos + spaces) % 10;
        players[playerIDX].score += (players[playerIDX].pos + 1);
    };

    let currentPlayer = 0;
    while (Math.max(...players.map((x) => x.score)) < 1000) {
        turn(currentPlayer);
        currentPlayer = (currentPlayer + 1) % players.length;
    }

    const ans1 = Math.min(...players.map((x) => x.score)) * dieRolls;
    await Advent.Submit(ans1);

    // part 2

    // position, position, score, score, roll counter
    const state = [...players.map((x) => x.startPos), ...players.map(() => 0), 0];
    const cache = new Map();
    const rollCountIDX = state.length - 1;

    const getCache = (state) => {
        if (cache.has(state.join('|'))) {
            return cache.get(state.join('|'));
        }
        return null;
    };

    const setCache = (state, value) => {
        cache.set(state.join('|'), value);
    };

    const step = (state, roll) => {
        const currentPlayer = Math.floor(state[rollCountIDX] / 3);
        // add roll to player position
        state[currentPlayer] = (state[currentPlayer] + roll) % 10;
        // if either player has 3 rolls, add to player score
        if (state[rollCountIDX] % 3 === 2) {
            state[currentPlayer + players.length] += state[currentPlayer] + 1;
        }
        // next turn
        state[rollCountIDX] = (state[rollCountIDX] + 1) % 6;
        return state; // return updated state
    };

    const tick = async (state) => {
        // search cache...
        const cachedResult = getCache(state);
        if (cachedResult !== null) {
            return cachedResult;
        }

        // look for winners
        for (let i = players.length; i < players.length * 2; i++) {
            if (state[i] >= 21) {
                return players.map((_, idx) => {
                    return idx === (i - players.length) ? 1 : 0;
                });
            }
        }

        const results = [
            await tick(step(state.slice(0), 1)),
            await tick(step(state.slice(0), 2)),
            await tick(step(state.slice(0), 3)),
        ].reduce((acc, cur) => {
            return acc.map((x, idx) => {
                return x + cur[idx];
            });
        }, players.map(() => 0));

        setCache(state, results);

        return results;
    };

    const winners = await (tick(state));
    await Advent.Submit(Math.max(...winners), 2);
}
Run();
