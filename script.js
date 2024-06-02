let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

const main = document.querySelector('main');

//Start button
let startButton = document.querySelector('.start');

function startGame() {
    startButton.style.display = 'none';
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    startEnemyMovement();

}
startButton.addEventListener('click', startGame);

//Player = 2, Wall = 1, Enemy = 3, Point = 0, 
let maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

let playerPosition = { row: 1, column: 1 }; // Initial player position in the maze


// Generate random enemy position
function randomEnemy() {
    let row, column;
    do {
        row = Math.floor(Math.random() * maze.length);
        column = Math.floor(Math.random() * maze[row].length);
    } while (maze[row][column] === 1 || maze[row][column] === 3 || maze[row][column] === 2);

    maze[row][column] = 3;
    return { row, column, previousDirection: null , previousState: 0};
}

let enemies = [];
for (let i = 0; i < 3; i++) {
    enemies.push(randomEnemy());
}

function chooseDirection() {
    const directions = ['up', 'down', 'left', 'right'];
    return directions[Math.floor(Math.random() * directions.length)];
}

function nextPosition(position, direction) {
    switch (direction) {
        case "up":
            return { row: position.row - 1, column: position.column };
        case "down":
            return { row: position.row + 1, column: position.column };
        case "left":
            return { row: position.row, column: position.column - 1 };
        case "right":
            return { row: position.row, column: position.column + 1 };
        default:
            return position;
    }
}

function isDirectionOkay(newPos, maze) {
    return (
        newPos.row >= 0 &&
        newPos.row < maze.length &&
        newPos.column >= 0 &&
        newPos.column < maze[0].length &&
        maze[newPos.row][newPos.column] !== 1);
}

function moveEnemies(maze, enemies) {
    enemies.forEach(enemy => {
        let directions = ['up', 'down', 'left', 'right'];
        let moved = false;

        // Remove the previous direction from the options
        directions = directions.filter(dir => dir !== enemy.previousDirection);

        while (directions.length > 0 && !moved) {
            let newDirection = chooseDirection();
            let newPos = nextPosition(enemy, newDirection);

            // console.log(`Attempt to move enemy from (${enemy.row}, ${enemy.column}) to (${newPos.row}, ${newPos.column})`);

            if (isDirectionOkay(newPos, maze)) {
                // Update maze
                maze[enemy.row][enemy.column] = enemy.previousState; // Clear the old position

                if (maze[newPos.row][newPos.column] === 2) {
                    moved = true;
                    checkGameOver();
                    gameOver();
                    return;
                }
                if(maze[newPos.row][newPos.column] == 0 || maze[newPos.row][newPos.column] == 4 )
                enemy.previousState = maze[newPos.row][newPos.column];
                maze[newPos.row][newPos.column] = 3; // Set the new position

                // Update enemy's position
                enemy.row = newPos.row;
                enemy.column = newPos.column;
                enemy.previousDirection = newDirection; // Store the new direction as previous
                renderMaze();

                // console.log(`Enemy moved to (${enemy.row}, ${enemy.column})`);
                moved = true;
            } else {
                // console.log(`Movement blocked by wall at (${newPos.row}, ${newPos.column})`);
                directions = directions.filter(dir => dir !== newDirection); // Remove the invalid direction
            }
        }

        if (!moved) {
            // console.log(`Enemy at (${enemy.row}, ${enemy.column}) can not move in any direction`);
        }
    });
}


function displayMaze() {
    console.clear();
    maze.forEach(row => {
        console.log(row.join(' '));
    });
}

displayMaze();


// Populates the maze in the HTML
function renderMaze() {
    main.innerHTML = '';
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            let block = document.createElement('div');
            block.classList.add('block');

            switch (maze[y][x]) {
                case 1:
                    block.classList.add('wall');
                    break;
                case 2:
                    block.id = 'player';
                    let mouth = document.createElement('div');
                    mouth.classList.add('mouth');
                    block.appendChild(mouth);
                    break;
                case 3:
                    block.classList.add('enemy');
                    break;
                case 0:
                    block.classList.add('point');
                    block.style.height = '1vh';
                    block.style.width = '1vh';
            }

            main.appendChild(block);
        }
    }
}

renderMaze();

let enemyMovementInterval;

function startEnemyMovement() {
    enemyMovementInterval = setInterval(() => {
        moveEnemies(maze, enemies);
    }, 500);
}


