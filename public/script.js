const BOARD_SIZE =  20;
const cellSize = calculateCellSize();
let board;
let player;
let ghosts = [];
let ghostSpeed = 1000;

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

        case 'w':
            shootAt(player.x, player.y - 1);
        break;

        case 's':
            shootAt(player.x, player.y + 1);
        break;

        case 'a':
            shootAt(player.x - 1, player.y);
        break;

        case 'd':
            shootAt(player.x + 1 , player.y);
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
    setInterval(moveGhosts,ghostSpeed);
}

function generateRandomBoard(){
    //Luodaan pelilauta
    const newBoard = Array.from({length:BOARD_SIZE}, ()=> Array(BOARD_SIZE).fill(' '));
    for(let y = 0; y < BOARD_SIZE; y++){
        for(let x = 0; x < BOARD_SIZE; x++){
            if(y === 0 || y === BOARD_SIZE - 1 || x === 0 || x === BOARD_SIZE - 1){
                newBoard[y][x] = 'W';
            }
        }
    }
    //luodaan esteet
    generateObstacles(newBoard);
    
    //luodaan pelajaa
    const [playerX, playerY] = randomEmptyPosition(newBoard);
    setCell(newBoard,playerX,playerY,'P');
    player.x = playerX;
    player.y = playerY;

    //Luodaan haamut
    for(let i = 0; i < 5; i++){
        const[ghostX, ghostY] = randomEmptyPosition(newBoard);
        setCell(newBoard,ghostX, ghostY, 'G');
        ghosts.push(new Ghost(ghostX, ghostY));
    }

    console.log(newBoard);
    return newBoard;
}

function drawBoard(board){
    const gameBoard = document.getElementById('game-board');

    gameBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE},1fr)`;
    gameBoard.innerHTML = "";

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
            }else if(getCell(board,x,y) === 'G'){
                cell.classList.add('ghost');
            }else if(getCell(board,x,y) === 'B'){
                cell.classList.add('bullet');
                setTimeout(()=>{
                    setCell(board,x,y,' ');
                }, 500);
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

function shootAt(x,y){
    if(getCell(board,x,y) === 'W'){
        return;
    }

    const ghostIndex = ghosts.findIndex(ghost => ghost.x === x && ghost.y === y);

    if(ghostIndex !== -1){
        ghosts.splice(ghostIndex,1);
    }

    setCell(board,x,y,'B');
    drawBoard(board);

    if(ghosts.length === 0){
        alert('Kaikki ammuttu');
    }
}

function moveGhosts(){
    
    ghosts.forEach(ghost =>{
        const newPosition = ghost.moveGhostTowardsPlayer(player,board);
        ghost.x = newPosition.x;
        ghost.y = newPosition.y;

        setCell(board,ghost.x, ghost.y,'G');

        drawBoard(board);
    });
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
        if(getCell(board, newX, newY) === ' '){
            player.x = newX;
            player.y = newY;
    
            setCell(board,currentX, currentY,' ');
            setCell(board,newX, newY,'P');
            drawBoard(board);
        }
    }
}

class Ghost{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    moveGhostTowardsPlayer(player,board){
        
        //määritellään missä päin pelaaja on vihollisesta
        let dx = player.x - this.x;
        let dy = player.y - this.y;

        //tallennetaan mahdolliset liikkeet
        let moves = [];

        if(Math.abs(dx) > Math.abs(dy)){
            if(dx > 0) moves.push({x: this.x + 1, y: this.y}); //Liikutaan oikealle
            else moves.push({x: this.x - 1, y: this.y }); //liikutaan vasemmalle
            
            if(dy > 0) moves.push({x:this.x, y:this.y +1}) //liikutaan alas
            else moves.push({x:this.x, y:this.y -1})//liikutaan ylös
        }
        else{
            if(dy > 0) moves.push({x:this.x, y:this.y +1}) //liikutaan alas
            else moves.push({x:this.x, y:this.y -1})//liikutaan ylös

            if(dx > 0) moves.push({x: this.x + 1, y: this.y}); //Liikutaan oikealle
            else moves.push({x: this.x - 1, y: this.y }); //liikutaan vasemmalle
        }

        for(let move of moves){
            const value = getCell(board,move.x, move.y);
            if(value === ' ' || value === 'P'){
                return move;
            }
        }
        return{x:this.x, y:this.y};
    }
}