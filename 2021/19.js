import { Advent as AdventLib } from '../lib/advent.js';
const Advent = new AdventLib(19, 2021);

function rotate90InAxis(axis, point) {
    if (axis === 'x') {
        return [point[0], point[2], -point[1]];
    } else if (axis === 'y') {
        return [point[2], point[1], -point[0]];
    } else {
        return [-point[1], point[0], point[2]];
    }
}

// given a 3d point, return all 24 rotations in x, -x, y, -y, z, -z
const transformPointToAllRotations = (point) => {
    // why not every iteration?
    //  because things like [-x, y, z] are a mirror in z, not a rotation
    const result = [];

    // base rotations (pointing in each 6 directions)
    result.push(point);
    for (let i = 0; i < 3; i++) {
        result.push(rotate90InAxis('z', result[result.length - 1]));
    }
    result.push(rotate90InAxis('y', result[0]));
    const baseRot180 = rotate90InAxis('y', result[result.length - 1]);
    result.push(rotate90InAxis('y', baseRot180));

    // rotate each face 3 times
    const rotateFace = (face, axis) => {
        result.push(rotate90InAxis(axis, result[face]));
        for (let i = 0; i < 2; i++) {
            result.push(rotate90InAxis(axis, result[result.length - 1]));
        }
    };
    rotateFace(0, 'x');
    rotateFace(1, 'y');
    rotateFace(2, 'x');
    rotateFace(3, 'y');
    rotateFace(4, 'z');
    rotateFace(5, 'z');

    return result;
};

// calculate all possible rotations for [1,2,3] and build a new function to generate the list quickly
//  I could hardcode this.... but this is more fun/weird
const baseRots = transformPointToAllRotations([1, 2, 3]);
const transformFunc = eval(`([x,y,z]) => { return [${baseRots.map((x) => {
    return '[' + x.map((char) => {
        switch (char) {
            case -1:
                return '-x';
            case 1:
                return 'x';
            case -2:
                return '-y';
            case 2:
                return 'y';
            case -3:
                return '-z';
            case 3:
                return 'z';
            default:
                return NaN;
        }
    }).join(',') + ']';
})}]; }`);

class Scanner {
    constructor(input) {
        this.input = input;

        this.scannerID = Number(input[0].substr(12).split(' ')[0]);
        if (isNaN(this.scannerID)) {
            throw new Error('Invalid scanner ID from input line 0');
        }

        this.basePoints = input.slice(1).map(line => {
            return line.split(',').map(Number);
        });

        this.worldLocation = null;
        this.correctOrientation = null;

        this.rotations = new Array(24);

        this.setup();
    }

    setup() {
        // calculate and store all our rotation options
        for (let i = 0; i < 24; i++) {
            this.rotations[i] = [];
        }
        this.basePoints.forEach((point) => {
            const rotations = transformPointToAllRotations(point);
            rotations.forEach((rot, i) => {
                this.rotations[i].push(rot);
            });
        });

        // build remapped lists to each point as the center of the scanner
        this.remappedBasePoints = this.basePoints.map((base) => {
            return this.basePoints.map((other) => {
                return Scanner.rebasePoint(other, base);
            });
        });
    }

    static rebasePoint([x, y, z], [tx, ty, tz]) {
        return [x - tx, y - ty, z - tz];
    }

    // return how many points in each array match
    testTwoPointSets(points1, points2) {
        let count = 0;
        points1.forEach((point1) => {
            points2.forEach((point2) => {
                if (point1[0] === point2[0] && point1[1] === point2[1] && point1[2] === point2[2]) {
                    count++;
                }
            });
        });
        return count;
    }

    // given an orientation, test it against each possible point in our set
    // returns [success, otherScannerOffset, newPointsToAddToThis]
    testOrientation(otherPoints) {
        // we have precalculated our own points remapped to each point as an origin
        for (let i = 0; i < this.remappedBasePoints.length; i++) {
            const points = this.remappedBasePoints[i];
            // remap incoming points to zero too
            for (let j = 0; j < otherPoints.length; j++) {
                const remappedPoints = otherPoints.map((point) => {
                    return Scanner.rebasePoint(point, otherPoints[j]);
                });
                const matches = this.testTwoPointSets(points, remappedPoints);
                if (matches >= 12) {
                    const newScannerOffset = this.basePoints[i].map((x, idx) => x - otherPoints[j][idx]);
                    const newPoints = otherPoints.map((point) => {
                        return point.map((x, idx) => x + newScannerOffset[idx]);
                    });
                    return [true, newScannerOffset, newPoints];
                }
            }
        }
        return [false];
    }

    match(otherScanner) {
        // loop over all rotation options in other scanner to find right orientation
        for (let i = 0; i < 24; i++) {
            const [result, newOffset, newPoints] = this.testOrientation(otherScanner.rotations[i]);
            if (result) {
                console.log(`Scanner ${this.scannerID} matched scanner ${otherScanner.scannerID} at ${newOffset}`);

                // found matching orientation!
                newPoints.forEach((point) => {
                    // check point doesn't already exist
                    const existingPoint = this.basePoints.find((x) => {
                        return x[0] === point[0] && x[1] === point[1] && x[2] === point[2];
                    });
                    if (!existingPoint) {
                        this.basePoints.push(point);
                    }
                });
                this.setup();

                otherScanner.worldLocation = newOffset;
                otherScanner.correctOrientation = i;

                return true;
            }
        }
        return false;
    }
}

