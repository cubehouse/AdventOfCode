import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(8, 2025);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const nodes = input.map((node, idx) => {
        const [x, y, z] = node.split(',').map(Number);
        return {
            x: x,
            y: y,
            z: z,
            circuit: (idx + 1) * -1,
        };
    });

    const distances = {};
    const distance_sorted_map = [];

    const calculateDistance = (a, b) => {
        let dist = 0;
        // pythag it
        dist += (a.x - b.x) * (a.x - b.x);
        dist += (a.y - b.y) * (a.y - b.y);
        dist += (a.z - b.z) * (a.z - b.z);
        dist = Math.sqrt(dist);
        return dist;
    };

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const nodeA = nodes[i];
            const nodeB = nodes[j];
            distances[`${i},${j}`] = calculateDistance(nodeA, nodeB);
            distance_sorted_map.push({
                nodeA: i,
                nodeB: j,
                key: `${i},${j}`,
                distance: distances[`${i},${j}`]
            });
        }
    }
    distance_sorted_map.sort((a, b) => a.distance - b.distance);

    const connectNodes = (nodeA, nodeB) => {
        if (nodeA.circuit < 0 && nodeB.circuit < 0) {
            const newCircuit = Math.max(...nodes.map(n => n.circuit)) + 1;
            nodeA.circuit = newCircuit;
            nodeB.circuit = newCircuit;
        } else if (nodeA.circuit >= 0 && nodeB.circuit < 0) {
            nodeB.circuit = nodeA.circuit;
        } else if (nodeA.circuit < 0 && nodeB.circuit >= 0) {
            nodeA.circuit = nodeB.circuit;
        } else if (nodeA.circuit >= 0 && nodeB.circuit >= 0 && nodeA.circuit !== nodeB.circuit) {
            const oldCircuit = nodeB.circuit;
            const newCircuit = nodeA.circuit;
            nodes.forEach(n => {
                if (n.circuit === oldCircuit) {
                    n.circuit = newCircuit;
                }
            });
        }
    };

    const nearestDistances = Advent.SampleMode ? 10 : 1000;
    for (let nodeidx = 0; nodeidx < nearestDistances; nodeidx++) {
        const distanceEntry = distance_sorted_map[nodeidx];
        const nodeA = nodes[distanceEntry.nodeA];
        const nodeB = nodes[distanceEntry.nodeB];
        connectNodes(nodeA, nodeB);
    }

    const circuits = nodes.reduce((acc, node) => {
        const findCircuit = acc.find(c => c[0].circuit === node.circuit);
        if (findCircuit) {
            findCircuit.push(node);
        } else {
            acc.push([node]);
        }
        return acc;
    }, []);
    circuits.sort((a, b) => b.length - a.length);
    
    const part1 = circuits.slice(0, 3).reduce((acc, circuit) => acc * circuit.length, 1);
    await Advent.Submit(part1);
    
    // await Advent.Submit(null, 2);
}
Run();
