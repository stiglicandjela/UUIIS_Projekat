// board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32*16
let boardHeight = tileSize * rows; // 32*16

//ship
let shipWidth = tileSize*2;
let shipHeight = tileSize;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*2;

let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height: shipHeight,
}

let shipImg;
let shipVelocityX = tileSize; // brzina kretanja broda
// vanzemaljci
let alienArray = [];
let alienWidth = tileSize*2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImgs = []; // lista mogucih vanzemaljaca


let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; // broj vanzemaljaca
let alienVelocityX = 1; // brzina kretanja vanzemaljca

//metci
let bulletArray = [];
let bulletVelocityY = -10; // brzina metaka

let score = 0;
let gameOver = false;


window.onload = function(){
    board = this.document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); // za crtanje po tabli

    //ship
    shipImg = new Image();
    shipImg.src = "imagesSI/ship.png";
    shipImg.onload = function(){
    context.drawImage(shipImg,ship.x,ship.y,ship.width,ship.height);
}

    alienImgs = [new Image(),new Image(),new Image(),new Image()];
    alienImgs[0].src = "imagesSI/alien.png";
    alienImgs[1].src = "imagesSI/alien-cyan.png"; 
    alienImgs[2].src = "imagesSI/alien-magenta.png";
    alienImgs[3].src = "imagesSI/alien-yellow.png";

    //kreni tek kad se ucita
    let loaded = 0;
    for (let img of alienImgs) {
        img.onload = () => {
        loaded++;
        if (loaded === alienImgs.length) {
        createAliens();
        requestAnimationFrame(update);
    }
  };
}
    this.document.addEventListener("keydown", moveShip);
    this.document.addEventListener("keyup", shoot);
}

function update(){
    requestAnimationFrame(update);

    if(gameOver){
        return;
    }

    context.clearRect(0,0,board.width,board.height);

    context.drawImage(shipImg,ship.x,ship.y,ship.width,ship.height);

    //ucitaj vanzemaljce
    for(let i=0;i<alienArray.length;i++){
        let alien = alienArray[i];
        if(alien.alive){
            alien.x += alienVelocityX;
            //ako vanzemaljac ode do kraja ekrana
            if(alien.x + alien.width >=board.width || alien.x<=0){
                alienVelocityX*=-1;
                alien.x +=alienVelocityX*2;

                //pomeri vanzemaljce napred za jedan red kad dodirnu ivicu
                for(let j=0;j<alienArray.length;j++){
                    alienArray[j].y+=alienHeight;
                }
            }
            context.drawImage(alien.img, alien.x, alien.y, alien.width, alien.height);

            if(alien.y>=ship.y){
                gameOver = true;
            }
        }
    }


   for (let i = bulletArray.length - 1; i >= 0; i--) {
     let bullet = bulletArray[i];
    bullet.y += bulletVelocityY;

    context.fillStyle = "white";
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    // kolizija
    for (let j = 0; j < alienArray.length; j++) {
        let alien = alienArray[j];
        if (alien.alive && detectCollision(bullet, alien)) {
            alien.alive = false;
            alienCount--;
            score += 100;

            bulletArray.splice(i, 1); // ✅ metak odmah nestaje
            break;
    }
  }

  // van ekrana
  if (bullet.y + bullet.height < 0) {
    bulletArray.splice(i, 1);
  }
}



    //sledeci nivo
    if(alienCount == 0){
        //povecaj broj vanzemaljaca u kolonama i redovima za 1
        alienColumns = Math.min(alienColumns+1, columns/2 -2); // maks 16/2 - 2 = 6
        alienRows = Math.min(alienRows+1,rows-4); // maks sa 16-4=12
        alienVelocityX +=0.2; // povecava se brzina kretanja vanzemaljaca
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    // score
    context.fillStyle = "white";
    context.font = "16px 'Press Start 2P'";
    context.fillText(score,5,20);

}

function moveShip(e){
    if(gameOver){
        return;
    }
    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0){
        ship.x -=shipVelocityX; //levo
    } else if(e.code == "ArrowRight" && ship.x + shipVelocityX + shipWidth <= board.width){
        ship.x+=shipVelocityX; //desno
    }
}

function createAliens(){
    for(let c=0;c<alienColumns;c++){
        for(let r=0;r<alienRows;r++){
            let alien = {
                img: alienImgs[Math.floor(Math.random() * alienImgs.length)],
                x : alienX + c*alienWidth,
                y : alienY + r*alienHeight,
                width : alienWidth,
                height : alienHeight,
                alive : true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if(gameOver){
        return;
    }
    if (e.code =="Space"){
        //pucanje
        let bullet = {
            x: ship.x + shipWidth*15/32,
            y : ship.y,
            width: tileSize/8,
            height: tileSize/2,
            used: false
        }

    bulletArray.push(bullet);

    }
}

// kolizija za dva pravougaonika
function detectCollision(a,b){
    return a.x<b.x+b.width && // gornje levo od A ne dostize gornje desno od B
        a.x+a.width>b.x &&      // gornje desno od A prestize gornje levo od B
        a.y<b.y+b.height &&     // gornje levo od A ne dostize donje levo of B
        a.y +a.height>b.y;  // donje levo od A prestize gornje levo od B
}