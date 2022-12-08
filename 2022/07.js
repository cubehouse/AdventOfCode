import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(7, 2022);

// UI library
// import Window from '../lib/window.js';

async function Run() {
    const input = await Advent.GetInput();

    const root = {
        name: '',
        parent: null,
        children: [],
    };
    const allDirs = [root];
    let currentDir = root;
    input.forEach((line) => {
        // if line starts with $, it's a command
        if (line.startsWith('$')) {
            const cmd = line.slice(2).split(' ');
            if (cmd[0] === 'cd') {
                if (cmd[1] === '..') {
                    // .., switch currentDir pointer to our parent
                    currentDir = currentDir.parent;
                } else if (cmd[1] === '/') {
                    // /, switch currentDir pointer back to root
                    currentDir = root;
                } else {
                    // otherwise, we're creating a new dir
                    currentDir.children = currentDir.children || [];
                    // try and find the child first, so we don't create duplicates
                    const existingDir = currentDir.children.find((child) => child.name === cmd[1]);
                    if (existingDir) {
                        currentDir = existingDir;
                        return;
                    }
                    // if it doesn't exist, create it
                    const newIdx = currentDir.children.push({
                        name: cmd[1],
                        parent: currentDir,
                        children: [],
                    });
                    // remember the dir pointer in a master list of all directories
                    //  this will make looping over all dirs easier later
                    allDirs.push(currentDir.children[newIdx - 1]);
                    // then switch to our new child dir we just made
                    currentDir = currentDir.children[newIdx - 1];
                }
            }
        } else {
            // line contains a filesize and filename (not a command)
            const [size, name] = line.split(' ');
            currentDir.files = currentDir.files || [];
            // if size is "dir", then this is listing a directory and not a file    
            if (size === 'dir') {
                currentDir.children = currentDir.children || [];
                // skip if we already have this dir in our children
                if (currentDir.children.find((child) => child.name === name)) return;
                currentDir.children.push({
                    name,
                    parent: currentDir,
                    children: [],
                });
                allDirs.push(currentDir.children[currentDir.children.length - 1]);
            } else {
                // otherwise, it's a file!
                // add to our "files" array for each dir
                currentDir.files.push({
                    name,
                    size: parseInt(size, 10),
                });
            }
        }
    });

    const calculateSize = (node) => {
        let size = 0;
        if (node.files) {
            size += node.files.reduce((acc, file) => acc + file.size, 0);
        }
        if (node.children) {
            size += node.children.reduce((acc, child) => acc + calculateSize(child), 0);
        }
        node.size = size;
        return size;
    };
    // calculate the size of all dirs (recursively)
    calculateSize(root);

    // sum up all the dirs that are less than 100000
    const ans1 = allDirs.filter((x) => {
        // filter on size
        return x.size <= 100000;
    }).reduce((acc, dir) => {
        // sum them together
        return acc + dir.size;
    }, 0);

    await Advent.Submit(ans1);

    // part 2
    const diskTotal = 70000000;
    const spaceNeeded = 30000000;
    const currentUsage = root.size;

    // figure out how much space we need
    const newSpaceRequired = spaceNeeded - (diskTotal - currentUsage);
    // loop over all our dirs and filter for ones that are big enough
    const ans2 = allDirs.filter((x) => {
        return x.size >= newSpaceRequired;
    }).reduce((acc, dir) => {
        // pick the smallest dir that gives us the space we need
        if (dir.size < acc.size) return dir;
        return acc;
    }, { size: Infinity }).size;

    await Advent.Submit(ans2, 2);
}
Run();