//Player movement
function keyUp(event) {
    if (event.key === 'ArrowUp') {
        upPressed = false;
    } else if (event.key === 'ArrowDown') {
        downPressed = false;
    } else if (event.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (event.key === 'ArrowRight') {
        rightPressed = false;
    }
}

function keyDown(event) {
    if (event.key === 'ArrowUp') {
        upPressed = true;
    } else if (event.key === 'ArrowDown') {
        downPressed = true;
    } else if (event.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (event.key === 'ArrowRight') {
        rightPressed = true;
    }
}

// Player movement using GUI buttons
document.getElementById('ubttn').addEventListener('mousedown', function () {
    upPressed = true;
    downPressed = false;
    leftPressed = false;
    rightPressed = false;
});

document.getElementById('ubttn').addEventListener('mouseup', function () {
    upPressed = false;
    downPressed = false;
    leftPressed = false;
    rightPressed = false;
});

document.getElementById('dbttn').addEventListener('mousedown', function () {
    upPressed = false;
    downPressed = true;
    leftPressed = false;
    rightPressed = false;
});
document.getElementById('dbttn').addEventListener('mouseup', function () {
    upPressed = false;
    downPressed = false;
    leftPressed = false;
    rightPressed = false;
});

document.getElementById('lbttn').addEventListener('mousedown', function () {
    upPressed = false;
    downPressed = false;
    leftPressed = true;
    rightPressed = false;
});
document.getElementById('lbttn').addEventListener('mouseup', function () {
    upPressed = false;
    downPressed = false;
    leftPressed = false;
    rightPressed = false;
});

document.getElementById('rbttn').addEventListener('mousedown', function () {
    upPressed = false;
    downPressed = false;
    leftPressed = false;
    rightPressed = true;
});
document.getElementById('rbttn').addEventListener('mouseup', function () {
    upPressed = false;
    downPressed = false;
    leftPressed = false;
    rightPressed = false;
});


setInterval(function () {
    let newPosition = { row: playerPosition.row, column: playerPosition.column };
    if (downPressed) {
        newPosition.row++;
    } else if (upPressed) {
        newPosition.row--;
    } else if (leftPressed) {
        newPosition.column--;
    } else if (rightPressed) {
        newPosition.column++;
    }

    if (isDirectionOkay(newPosition, maze)) {
        maze[playerPosition.row][playerPosition.column] = 4;
        if (maze[newPosition.row][newPosition.column] === 3) {
            checkGameOver();
            gameOver();
            return; 
        }
        maze[newPosition.row][newPosition.column] = 2;
        playerPosition.row = newPosition.row;
        playerPosition.column = newPosition.column;
        pointCollect();
    }

    renderMaze();
}, 100);

// function pointCollect() {
//     updateScore();
//     checkPoint();
// }

// Points collision
function pointCollect() {
    const player = document.querySelector('#player');
    const playerRect = player.getBoundingClientRect();
    const points = document.querySelectorAll('.point');
    // console.log(playerRect)
    // console.log(points)
    for (let i = 0; i < points.length; i++) {
        let pointRect = points[i].getBoundingClientRect();
        // console.log(pointRect)
        
        if (
            playerRect.right > pointRect.left &&
            playerRect.left < pointRect.right &&
            playerRect.bottom > pointRect.top &&
            playerRect.top < pointRect.bottom
        ) {
            console.log("_______==============================================________________");
            // console.log(pointRect)
            // console.log(points[i])
            points[i].classList.remove('point');
            // console.log(points[i])
            updateScore();
            checkPoint();
        }
    }
};

//Update score
let score = 0;
const scoreDisplay = document.querySelector('.score p');

function updateScore() {
    score++;
    scoreDisplay.textContent = score;
};

function checkPoint() {
    const pointsLeft = document.querySelectorAll('.point');

    if (pointsLeft.length === 0) {
        const message = document.createElement('div');
        message.classList.add('gameOver');
        message.textContent = 'You won!';
        document.body.appendChild(message);
        player.removeEventListener('keydown', keyDown);
        player.removeEventListener('keyup', keyUp);
    }
}

function checkGameOver() {
    const player = document.querySelector('#player');
    const position = player.getBoundingClientRect();
    const directions = [
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 }
    ];

    for (let { x, y } of directions) {
        let element1 = document.elementFromPoint(position.left + x, position.top + y);
        let element2 = document.elementFromPoint(position.left + x, position.bottom + y);

        if ((element1 && element1.classList.contains('enemy')) || (element2 && element2.classList.contains('enemy'))) {
            console.log(11111111111111111111111111);
            gameOver();
            break;
        }
    }
}

function gameOver() {
    const message = document.createElement('div');
    const player = document.querySelector('#player');

    // Create restart button
    const restartButton = document.createElement('div');
    const restartText = document.createElement('h1');
    restartText.textContent = 'Restart';
    restartButton.appendChild(restartText);
    restartButton.classList.add('restart');

    // Append restart button to startDiv
    const startDiv = document.querySelector('.startDiv');
    startDiv.appendChild(restartButton);
    restartButton.removeEventListener('click', restartGame);


    player.classList.add('dead');
    message.classList.add('gameOver');
    message.textContent = 'Game over!';

    document.body.appendChild(message);
    document.removeEventListener('keydown', keyDown);
    document.removeEventListener('keyup', keyUp);
    clearInterval(enemyMovementInterval);
}

function restartGame() {
    // Remove the restart button
    const restartButton = document.querySelector('button');
    restartButton.parentNode.removeChild(restartButton);
    startGame();
}
restartButton.addEventListener('click', restartGame);


