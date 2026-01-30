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

// --- MOBİL: SİLİNMEYİ VE IŞINLANMAYI ENGELLEYEN MANTIK ---


function updateMoveDir(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    const canvasX = (touch.clientX - rect.left) * scaleX;

    if (!gameActive) {
        if (gameOverTimer > 30) resetGame();
        return;
    }
    // Sadece ekranın yarısına göre yön ver
    moveDir = (canvasX < canvas.width / 2) ? -1 : 1;
}

canvas.addEventListener("touchstart", (e) => {
    updateMoveDir(e);
    if (gameActive) jump();
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
    updateMoveDir(e); // Sürüklerken yönü güncelle
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    moveDir = 0; // Parmağını çektiğin an penguen DURUR, silinip gidemez
}, { passive: false });

function jump() {
    if (!penguin.isJumping && gameActive) {
        penguin.velocityY = -16;
        penguin.isJumping = true;
        penguin.frameY = 2;
        penguin.maxFrames = 2;
    }
}

function resetGame() {
    puan = 0; obstacles = []; gameActive = true;
    gameOverTimer =
