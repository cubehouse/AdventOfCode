import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(18, 2021);

async function Run() {
    const input = await Advent.GetInput();
    const input2 = `[[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]]
[7,[[[3,7],[4,3]],[[6,3],[8,8]]]]
[[2,[[0,8],[3,4]]],[[[6,7],1],[7,[1,6]]]]
[[[[2,4],7],[6,[0,5]]],[[[6,8],[2,8]],[[2,1],[4,5]]]]
[7,[5,[[3,8],[1,4]]]]
[[2,[2,2]],[8,[8,1]]]
[2,9]
[1,[[[9,3],9],[[9,0],[0,7]]]]
[[[5,[7,4]],7],1]
[[[[4,2],2],6],[8,7]]`.split(/\n/);

    const add = (a, b) => {
        return [a, b];
    };

    const getValFromPath = (tree, path) => {
        let node = tree;
        for (let i = 0; i < path.length; i++) {
            node = node[path[i]];
        }
        return node;
    };

    const setValUsingPath = (tree, path, val) => {
        // console.log(JSON.stringify(tree), path, val);
        if (path.length === 0) {
            return val;
        }
        let node = tree;
        for (let i = 0; i < path.length - 1; i++) {
            node = node[path[i]];
        }
        node[path[path.length - 1]] = val;
        return tree;
    };

    const findValues = (tree, condition, depth = 0) => {
        if (condition(tree)) {
            return [{
                val: tree,
                depth,
                path: [],
            }];
        }

        let values = [];
        for (let i = 0; i < tree.length; i++) {
            const newValues = findValues(tree[i], condition, depth + 1);
            newValues.forEach((x) => {
                x.path.unshift(i);
            });
            values = values.concat(newValues);
        }
        return values;
    };

    const findPairs = (tree, depth = 0) => {
        return findValues(tree, (x) => {
            return x.length === 2 && !isNaN(x[0]) && !isNaN(x[1]);
        });
    };

    const pathToPrevious = (tree, path) => {
        // not happy with this algorithm
        //  build list of all numbers in order left -> right
        // I had something smarter, but it failed some edge cases and I had to bail :(
        const vals = findValues(tree, (x) => {
            return !isNaN(x);
        }).map((x) => {
            return {
                ...x,
                pathString: x.path.join('.'),
            };
        });

        const needlePathString = [...path, 0].join('.');
        const pathIndex = vals.findIndex((x) => {
            return x.pathString === needlePathString;
        });
        if (pathIndex > 0) {
            return vals[pathIndex - 1].path;
        }
        return null;
    };

    const pathToNext = (tree, path) => {
        // return the next number in the sequence from this path
        for (let i = path.length - 1; i >= 0; i--) {
            if (path[i] === 0) {
                let newPath = path.slice(0, i).concat([1]);
                let node = getValFromPath(tree, newPath);
                // keep following path to the left until we find a number
                while (isNaN(node)) {
                    newPath.push(0);
                    node = node[0];
                }
                return newPath;
            }
        }
        // no number to our right
        return null;
    };

    const explode = (tree) => {
        const explosions = findPairs(tree).filter((x) => x.depth >= 4);

        if (explosions.length > 0) {
            const explosion = explosions[0];
            const prevPath = pathToPrevious(tree, explosion.path);
            const nextPath = pathToNext(tree, explosion.path);

            if (prevPath !== null && prevPath.length > 0) {
                tree = setValUsingPath(tree, prevPath, getValFromPath(tree, prevPath) + explosion.val[0]);
            }
            if (nextPath !== null && nextPath.length > 0) {
                tree = setValUsingPath(tree, nextPath, getValFromPath(tree, nextPath) + explosion.val[1]);
            }
            tree = setValUsingPath(tree, explosion.path, 0);

            // console.log(`After explode: ${JSON.stringify(tree)}`);

            return [tree, true];
        }

        return [tree, false];
    };

    const split = (tree) => {
        const splits = findValues(tree, (x) => !isNaN(x) && x >= 10);
        if (splits.length > 0) {
            const sp = splits[0];
            const left = Math.floor(sp.val / 2);
            const right = Math.ceil(sp.val / 2);
            tree = setValUsingPath(tree, sp.path, [left, right]);

            // console.log(`After split: ${JSON.stringify(tree)}`);

            return [tree, true];
        }

        return [tree, false];
    };

    const tick = (tree) => {
        const [newTree, exploded] = explode(tree);
        if (exploded) {
            return [newTree, true];
        }
        const [splitTree, didSplit] = split(tree);
        if (didSplit) {
            return [splitTree, true];
        }
        return [tree, false];
    };

    const reduce = (treeIn) => {
        let tree = treeIn;
        let running = true;
        while (running) {
            const [newTree, modified] = tick(tree);
            tree = newTree;
            if (!modified) {
                running = false;
            }
        }
        return tree;
    };

    const Tests = () => {
        const testExplode = (input, exp) => {
            let tree = JSON.parse(input);
            const [newTree, _] = explode(tree);
            if (JSON.stringify(newTree) !== exp) {
                console.log(`Test explode failed: ${input} -> ${exp} [${JSON.stringify(tree)}]`);
            }
        };

        const testSplit = (input, exp) => {
            let tree = JSON.parse(input);
            const [newTree, _] = split(tree);
            if (JSON.stringify(newTree) !== exp) {
                console.log(`Test split failed: ${input} -> ${exp} [${JSON.stringify(tree)}]`);
            }
        };

        const testReduce = (input, exp) => {
            let tree = JSON.parse(input);
            const newTree = reduce(tree);
            if (JSON.stringify(newTree) !== exp) {
                console.log(`Test run failed: ${input} -> ${exp} {{ ${JSON.stringify(tree)} }}`);
            }
        };

        const testAdd = (a, b, exp) => {
            const aTree = JSON.parse(a);
            const bTree = JSON.parse(b);
            const tree = add(aTree, bTree);
            return testReduce(JSON.stringify(tree), exp);
        };

        testExplode('[[[[[9,8],1],2],3],4]', '[[[[0,9],2],3],4]');
        testExplode('[7,[6,[5,[4,[3,2]]]]]', '[7,[6,[5,[7,0]]]]');
        testExplode('[[6,[5,[4,[3,2]]]],1]', '[[6,[5,[7,0]]],3]');
        testExplode('[[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]]', '[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]');
        testExplode('[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]', '[[3,[2,[8,0]]],[9,[5,[7,0]]]]');

        testSplit('[[[[0,7],4],[15,[0,13]]],[1,1]]', '[[[[0,7],4],[[7,8],[0,13]]],[1,1]]');
        testSplit('[[[[0,7],4],[[7,8],[0,13]]],[1,1]]', '[[[[0,7],4],[[7,8],[0,[6,7]]]],[1,1]]');

        testReduce('[[[[[4,3],4],4],[7,[[8,4],9]]],[1,1]]', '[[[[0,7],4],[[7,8],[6,0]]],[8,1]]');
        testReduce('[[[[1,1],[2,2]],[3,3]],[4,4]]', '[[[[1,1],[2,2]],[3,3]],[4,4]]');
        testReduce('[[[[[1,1],[2,2]],[3,3]],[4,4]],[5,5]]', '[[[[3,0],[5,3]],[4,4]],[5,5]]');
        testReduce('[[[[[[1,1],[2,2]],[3,3]],[4,4]],[5,5]],[6,6]]', '[[[[5,0],[7,4]],[5,5]],[6,6]]');

        testAdd('[[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]]', '[7,[[[3,7],[4,3]],[[6,3],[8,8]]]]', '[[[[4,0],[5,4]],[[7,7],[6,0]]],[[8,[7,7]],[[7,9],[5,0]]]]');
    };
    Tests();

    const run = (inputs) => {
        let tree = JSON.parse(inputs[0]);
        tree = reduce(tree);
        for (let i = 1; i < inputs.length; i++) {
            tree = add(tree, JSON.parse(inputs[i]));
            tree = reduce(tree);
        }
        return tree;
    };
    let tree = run(input);

    // reduce tree down
    let part1Tree = JSON.parse(JSON.stringify(tree));
    while (isNaN(part1Tree)) {
        const pairs = findPairs(part1Tree);
        for (const pair of pairs) {
            part1Tree = setValUsingPath(part1Tree, pair.path, pair.val[0] * 3 + pair.val[1] * 2);
        }
    }

    await Advent.Submit(part1Tree);
    // await Advent.Submit(null, 2);
}
Run();
