let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;
let userName;
let livesRemain = 3;
const main = document.querySelector('main');

const label = document.createElement('label');
label.textContent = 'Enter your name:';
label.htmlFor = 'nameInput'; 

const input = document.createElement('input');
input.type = 'text';
input.id = 'nameInput';
input.placeholder = 'Your name'

const startDiv = document.querySelector(".startDiv");
startDiv.prepend(input);
startDiv.prepend(label);

input.addEventListener('input', () => {
    input.placeholder = input.value; 
    if (input.value !== '') {
        input.style.backgroundColor = "#ccc"; 
      } else {
        input.style.backgroundColor = ''; 
      }
  });

  
//Start button
let startButton = document.querySelector('.start');
function startGame() {
    startButton.style.display = 'none';
    input.style.display = 'none';
    label.style.display = 'none';

    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    startEnemyMovement();
    userName = input.value;
}

startButton.addEventListener('click', startGame);

//Player = 2, Wall = 1, Enemy = 3, Point = 0, 
let maze;
let enemies = [];
let playerPosition;
function init_maze(){
    maze = [
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
    playerPosition = { row: 1, column: 1 };
    for (let i = 0; i < 3; i++) {
        enemies.push(randomEnemy());
    }
}
init_maze();

// Load initial data from LocalStorage or create an empty array
let leaderboard = JSON.parse(localStorage.getItem('leaderboardData')) || [];

renderLeaderboard();
renderLives();

// Generate random enemy position
function randomEnemy() {
    let row, column;
    do {
        row = Math.floor(Math.random() * maze.length);
        column = Math.floor(Math.random() * maze[row].length);
    } while (maze[row][column] === 1 || maze[row][column] === 3 || maze[row][column] === 2);

    maze[row][column] = 3;
    return { row, column, previousDirection: null, previousState: 0 };
}

function generateRandomMaze(cols=10, rows=10, num_obs_inside=5) {
    let maze = []
    for (let i = 0; i < rows; i++) {
        let row = [];  // Array to store numbers in the current row
        for (let j = 0; j < cols; j++) {
            if (i==0 || j==0 || i==cols-1 || j==rows-1){
                row.push(1);
            }
            else if (i==1 && j==1){
                row.push(2);

            }

            else{
                t = Math.floor(Math.random() * ((cols-1)*(rows-1)/num_obs_inside))
                if(t==0){
                    row.push(1);
                }
                else{
                    row.push(0)
                }
            }
        }
        maze.push(row);
        console.log(row); // Print the row
      }      
    return maze;
  }
  
function init_random_maze(){
    maze = generateRandomMaze();
    playerPosition = { row: 1, column: 1 };
    for (let i = 0; i < 3; i++) {
        enemies.push(randomEnemy());
    }
}

function chooseDirection(directions) {
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
        // directions = directions.filter(dir => dir !== enemy.previousDirection);

        while (directions.length > 0 && !moved) {
            let newDirection = chooseDirection(directions);
            let newPos = nextPosition(enemy, newDirection);


            if (isDirectionOkay(newPos, maze)) {
                // Update maze
                if (maze[newPos.row][newPos.column] === 3) {
                    directions = directions.filter(dir => dir !== newDirection); 
                    continue;
                }
                if(enemy.previousState === 0 || enemy.previousState === 4)
                maze[enemy.row][enemy.column] = enemy.previousState; 
                if (maze[newPos.row][newPos.column] === 2) {
                    moved = true;
                    enemy.previousState = maze[newPos.row][newPos.column];
                    livesRemain--;
                    console.log(livesRemain);
                    livesRemain === 0 ? gameOver() : addHit(); 
                 
                    
                }
                if (maze[newPos.row][newPos.column] == 0 || maze[newPos.row][newPos.column] == 4)
                    enemy.previousState = maze[newPos.row][newPos.column];
                maze[newPos.row][newPos.column] = 3; // Set the new position

                // Update enemy's position
                enemy.row = newPos.row;
                enemy.column = newPos.column;
                enemy.previousDirection = newDirection; // Store the new direction as previous

                moved = true;
            } else {
                directions = directions.filter(dir => dir !== newDirection); // Remove the invalid direction
            }
        }

        if (!moved) {
        }
    });
    renderMaze();
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


function init_total_points(enemies){
    let prev_points = document.querySelectorAll('.point').length;
    enemies.forEach(e => {
        if(e.previousState === 0) prev_points++;
    })
    return prev_points;
}

let prev_points = init_total_points(enemies);

let mainInterval;

