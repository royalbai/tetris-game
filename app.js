// Creating grids for the game
const grid = document.querySelector(".grid");
const miniGrid = document.querySelector(".mini-grid");
for (let i = 0; i < 210; i++) {
    let element = document.createElement("div");
    if (i >= 200) {
        element.classList.add("taken");
    }
    grid.appendChild(element);
}
for (let i = 0; i < 16; i++) {
    let element = document.createElement("div");
    miniGrid.appendChild(element);
}
let squares = Array.from(document.querySelectorAll(".grid div"));
const scoreDisplay = document.querySelector("#score");
const endDisplay = document.querySelector("h2");
const startBtn = document.querySelector("#start-button");
const width = 10;
let nextRandom = 0;
let timerId;
let score = 0;
const colors = [
    "dodgerBlue",
    "lawnGreen",
    "mediumVioletRed",
    "rebeccaPurple",
    "orangeRed"
];
const clickUp = document.querySelector(".fa-arrow-up");
const clickLeft = document.querySelector(".fa-arrow-left");
const clickDown = document.querySelector(".fa-arrow-down");
const clickRight = document.querySelector(".fa-arrow-right");

// The tetrominoes and the shape it will take in 4 different positions
const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
];
const zTetromino = [
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1],
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1]
];
const tTetromino = [
    [1, width, width +1, width+2],
    [1, width+1, width+2, width*2+1],
    [width, width+1, width+2, width*2+1],
    [1, width, width+1, width*2+1]
];
const oTetromino = [
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1]
];
const iTetromino = [
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3],
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3]
];
const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];
let currentPosition = 4;
let currentRotation = 0;

// Randomly select a tetromino and its first rotation
let random = Math.floor(Math.random()*theTetrominoes.length);
let current = theTetrominoes[random][currentRotation];

// Draw the tetromino into the grid divs by accessing squares variable
const draw = () => {
    current.forEach(index => {
        squares[currentPosition + index].classList.add("tetromino");
        squares[currentPosition + index].style.backgroundColor = colors[random];
    })
}

// Undraw the tetromino by removing the class "tetromino" in grid divs
const undraw = () => {
    current.forEach(index => {
        squares[currentPosition + index].classList.remove("tetromino");
        squares[currentPosition + index].style.backgroundColor = "";
    })
}

// Set the tetromino to move downward and allow user to make last second movements before freeze
const moveDown = () => {
    if(!current.some(index => squares[currentPosition + index +     width].classList.contains("taken"))) {
        undraw();
        currentPosition += width;
        draw();
    } else {
        freeze();  
    }
}

// Freeze function
const freeze = () => {
        current.forEach(index => squares[currentPosition + index].classList.add("taken"));
        // Start the next tetromino to fall
        random = nextRandom;
        nextRandom = Math.floor(Math.random()*theTetrominoes.length);
        current = theTetrominoes[random][currentRotation];
        currentPosition = 4;
        draw();
        displayShape();
        addScore();
        gameOver();
}

// Move the tetromino left until it hits the edge
const moveLeft = () => {
    undraw();
    const leftEdge = current.some(index => (currentPosition + index) % width === 0);
    if (!leftEdge) {
        currentPosition -= 1;
    }
    if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
        currentPosition += 1;
    }
    draw();
}

// Move the tetromino right until it hits the edge
const moveRight = () => {
    undraw();
    const rightEdge = current.some(index => (currentPosition + index) % width === width - 1);
    if (!rightEdge) {
        currentPosition += 1;
    }
    if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
        currentPosition -= 1;
    }
    draw();
}

 ///Fix rotation of tetrominos on the edge so that they don't break
const isAtRight = () => {
    return current.some(index=> (currentPosition + index + 1) % width === 0)  
}
const isAtLeft = () => {
    return current.some(index=> (currentPosition + index) % width === 0)
}
const checkRotatedPosition = (p) => {
    p = p || currentPosition            //Get current position and check if the piece is near the edge
    if ((p + 1) % width < 4) {            //Add 1 because the position index can be 1 less than where the piece is (with how they are indexed)    
      if (isAtRight()){                 //Use actual position to check if it's flipped over
        currentPosition += 1            //If so, add one to wrap it back around
        checkRotatedPosition(p)         //Check again and pass position from start, since long block might need to move more
        }
    }
    else if (p % width > 5) {
        if (isAtLeft()){
            currentPosition -= 1
            checkRotatedPosition(p)
        }
    }
}

// Rotate the tetronmino
const rotate = () => {
    undraw();
    currentRotation ++
    if (currentRotation === current.length) {
        currentRotation = 0;
    }
    current = theTetrominoes[random][currentRotation];
    checkRotatedPosition();
    draw();
}

// Show the tetromino that is next up on the mini grid display
const displaySquares = document.querySelectorAll(".mini-grid div");
const displayWidth = 4;
const displayIndex = 0;

// Tetrominoes without rotation
const nextTetrominoes = [
    [1, displayWidth+1, displayWidth*2+1, 2],
    [0, displayWidth, displayWidth+1, displayWidth*2+1],
    [1, displayWidth, displayWidth +1, displayWidth+2],
    [0, 1, displayWidth, displayWidth+1],
    [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1]
];

// Function to display the shapes
const displayShape = () => {
    // Removing tetromino from the entire grid
    displaySquares.forEach(square => {
        square.classList.remove("tetromino");
        square.style.backgroundColor = "";
    })
    nextTetrominoes[nextRandom].forEach(index => {
        displaySquares[displayIndex + index].classList.add("tetromino");
        displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom];
    })
}

// Assign functions to appropriate key codes
const control = (e) => {
    if (e.keyCode === 37) {
        moveLeft();
    } else if (e.keyCode === 39) {
        moveRight();
    } else if (e.keyCode === 38) {
        rotate();
    } else if (e.keyCode === 40) {
        moveDown();
    }
} 

// Add Functionality to the button
startBtn.addEventListener("click", () => {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        document.removeEventListener("keydown", control);
        // Click configurations
        clickUp.removeEventListener("click", rotate);
        clickLeft.removeEventListener("click", moveLeft);
        clickDown.removeEventListener("click", moveDown);
        clickRight.removeEventListener("click", moveRight);
    } else {
        draw();
        timerId = setInterval(moveDown, 300);
        displayShape();
        document.addEventListener("keydown", control);
        // Click configurations
        clickUp.addEventListener("click", rotate);
        clickLeft.addEventListener("click", moveLeft);
        clickDown.addEventListener("click", moveDown);
        clickRight.addEventListener("click", moveRight);
    }
}) 

// Counting score
const addScore = () => {
    for (let i = 0; i < 199; i += width) {
        const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];
        if (row.every(index => squares[index].classList.contains("taken"))) {
            score += 10;
            scoreDisplay.innerHTML = score;
            row.forEach(index => {
                squares[index].classList.remove("taken");
                squares[index].classList.remove("tetromino");
                squares[index].style.backgroundColor = "";
            })
            const squaresRemoved = squares.splice(i, width);
            squares = squaresRemoved.concat(squares);
            squares.forEach(cell => grid.appendChild(cell));
        }
    }
}

// Game over function
const gameOver = () => {
    if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
        endDisplay.innerHTML = `Game over! ${score} is your final score`;
        clearInterval(timerId);
    }
}