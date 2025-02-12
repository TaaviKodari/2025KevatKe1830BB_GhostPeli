const BOARD_SIZE =  15;
let board;

document.getElementById('new-game-btn').addEventListener('click',startGame);

function startGame(){
    //console.log('Klikattu');
    document.getElementById('intro-screen').style.display ='none';
    document.getElementById('game-screen').style.display = 'block';
}