function main_interval() {

    mainInterval = setInterval(function () {
        let newPosition = { row: playerPosition.row, column: playerPosition.column };
        const player = document.querySelector('#player');
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
                livesRemain--;
                console.log(livesRemain);
                livesRemain === 0 ? gameOver() : addHit(); 
                
                return;
            }
            maze[newPosition.row][newPosition.column] = 2;
            playerPosition.row = newPosition.row;
            playerPosition.column = newPosition.column;
        }

        renderMaze();
        renderLives();
    }, 100);
}
function update_point_interval(){
    setInterval(() => {
        prev_points = updatePoints(prev_points, enemies);
    }, 50);

}
main_interval();
update_point_interval();


function updatePoints(prev_points, enemies) {
    let new_points = document.querySelectorAll('.point').length;
    enemies.forEach(e => {
        if(e.previousState === 0) new_points++;
    })
    for(let i = 0; i < prev_points - new_points; i++){
        updateScore();
        checkPoint();
    }
    return new_points;
}

// Points collision
function pointCollect() {
    const player = document.querySelector('#player');
    const playerRect = player.getBoundingClientRect();

    const points = document.querySelectorAll('.point');
    console.log(points.length)
    for (let i = 0; i < points.length; i++) {
        let pointRect = points[i].getBoundingClientRect();

        if (
            playerRect.right > pointRect.left &&
            playerRect.left < pointRect.right &&
            playerRect.bottom > pointRect.top &&
            playerRect.top < pointRect.bottom
        ) {
    
            points[i].classList.remove('point');
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
    let hiddenPoints = 0;
    enemies.forEach((e) => {
        if (e.previousState === 0){
            hiddenPoints++;
        }
    })
    if (pointsLeft.length+hiddenPoints === 0) {
        stopEverything();
        const message = document.createElement('div');
        message.classList.add('gameOver');
        message.textContent = 'You won!';
        document.body.appendChild(message);
    }
}


function stopEverything(){
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
    restartButton.addEventListener('click', restartGame);
    input.style.display = '';
    label.style.display = '';
    console.log(restartButton)
    player.classList.add('dead');
    document.removeEventListener('keydown', keyDown);
    document.removeEventListener('keyup', keyUp);
    clearInterval(enemyMovementInterval);
    clearInterval(mainInterval);
    addScore(userName, score);
}

function gameOver() {
    stopEverything();
    const message = document.createElement('div');
    message.classList.add('gameOver');
    message.textContent = 'Game over!';

    document.body.appendChild(message);
}
function clearState() {
    const player = document.querySelector('#player');
    const gameOver = document.querySelector(".gameOver")
    const restartButton = document.querySelector('.restart');
    restartButton.style.display = 'none';
    restartButton.remove()
    gameOver.style.display = 'none';
    gameOver.remove();
    if(player)
    player.remove();
    upPressed = false;
    downPressed = false;
    leftPressed = false;
    rightPressed = false;
    enemies = [];
    score = -1;
    updateScore();
    livesRemain = 3;

}
function restartGame() {
    clearState();
    init_random_maze();
    startGame();
    main_interval();

}
function addScore(userName, score) {

  
    if (userName && !isNaN(score)) {

      leaderboard.push({ userName, score });
      // Sort leaderboard in descending order
      leaderboard.sort((a, b) => b.score - a.score);
      leaderboard = leaderboard.slice(0, 5);
      localStorage.setItem('leaderboard', JSON.stringify(leaderboard)); // Save updated leaderboard
      renderLeaderboard(); // Update the UI
    }
    console.log(leaderboard);
}

function renderLeaderboard() {
    const leaderboardList = document.querySelector('.leaderboard ol');
    leaderboardList.innerHTML = ''; // Clear existing entries

    leaderboard.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = `${entry.userName}..........${entry.score}`;
        leaderboardList.appendChild(listItem);
    });
}
function renderLives() {
    const liveList = document.querySelector('.lives ul');
    liveList.innerHTML = ''; // Clear existing entries

    for (let i = 0; i < livesRemain; i++){
        const liveItem = document.createElement('li');
        liveList.appendChild(liveItem);
    }
}

function addHit(){
    const player = document.querySelector("#player"); 
    player.classList.add('hit');
    console.log("Hit animation");
    console.log(player);
    // stopIntervalFor(mainInterval, mainInterval(), 1.5);

}

function stopIntervalFor(intervalId, intervalFunction, seconds) {
    clearInterval(intervalId);  // Clear the existing interval
  
    setTimeout(() => {
      intervalFunction; // Restart the interval after 'seconds'
    }, seconds * 1000);
  }
  
// Character colour customize
const player = document.querySelector('#player');
const colours = document.querySelectorAll('aside li');

colours.forEach(colour => {
    colour.addEventListener('click', function() {
        player.style.backgroundColor = colour.id;
    });
});

// Close aside 
document.getElementById('closeside').addEventListener('click', function () {
    document.querySelector('aside').style.display = 'none';
});