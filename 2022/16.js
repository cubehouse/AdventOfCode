import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(16, 2022);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    // parse nodes
    const nodes = input.map((x) => {
        // lines are in format "Valve AA has flow rate=0; tunnels lead to valves DD, II, BB" or "Valve JJ has flow rate=21; tunnel leads to valve II"
        const [name, flow, ...tunnels] = x.match(/Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? (.*)/).slice(1);
        return {
            name,
            flow: parseInt(flow),
            tunnels: tunnels[0].split(', '),
        };
    });

    // shortcut map of node names -> flow rates
    const nodeFlowRates = nodes.reduce((acc, x) => {
        acc[x.name] = x.flow;
        return acc;
    }, {});

    // shortcut map of node names -> node objects
    const nodeLookup = nodes.reduce((acc, x) => {
        acc[x.name] = x;
        return acc;
    }, {});

    // list of all the nodes worth opening
    const openableNodes = nodes.filter((x) => x.flow > 0);

    // find shortest  distances between each node
    // list of all nodes we could ever route from (all nodes with flow > 0, plus the start node)
    const pathsToStartFrom = nodes.filter((x) => x.flow > 0 || x.name === 'AA');

    const pathLengths = pathsToStartFrom.reduce((acc, x) => {
        const distances = {};
        const queue = [{
            node: x,
            distance: 0,
        }];
        const visited = {};
        while (queue.length > 0) {
            const current = queue.shift();
            if (visited[current.node.name]) {
                continue;
            }

            visited[current.node.name] = true;
            if (openableNodes.find((y) => y.name === current.node.name)) {
                distances[current.node.name] = current.distance;
            }

            // add all the tunnels to the queue
            current.node.tunnels.forEach((tunnel) => {
                if (!visited[tunnel]) {
                    queue.push({
                        node: nodeLookup[tunnel],
                        distance: current.distance + 1,
                    });
                }
            });
        }
        acc[x.name] = distances;
        return acc;
    }, {});
    const openableNodeNames = openableNodes.map((x) => x.name);

    // A* between the openable nodes, recording the total flow rate of each one as we open them

    const run = async ({ maxSteps = 30, runElephant = false } = {}) => {
        const stateHashes = {};
        const hashState = (state) => {
            return state.openedNodes.sort().join(',') + "_" + state.stepsTaken + "_" + state.stepsTakenElephant;
        };

        const queue = [
            {
                node: nodeLookup['AA'],
                nodeElephant: nodeLookup['AA'],
                flowRate: 0,
                openedNodes: [],
                stepsTaken: 0,
                stepsTakenElephant: 0,
            }
        ];
        const bestFlowRate = {};
        const checkForBestFlowRate = (current, hash) => {
            if (!bestFlowRate.rate || current.flowRate > bestFlowRate.rate) {
                bestFlowRate.rate = current.flowRate;
                bestFlowRate.path = current.openedNodes;
                if (bestFlowRate.rate > 1500) {
                    console.log('new best flow rate', bestFlowRate.rate);
                }
            }

            if (!stateHashes[hash] || current.flowRate > stateHashes[hash]) {
                stateHashes[hash] = current.flowRate;
            }
        };

        let i = 0;
        while (queue.length > 0) {
            const current = queue.shift();

            const hash = current.hash || hashState(current);
            if (stateHashes[hash] && stateHashes[hash] >= current.flowRate) {
                continue;
            }

            // calculate total flow this node will add
            if (current.openedNodes.length >= openableNodeNames.length) {
                // we've opened all the nodes
                checkForBestFlowRate(current, hash);
                continue;
            }

            // elephant version of pathfinding
            if (runElephant) {
                // queue up going to each other node
                openableNodeNames.forEach((elephantNodeName) => {
                    if (current.openedNodes.find((x) => x === elephantNodeName)) {
                        // already opened this node
                        return;
                    }

                    const newElephantDistance = current.stepsTakenElephant + 1 /* to unlock the node */ + pathLengths[current.nodeElephant.name][elephantNodeName];
                    if (newElephantDistance > maxSteps) {
                        // before we bail, check if this is the best flow rate we've seen so far
                        //  we didn't unlock everything, but could still be the winner
                        checkForBestFlowRate(current, hash);
                        // too far away
                        return;
                    }

                    const newNode = nodeLookup[elephantNodeName];
                    const newFlow = current.flowRate + (newNode.flow * (maxSteps - newElephantDistance));
                    const newOpenedNodes = [...current.openedNodes, elephantNodeName];

                    // add to queue
                    const newQueueEntry = {
                        node: current.node,
                        nodeElephant: newNode,
                        flowRate: newFlow,
                        openedNodes: newOpenedNodes,
                        stepsTaken: current.stepsTaken,
                        stepsTakenElephant: newElephantDistance,
                    };

                    newQueueEntry.hash = hashState(newQueueEntry);
                    if (!stateHashes[newQueueEntry.hash] || stateHashes[newQueueEntry.hash] < newQueueEntry.flowRate) {
                        queue.unshift(newQueueEntry);
                    } else {
                        // add our current state to our stateHashes
                        stateHashes[hash] = current.flowRate;
                    }
                });
            }

            // queue up going to each other node
            openableNodeNames.forEach((nodeName) => {
                if (current.openedNodes.find((x) => x === nodeName)) {
                    // already opened this node
                    return;
                }

                const newDistance = current.stepsTaken + 1 /* to unlock the node */ + pathLengths[current.node.name][nodeName];
                if (newDistance > maxSteps) {
                    // before we bail, check if this is the best flow rate we've seen so far
                    //  we didn't unlock everything, but could still be the winner
                    checkForBestFlowRate(current);
                    // too far away
                    return;
                }

                const newNode = nodeLookup[nodeName];
                const newFlow = current.flowRate + (newNode.flow * (maxSteps - newDistance));
                const newOpenedNodes = [...current.openedNodes, nodeName];

                // add to queue
                const newQueueEntry = {
                    node: newNode,
                    flowRate: newFlow,
                    openedNodes: newOpenedNodes,
                    stepsTaken: newDistance,
                    // clone elephant stuff
                    nodeElephant: current.nodeElephant,
                    stepsTakenElephant: current.stepsTakenElephant,
                };
                newQueueEntry.hash = hashState(newQueueEntry);
                if (!stateHashes[newQueueEntry.hash] || stateHashes[newQueueEntry.hash] < newQueueEntry.flowRate) {
                    queue.unshift(newQueueEntry);
                } else {
                    // add our current state to our stateHashes
                    stateHashes[hash] = current.flowRate;
                }
            });

            i++;
            if (i % 100000 === 0) {
                // console.log(i, queue.length);
                await new Promise((resolve) => setTimeout(resolve, 0));
            }
        }

        return bestFlowRate;
    };

    const bestFlowRate1 = await run({});
    await Advent.Submit(bestFlowRate1.rate);

    // part 2

    const bestFlowRate2 = await run({
        maxSteps: 26,
        runElephant: true,
    });
    await Advent.Submit(bestFlowRate2.rate, 2);

    // await Advent.Submit(null, 2);
}
Run();
