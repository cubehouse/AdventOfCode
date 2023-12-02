import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(2, 2023);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    // parse games into a structure
    //  gameID: int
    //  rounds: array of round objects
    //      red: int
    //      green: int
    //      blue: int
    const games = input.map((x, idx) => {
        const gameID = idx + 1;
        const rounds = x.split(":")[1].trim().split(";").map((y) => {
            return y.split(",").reduce((p, z) => {
                const parts = z.trim().split(" ");
                p[parts[1]] = parseInt(parts[0]);
                return p;
            }, {});
        });
        return {
            gameID,
            rounds
        };
    });

    // filter out games with invalid rounds (too many of a colour)
    const maxSizes = {
        red: 12,
        green: 13,
        blue: 14,
    };
    const validGames = [];
    games.forEach((game) => {
        const invalidGame = game.rounds.find((round) => {
            if (round.red > maxSizes.red || round.green > maxSizes.green || round.blue > maxSizes.blue) {
                return true;
            }
            return false;
        });
        if (!invalidGame) {
            validGames.push(game);
        }
    });

    // add up valid games
    const ans1 = validGames.reduce((p, x) => {
        return p + x.gameID;
    }, 0);
    await Advent.Submit(ans1);

    // await Advent.Submit(null, 2);
}
Run();
