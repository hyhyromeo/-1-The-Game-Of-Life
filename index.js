const unitLength = 20;
// let boxColor = randomColor()
// let fillBoxColor = boxColor.hexString(); // => '#d67118'

let boxColor = 255;
let emptyBoxColor = 0;
const strokeColor = 150;
let columns; /* To be determined by window width*/
let rows; /* To be determined by window height */
let currentBoard;
let nextBoard;
let fr = 10;
let canvas ;

function setup() {
    /* Set the canvas to be under the element #canvas*/
    canvas = createCanvas(windowWidth - 200, windowHeight - 300);
    canvas.parent(document.querySelector('#canvas'));

    frameRate(fr);

    /*Calculate the number of columns and rows */
    columns = floor(width / unitLength);
    rows = floor(height / unitLength);

    /*Making both currentBoard and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
    currentBoard = [];
    nextBoard = [];
    for (let i = 0; i < columns; i++) {
        currentBoard[i] = [];
        nextBoard[i] = []
    }
    // Now both currentBoard and nextBoard are array of array of undefined values.
    init();  // Set the initial values of the currentBoard and nextBoard
}

function init() {

    for (let i = 0; i < columns; i++) {
        currentBoard[i] = [];
        nextBoard[i] = []
    }
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            currentBoard[i][j] = 0;
            nextBoard[i][j] = 0;
        }
    }
}

function draw() {
    clear();
    generate();
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            if (currentBoard[i][j] == 1) {

                fill(boxColor);
            } else if (nextBoard[i][j] == 1) {
                fill("#87ceeb")
            } else {
                fill('rgba(255,255,255, 0)');
            }
            stroke(strokeColor);
            rect(i * unitLength, j * unitLength, unitLength, unitLength);
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth - 200, windowHeight - 300);
    columns = floor(width / unitLength);
    rows = floor(height / unitLength);
    let tempBoard = currentBoard.slice() //copy current to temp
    // Object.assign(tempBoard, currentBoard) // ==copy current to temp
    init()
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            if (tempBoard[i][j] == 1) {
                currentBoard[i][j] = tempBoard[i][j]
            } else (
                currentBoard[i][j] = 0
            )
        }
    }
}
function generate() {
    //Loop over every single box on the board
    for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
            // Count all living members in the Moore neighborhood(8 boxes surrounding)
            let neighbors = 0;
            for (let i of [-1, 0, 1]) {
                for (let j of [-1, 0, 1]) {
                    if (i === 0 && j === 0) {
                        // the cell itself is not its own neighbor
                        continue;
                    }
                    // The modulo operator is crucial for wrapping on the edge
                    neighbors += currentBoard[(x + i + columns) % columns][(y + j + rows) % rows];
                }
            }
            // Rules of Life
            // if (currentBoard[x][y] == 1 && neighbors < 2) {
            //     // Die of Loneliness
            //     nextBoard[x][y] = 0;
            // } else if (currentBoard[x][y] == 1 && neighbors > 3) {
            //     // Die of Overpopulation
            //     nextBoard[x][y] = 0;
            // } else if (currentBoard[x][y] == 0 && neighbors == 3) {
            //     // New life due to Reproduction
            //     nextBoard[x][y] = 1;
            // } else {
            //     // Stasis
            //     nextBoard[x][y] = currentBoard[x][y];
            // }
            if (currentBoard[x][y] == 1 && neighbors < parseInt(document.getElementById("rule1btn").value)) {
                // Die of Loneliness
                nextBoard[x][y] = 0;
            } else if (currentBoard[x][y] == 1 && neighbors > parseInt(document.getElementById("rule2btn").value)) {
                // Die of Overpopulation
                nextBoard[x][y] = 0;
            } else if (currentBoard[x][y] == 0 && neighbors == parseInt(document.getElementById("rule4btn").value)) {
                // New life due to Reproduction
                nextBoard[x][y] = 1;

            } else {
                // Stasis
                nextBoard[x][y] = currentBoard[x][y];
            }
        }
    }
    // Swap the nextBoard to be the current Board
    [currentBoard, nextBoard] = [nextBoard, currentBoard];
}
/* When mouse is dragged*/
function mouseDragged() {
    /*If the mouse coordinate is outside the board*/
    if (mouseX > unitLength * columns || mouseY > unitLength * rows) {
        return;
    }
    if (spawnC3ladderAllow == 1) { //allow pattern c3ladder
        placePattern(c3ladder)
    } else {
        const x = Math.floor(mouseX / unitLength);
        const y = Math.floor(mouseY / unitLength);
        currentBoard[x][y] = 1;
        fill(boxColor);
        stroke(strokeColor);
        rect(x * unitLength, y * unitLength, unitLength, unitLength);
    }
}
/*When mouse is pressed*/
function mousePressed() {
    noLoop();
    mouseDragged();
}
/*When mouse is released*/
function mouseReleased() {
    loop();
}

function speedControl() {
    let x = document.getElementById("myRange").value;
    let fr = parseInt(x);
    console.log(fr);
    frameRate(fr)
}

function randomStart() {
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            currentBoard[i][j] = random() > 0.8 ? 1 : 0;
            nextBoard[i][j] = 0;
        }
    }
}

