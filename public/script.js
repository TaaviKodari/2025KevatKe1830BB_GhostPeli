const BOARD_SIZE =  20;
const cellSize = calculateCellSize();
let board;
let player;

document.getElementById('new-game-btn').addEventListener('click',startGame);

document.addEventListener('keydown', (event)=>{
    switch(event.key){
        case 'ArrowUp':
            player.move(0,-1);
        break;
        case 'ArrowDown':
            player.move(0,1);
        break;
        case 'ArrowLeft':
            player.move(-1,0);    
        break;
        case 'ArrowRight':
            player.move(1,0);
        break;
    }
    event.preventDefault();
});


function startGame(){
    //console.log('Klikattu');
    document.getElementById('intro-screen').style.display ='none';
    document.getElementById('game-screen').style.display = 'block';
    player = new Player(0,0);
    board = generateRandomBoard();
    drawBoard(board);
}

function generateRandomBoard(){
    const newBoard = Array.from({length:BOARD_SIZE}, ()=> Array(BOARD_SIZE).fill(' '));
    for(let y = 0; y < BOARD_SIZE; y++){
        for(let x = 0; x < BOARD_SIZE; x++){
            if(y === 0 || y === BOARD_SIZE - 1 || x === 0 || x === BOARD_SIZE - 1){
                newBoard[y][x] = 'W';
            }
        }
    }

    generateObstacles(newBoard);

    const [playerX, playerY] = randomEmptyPosition(newBoard);
    setCell(newBoard,playerX,playerY,'P');
    player.x = playerX;
    player.y = playerY;

    console.log(newBoard);
    return newBoard;
}

function drawBoard(board){
    const gameBoard = document.getElementById('game-board');

    gameBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE},1fr)`;

    for(let y = 0; y < BOARD_SIZE; y++){
        for(let x = 0; x < BOARD_SIZE; x++){
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.style.width = cellSize + "px";
            cell.style.height = cellSize + "px";
            if(getCell(board,x,y) === 'W'){
                cell.classList.add('wall');
            }else if(getCell(board,x,y) === 'P'){
                cell.classList.add('player');
            }

            gameBoard.appendChild(cell);
        }
    }
}

function getCell(board, x, y){
    return board[y][x];
}

function calculateCellSize(){
    const screenSize = Math.min(window.innerWidth, window.innerHeight);
    const gameBoardSize = 0.95 * screenSize;

    return gameBoardSize/ BOARD_SIZE;
}

function generateObstacles(board){

    const obstacles = [
        [[0,0],[0,1],[1,0],[1,1]],//Neliö
        [[0,0],[0,1],[0,2],[0,3]],//I
        [[0,0],[1,0],[2,0],[1,1]], //T
        [[1,0],[2,0],[1,1],[0,2],[1,2]],//Z
    ];

    const positions =[
        {startX: 2, startY: 2},
        {startX: 8, startY: 2},
        {startX: 4, startY: 8},
        {startX: 3, startY: 16},
        {startX: 10, startY: 10},
        
    ];

    positions.forEach(pos =>{
        const randomObstacle = obstacles[Math.floor(Math.random() * obstacles.length)];
        placeObstacle(board,randomObstacle,pos.startX,pos.startY);
    });

}

function placeObstacle(board,obstacle,startX,startY){
    for(coordinatePair of obstacle){
        [x, y] = coordinatePair;
        board[startY + y][startX + x] = 'W';
    }
}

function randomInt(min,max){
    return Math.floor(Math.random() * (max - min +1)) +min;
}

function randomEmptyPosition(board){
    x = randomInt(1,BOARD_SIZE - 2);
    y = randomInt(1,BOARD_SIZE - 2);
    if(getCell(board,x,y) === ' '){
        return[x,y];
    }
    else{
       return randomEmptyPosition(board);
    }
}

function setCell(board,x,y,value){
    board[y][x] = value;
}

class Player{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    move(deltaX,deltaY){
        const currentX = player.x;
        const currentY = player.y;

        const newX = currentX + deltaX;
        const newY = currentY + deltaY;

        player.x = newX;
        player.y = newY;

        setCell(board,newX, newY,'P');
        drawBoard(board);
    }
}