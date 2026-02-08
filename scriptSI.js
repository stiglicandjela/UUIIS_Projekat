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
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; // broj vanzemaljaca
let alienVelocityX = 1; // brzina kretanja vanzemaljca

//metci
let bulletArray = [];
let bulletVelocityY = -10; // brzina metaka


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

    alienImg = new Image();
    alienImg.src = "imagesSI/alien.png";

    createAliens();

    this.requestAnimationFrame(update);
    this.document.addEventListener("keydown", moveShip);
    this.document.addEventListener("keyup", shoot);
}

function update(){
    requestAnimationFrame(update);

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
            context.drawImage(alienImg,alien.x,alien.y,alien.width,alien.height);
        }
    }


    //metci
    for(let i=0;i<bulletArray.length;i++){
        let bullet = bulletArray[i];
        bullet.y+=bulletVelocityY;
        context.fillStyle="white";
        context.fillRect(bullet.x,bullet.y,bullet.width,bullet.height);
    }
    //obrisi metke
    while(bulletArray>0 && (bulletArray[0].used || bulletArray[0].y<0)){
        bulletArray.shift(); // obrise prvi element niza
    }

}

function moveShip(e){
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
                img: alienImg,
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