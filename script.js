const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 360;
canvas.height = 640;

let puan = 0;
let gameActive = true;
let gameOverTimer = 0;

// AYARLAR
const kenarPayi = 60; 

// ASSETLER
const penguinImg = new Image();
penguinImg.src = "assets/penguin.png";

const bgImg = new Image();
bgImg.src = "assets/arka-plan.jpg"; 

const buzImg = new Image();
buzImg.src = "assets/buz.png"; 

const penguin = {
    x: 130, 
    y: 500,
    w: 100, 
    h: 100,
    hitW: 40, 
    hitH: 60, 
    frameX: 0,
    frameY: 0,
    maxFrames: 5,
    fps: 0,
    stagger: 8,
    velocityY: 0,
    gravity: 0.8,
    isJumping: false
};

let obstacles = [];
let timer = 0;
let moveDir = 0;

// PC KONTROLLERİ
window.onkeydown = (e) => {
    if (e.key === "ArrowLeft") moveDir = -1;
    if (e.key === "ArrowRight") moveDir = 1;
    if (e.key === " " || e.key === "ArrowUp") jump();
    if (!gameActive && gameOverTimer > 30) resetGame();
};
window.onkeyup = () => moveDir = 0;

// --- MOBİL EKLEME (TAM İSTEDİĞİN GİBİ) ---
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    
    // Canvas'ın ekrandaki gerçek boyutuna göre oranlama (Hata payını siler)
    const scaleX = canvas.width / rect.width;
    const canvasTouchX = (touch.clientX - rect.left) * scaleX;

    if (!gameActive) {
        if (gameOverTimer > 30) resetGame();
    } else {
        // Ekranın sol yarısına basınca sola, sağına basınca sağa yürür
        if (canvasTouchX < canvas.width / 2) {
            moveDir = -1; 
        } else {
            moveDir = 1;
        }
        jump(); // Basınca aynı zamanda zıplatır
    }
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    moveDir = 0; // Parmağını çekince yürümeyi durdurur (Ok tuşunu bırakmak gibi)
}, { passive: false });

// --- MOBİL EKLEME BİTİŞ ---

function jump() {
    if (!penguin.isJumping && gameActive) {
        penguin.velocityY = -16;
        penguin.isJumping = true;
        penguin.frameY = 2;
        penguin.maxFrames = 2;
    }
}

function resetGame() {
    puan = 0;
    obstacles = [];
    gameActive = true;
    gameOverTimer = 0;
    penguin.x = 130;
    penguin.y = 500;
    penguin.velocityY = 0;
    timer = 0;
}

function update() {
    if (!gameActive) {
        gameOverTimer++;
        return;
    }

    // Yürüme mantığı (Senin orijinal hızın: 9)
    penguin.x += moveDir * 9;
    penguin.y += penguin.velocityY;
    penguin.velocityY += penguin.gravity;

    if (penguin.y > 500) {
        penguin.y = 500;
        penguin.isJumping = false;
        penguin.velocityY = 0;
        penguin.frameY = 0;
        penguin.maxFrames = 5;
    }

    if (penguin.x < -kenarPayi) penguin.x = -kenarPayi;
    if (penguin.x > canvas.width - penguin.w + kenarPayi) {
        penguin.x = canvas.width - penguin.w + kenarPayi;
    }

    let oyunHizi = (puan < 100) ? 3 : 3 + (puan - 100) * 0.05;
    let uretimSikligi = (puan < 100) ? 80 : 55;

    if (++timer > uretimSikligi) {
        obstacles.push({ 
            x: Math.random() * (canvas.width - 50), 
            y: -100, 
            w: 50, 
            h: 80, 
            hitW: 30, 
            hitH: 60 
        });
        timer = 0;
    }

    obstacles.forEach((o, i) => {
        o.y += oyunHizi;
        if (o.y > canvas.height) {
            obstacles.splice(i, 1);
            puan++;
        }
        
        let pCenterX = penguin.x + penguin.w / 2;
        let pCenterY = penguin.y + penguin.h / 2;
        let bCenterX = o.x + o.w / 2;
        let bCenterY = o.y + o.h / 2;

        if (Math.abs(pCenterX - bCenterX) < (penguin.hitW + o.hitW) / 2 &&
            Math.abs(pCenterY - bCenterY) < (penguin.hitH + o.hitH) / 2) {
            gameActive = false;
        }
    });

    penguin.fps++;
    if (penguin.fps % penguin.stagger === 0) {
        penguin.frameX = (penguin.frameX + 1) % penguin.maxFrames;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (bgImg.complete) ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    if (penguinImg.complete) {
        ctx.drawImage(penguinImg, penguin.frameX * 64, penguin.frameY * 40, 64, 40, penguin.x, penguin.y, penguin.w, penguin.h);
    }
