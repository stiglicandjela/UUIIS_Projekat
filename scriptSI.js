// board
let tileSize = 32;
let rows = 20;
let columns = 20;

let board;
let boardWidth = tileSize * columns; 
let boardHeight = tileSize * rows; 

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

// metci vanzemaljaca
let alienBulletArray = [];
let alienBulletVelocityY = 1.8;
let alienShootCooldown = 0;  
let alienShootRate = 55;        // sto manji broj to vise pucaju

// zivoti 
let lives = 3;
let score = 0;
let gameOver = false;

// ===== SFX (pucanje + pogodak) =====
const shootSfx = new Audio("sounds/shoot.wav");
const hitSfx   = new Audio("sounds/invaderkilled.wav");
const hurtSfx = new Audio("sounds/explosion.wav");

function playHurt() {
  if (!audioUnlocked) return;
  const s = hurtSfx.cloneNode();
  s.volume = 0.7;
  s.play().catch(()=>{});
}

let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  shootSfx.volume = 0.5;
  hitSfx.volume = 0.6;

  shootSfx.play().then(() => {
    shootSfx.pause();
    shootSfx.currentTime = 0;
  }).catch(() => {});

  hitSfx.play().then(() => {
    hitSfx.pause();
    hitSfx.currentTime = 0;
  }).catch(() => {});

  hurtSfx.volume = 0.7;

  hurtSfx.play().then(() => {
  hurtSfx.pause();
  hurtSfx.currentTime = 0;
 }).catch(() => {});

}

// helper da ne "secka" kad se puca brzo
function playShoot() {
  if (!audioUnlocked) return;
  const s = shootSfx.cloneNode();
  s.volume = 0.5;
  s.play().catch(()=>{});
}

function playHit() {
  if (!audioUnlocked) return;
  const s = hitSfx.cloneNode();
  s.volume = 0.6;
  s.play().catch(()=>{});
}


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
    //vanzemaljci
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
    document.addEventListener("keydown", unlockAudio, { once: true });

}

function update(){
    requestAnimationFrame(update);

    if(gameOver){
        drawGameOverScreen?.(); 
        return;
    }

    context.clearRect(0,0,board.width,board.height);

    // brod
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    // ================= VANZEMALJCI =================
    for(let i = 0; i < alienArray.length; i++){
        let alien = alienArray[i];
        if(alien.alive){
            alien.x += alienVelocityX;

            if(alien.x + alien.width >= board.width || alien.x <= 0){
                alienVelocityX *= -1;

                for(let j = 0; j < alienArray.length; j++){
                    alienArray[j].y += alienHeight;
                }
            }

            context.drawImage(alien.img, alien.x, alien.y, alien.width, alien.height);

            if(alien.y >= ship.y){
                gameOver = true;
            }
        }
    }

    // ================= PUCANJE VANZEMALJACA =================
    alienShootCooldown--;
    if(alienShootCooldown <= 0){
        alienShoot();
        alienShootCooldown = alienShootRate;
    }

    // ================= PUCANJE IGRACA =================
    for(let i = bulletArray.length - 1; i >= 0; i--){
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;

        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // pogodak aliena
        for(let j = 0; j < alienArray.length; j++){
            let alien = alienArray[j];
            if(alien.alive && detectCollision(bullet, alien)){
                alien.alive = false;
                alienCount--;
                playHit();
                score += 100;
                bulletArray.splice(i, 1);
                break;
            }
        }

        // van ekrana
        if(i < bulletArray.length && bullet.y + bullet.height < 0){
            bulletArray.splice(i, 1);
        }
    }

    // ================= PUCANJE VANZEMALJACA =================
    for(let i = alienBulletArray.length - 1; i >= 0; i--){
        let b = alienBulletArray[i];
        b.y += alienBulletVelocityY;

        context.fillStyle = "red";
        context.fillRect(b.x, b.y, b.width, b.height);

        let shipRect = { x: ship.x, y: ship.y, width: ship.width, height: ship.height };
        if(detectCollision(b, shipRect)){
            alienBulletArray.splice(i, 1);
            playHurt();
                lives--;
                if(lives <= 0){
                    gameOver = true;
            continue;
        }
    }

        if(b.y > board.height){
            alienBulletArray.splice(i, 1);
        }
    }

    // ================= SLEDECI NIVO =================
    if(alienCount === 0){
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
        alienRows = Math.min(alienRows + 1, rows - 4);
        alienVelocityX += 0.2;

        alienArray = [];
        bulletArray = [];
        alienBulletArray = [];
        createAliens();
    }

    // ================= HUD =================
    context.fillStyle = "white";
    context.font = "16px 'Press Start 2P'";
    context.fillText("SCORE: " + score, 5, 20);
    context.fillText("LIVES: " + lives, 5, 40);
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

function alienShoot() {
  // izaberi random živog aliena
  let aliveAliens = alienArray.filter(a => a.alive);
  if (aliveAliens.length === 0) return;

  let shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];

  alienBulletArray.push({
    x: shooter.x + shooter.width / 2 - 2,
    y: shooter.y + shooter.height,
    width: 4,
    height: 10
  });
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
    playShoot(); 

    }
}

// kolizija za dva pravougaonika
function detectCollision(a,b){
    return a.x<b.x+b.width && // gornje levo od A ne dostize gornje desno od B
        a.x+a.width>b.x &&      // gornje desno od A prestize gornje levo od B
        a.y<b.y+b.height &&     // gornje levo od A ne dostize donje levo of B
        a.y +a.height>b.y;  // donje levo od A prestize gornje levo od B
}

function drawGameOverScreen() {
  // overlay
  context.fillStyle = "rgba(0,0,0,0.75)";
  context.fillRect(0, 0, board.width, board.height);

  const cx = board.width / 2;
  const cy = board.height / 2;

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "white";

  context.font = "22px 'Press Start 2P'";
  context.fillText("GAME OVER", cx, cy - 40);

  context.font = "12px 'Press Start 2P'";
  context.fillText("SCORE: " + score, cx, cy + 5);
  context.fillText("Refresh to Restart", cx, cy + 35);

  // vrati default ako negde drugde koristiš left/top
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
}