let spawnC3ladderAllow = 0

let c3ladder = `
x----
xxx--
-xxx-
x-xxx
x-xx-
-xx--
xxx--
x----
`;

function patternToArray(pattern) {
    let lines = pattern.trim().split('\n'); //每行成為一個array element (trim() = to cut open and end useless things eg. space bar/enter/tab)
    // lines.pop(); //del bottom space
    // lines.shift(); //del top space
    //switch公式轉化為不同顏色之後在currentBoard計neighbor
    //要加if去判定若不是白色，neighbor加一
    lines = lines.map((line) =>
        line.split('').map((c) => { //每行每個字元成為一個array element
            switch (c) {
                case '-':
                    return 0;
                case 'x':
                    return 1;
            }
        }),
    );
    return lines;
}
function placePattern(arrPattern) { //放pattern的function
    const x = Math.floor(mouseX / unitLength); //全圖的x軸
    const y = Math.floor(mouseY / unitLength); //全圖的y軸

    let pat = patternToArray(arrPattern); //把現有pattern圖變成array
    for (let patY = 0; patY < pat.length; patY++) { //先走Y軸
        console.log('pat[patY]', pat[patY])
        for (let patX = 0; patX < pat[patY].length; patX++) { //再走Y軸
            if (pat[patX][patY] == 1) { //當有1的值
                currentBoard[x + patX][y + patY] = 1; //填入mouse所指向的格
                fill(boxColor); //填入顏色
                stroke(strokeColor); //填入邊框顏色
                rect((x + patY) * unitLength, (y + patX) * unitLength, unitLength, unitLength);
            } //rect也是必須，注意pattern的X與Y值相反加入
        }
    }

    return;
}

$(document).ready(function () {
    console.log("ready!");
    document.querySelector('#reset-game').addEventListener('click', function () {
        console.log("clicked")
        init();
    })

    document.getElementById("favcolor").addEventListener('change', function (event) {
        boxColor = event.target.value;
        loop()
    })

    let spawnC3ladderBtn = document.querySelector("#spawn-c3ladder");
    spawnC3ladderBtn.addEventListener("click", function () {
        spawnC3ladderAllow = !spawnC3ladderAllow
        spawnC3ladderBtn.innerHTML = spawnC3ladderAllow ? "C3ladder Pattern on" : "C3ladder Pattern off"

        // if (spawnC3ladderAllow) {
        //     spawnC3ladderBtn.innerHTML = "C3ladder Pattern on"
        // } else { spawnC3ladderBtn.innerHTML = "C3ladder Pattern off" }
        console.log("click")
    })

    let onOff = document.querySelector('#checkbox').checked
    document.querySelector('#checkbox')
        .addEventListener('change', () => {
            onOff = document.querySelector('#checkbox').checked
            onOff ? mouseReleased() : mousePressed() // = onOff = mouseReleased() else = mousePressed()
        })

    let rule1 = document.getElementById("rule1btn");
    rule1.addEventListener("change", function () {
        console.log(rule1.value)
    })
    let rule2 = document.getElementById("rule2btn");
    rule2.addEventListener("change", function () {
        console.log(rule2.value)
    })

    let rule4 = document.getElementById("rule4btn");
    rule4.addEventListener("change", function () {
        console.log(rule4.value)
    })
    let rule1n = document.getElementById("rule1number");
    document.getElementById("rule1btn").addEventListener("change", function () {
        rule1n.innerHTML = this.value
    })
    let rule2n = document.getElementById("rule2number");
    document.getElementById("rule2btn").addEventListener("change", function () {
        rule2n.innerHTML = this.value
    })
})