async function Run() {
    const input = await Advent.GetInput();
    const input3 = `--- scanner 0 ---
7,0,0
8,0,0
9,0,0

--- scanner 1 ---
1,0,0
2,0,0
3,0,0`.split('\n');
    const input2 = `--- scanner 0 ---
404,-588,-901
528,-643,409
-838,591,734
390,-675,-793
-537,-823,-458
-485,-357,347
-345,-311,381
-661,-816,-575
-876,649,763
-618,-824,-621
553,345,-567
474,580,667
-447,-329,318
-584,868,-557
544,-627,-890
564,392,-477
455,729,728
-892,524,684
-689,845,-530
423,-701,434
7,-33,-71
630,319,-379
443,580,662
-789,900,-551
459,-707,401

--- scanner 1 ---
686,422,578
605,423,415
515,917,-361
-336,658,858
95,138,22
-476,619,847
-340,-569,-846
567,-361,727
-460,603,-452
669,-402,600
729,430,532
-500,-761,534
-322,571,750
-466,-666,-811
-429,-592,574
-355,545,-477
703,-491,-529
-328,-685,520
413,935,-424
-391,539,-444
586,-435,557
-364,-763,-893
807,-499,-711
755,-354,-619
553,889,-390

--- scanner 2 ---
649,640,665
682,-795,504
-784,533,-524
-644,584,-595
-588,-843,648
-30,6,44
-674,560,763
500,723,-460
609,671,-379
-555,-800,653
-675,-892,-343
697,-426,-610
578,704,681
493,664,-388
-671,-858,530
-667,343,800
571,-461,-707
-138,-166,112
-889,563,-600
646,-828,498
640,759,510
-630,509,768
-681,-892,-333
673,-379,-804
-742,-814,-386
577,-820,562

--- scanner 3 ---
-589,542,597
605,-692,669
-500,565,-823
-660,373,557
-458,-679,-417
-488,449,543
-626,468,-788
338,-750,-386
528,-832,-391
562,-778,733
-938,-730,414
543,643,-506
-524,371,-870
407,773,750
-104,29,83
378,-903,-323
-778,-728,485
426,699,580
-438,-605,-362
-469,-447,-387
509,732,623
647,635,-688
-868,-804,481
614,-800,639
595,780,-596

--- scanner 4 ---
727,592,562
-293,-554,779
441,611,-461
-714,465,-776
-743,427,-804
-660,-479,-426
832,-632,460
927,-485,-438
408,393,-506
466,436,-512
110,16,151
-258,-428,682
-393,719,612
-211,-452,876
808,-476,-593
-575,615,604
-485,667,467
-680,325,-822
-627,-443,-432
872,-547,-609
833,512,582
807,604,487
839,-516,451
891,-625,532
-652,-548,-490
30,-46,-14`.split('\n');

    // build scanners
    const scanners = [];
    const lines = [];
    for (let i = 0; i < input.length; i++) {
        if (input[i].startsWith('---') && lines.length > 0) {
            scanners.push(new Scanner(lines.slice(0)));
            lines.length = 0;
        }
        if (input[i] !== '') {
            lines.push(input[i]);
        }
    }
    if (lines.length > 0) {
        scanners.push(new Scanner(lines));
    }

    // set scanner 0 to the world origin
    scanners[0].worldLocation = [0, 0, 0];

    // this is wildly inefficient because I'm testing a lot of the same points again and again!
    //  but this day was tough and I want to move on, so this will do

    //  this will take a long time to calculate! :)

    while (scanners.find((x) => x.worldLocation === null)) {
        for (let i = 1; i < scanners.length; i++) {
            if (scanners[i].worldLocation === null) {
                const otherScanner = scanners[i];
                scanners[0].match(otherScanner);
            }
        }
    }

    const ans1 = scanners[0].basePoints.length;
    await Advent.Submit(ans1);

    // part 2
    // for each pair of scanners, calculate manhattan distance between them

    for (let i = 0; i < scanners.length; i++) {
        console.log(scanners[i].worldLocation);
    }

    const distances = [];
    for (let i = 0; i < scanners.length; i++) {
        for (let j = i + 1; j < scanners.length; j++) {
            const dist = Math.abs(scanners[i].worldLocation[0] - scanners[j].worldLocation[0]) +
                Math.abs(scanners[i].worldLocation[1] - scanners[j].worldLocation[1]) +
                Math.abs(scanners[i].worldLocation[2] - scanners[j].worldLocation[2]);
            distances.push(dist);
        }
    }

    const ans2 = Math.max(...distances);
    await Advent.Submit(ans2, 2);
}
Run();
