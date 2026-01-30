const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 360;
canvas.height = 640;

let puan = 0;
let gameActive = true;
let gameOverTimer = 0;

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

// --- MOBİL: SİLİNMEYİ ENGELLEYEN KONTROL ---
function handleMobile(e) {
    e.preventDefault();
    if (!gameActive) {
        if (gameOverTimer > 30) resetGame();
        return;
    }
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    const canvasX = (touch.clientX - rect.left) * scaleX;

    // Koordinatın geçerli bir sayı olduğundan emin ol (Silinmeyi önler)
    if (!isNaN(canvasX)) {
        moveDir = (canvasX < canvas.width / 2) ? -1 : 1;
    }
}

canvas.addEventListener("touchstart", (e) => {
    handleMobile(e);
    if (gameActive) jump();
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
    handleMobile(e);
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    moveDir = 0; 
}, { passive: false });

// --- OYUN FONKSİYONLARI ---

function jump() {
    if (!penguin.isJumping && gameActive) {
        penguin.velocityY = -16;
        penguin.isJumping = true;
        penguin.frameY = 2; // Zıplama animasyonu
        penguin.maxFrames = 2;
    }
}

function resetGame() {
    puan = 0; obstacles = []; gameActive = true;
    gameOverTimer = 0; penguin.x = 130; penguin.y = 500;
    penguin.velocityY = 0; timer = 0; moveDir = 0;
}

function update() {
    if (!gameActive) {
        gameOverTimer++;
        return;
    }

    // Yürüme hızı yavaş ve stabil
    penguin.x += moveDir * 4; 
    
    // Zıplama fiziği
    penguin.y += penguin.velocityY;
    penguin.velocityY += penguin.gravity;

    if (penguin.y > 500) {
        penguin.y = 500;
        penguin.isJumping = false;
        penguin.velocityY = 0;
        penguin.frameY = 0; 
        penguin.maxFrames = 5;
    }

    // Sınırlar: Penguenin ekrandan silinmesini/çıkmasını engeller
    if (penguin.x < 0) penguin.x = 0;
    if (penguin.x > canvas.width - penguin.w) penguin.x = canvas.width - penguin.w;

    // Engel yönetimi
    let oyunHizi = (puan < 100) ? 3 : 3 + (puan - 100) * 0.05;
    if (++timer > 80) {
        obstacles.push({ x: Math.random() * (canvas.width - 50), y: -100, w: 50, h: 80, hitW: 30, hitH: 60 });
        timer = 0;
    }

    obstacles.forEach((o, i) => {
        o.y += oyunHizi;
        if (o.y > canvas.height) { obstacles.splice(i, 1); puan++; }
        
        let pCenterX = penguin.x +
