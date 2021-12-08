import { Screen } from '../lib/screen.js';

async function Run() {
    const S = new Screen();

    S.Set(0, 0, `#####################
#  S#   #       #   #
# ####### ##### #####
#     # #   #   #   #
# ### # # ### ##### #
# #     # #   # #   #
### ### # ### # # ###
#   # #       #   # #
# ### ####### # ### #
#   #     #         #
### ##### # ### # ###
#       #   # # #   #
# ### # ### # #######
#   # # #   # #     #
### ### ##### # #####
#   #     #   #   #E#
####### ### ##### # #
#   #         #   # #
# # # # # # ### ### #
# #   # # #         #
#####################`);

    const solveMaze = async () => {
        // clear any non-wall tiles
        const cells = [];
        S.ForEachCell((cell) => {
            if (cell?.val !== '#') {
                S.Set(cell.x, cell.y, ' ');
                cells.push(cell);
            }
        });

        const start = cells[Math.floor(Math.random() * cells.length)];
        const end = cells[Math.floor(Math.random() * cells.length)];
        S.Set(start.x, start.y, 'S');
        S.Set(end.x, end.y, 'E');

        // add some terminal colours to the maze
        S.AddStyle(/(S)/, '{green-fg}');
        S.AddStyle(/(E)/, '{red-fg}');
        S.AddStyle(/(\*)/, '{blue-fg}');
        S.AddStyle(/(#)/, '{white-bg}');

        const route = await S.SolveRoute(start.x, start.y, end.x, end.y, (cell) => {
            return cell?.val !== '#';
        });

        if (!route) {
            console.log('No route found!');
            return;
        }

        route.forEach((cell) => {
            if (cell.val === ' ') {
                S.Set(cell.x, cell.y, '*');
            }
        });

        console.log(`Found route with ${route.length - 1} steps`);
    };

    solveMaze();
    // s randomly solves another maze
    S.AddInput('s', solveMaze);

    console.log('Press s to solve another maze, q to quit');
}
Run();
