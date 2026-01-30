const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 360;
canvas.height = 640;

let puan = 0;
let gameActive = true;
let gameOverTimer = 0;

// AYARLAR
const kenarPayi = 60; 

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
let moveDir = 0; // -1: Sol, 1: Sağ, 0: Dur

// PC KONTROLLERİ
window.onkeydown = (e) => {
    if (e.key === "ArrowLeft") moveDir = -1;
    if (e.key === "ArrowRight") moveDir = 1;
    if (e.key === " " || e.key === "ArrowUp") jump();
    if (!gameActive && gameOverTimer > 30) resetGame();
};
window.onkeyup = () => moveDir = 0;

// --- MOBİL BASILI TUTMA MANTIĞI ---


canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const canvasTouchX = (touch.clientX - rect.left) * scaleX;

    if (!gameActive) {
        if (gameOverTimer > 30) resetGame();
    } else {
        // Sağa mı sola mı basıldı karar ver
        moveDir = (canvasTouchX < canvas.width / 2) ? -1 : 1;
        jump();
    }
}, { passive: false });

// Parmağını ekranda hareket ettirirsen (sağdan sola geçersen) yön değişsin
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const canvasTouchX = (touch.clientX - rect.left) * scaleX;
    
    if (gameActive) {
        moveDir = (canvasTouchX < canvas.width / 2) ? -1 : 1;
    }
}, { passive: false });

// Parmağını çektiğin an penguen dursun
canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    moveDir = 0; 
}, { passive: false });

function jump() {
    if (!penguin.isJumping && gameActive) {
        penguin.velocityY = -16;
        penguin.isJumping = true;
        penguin.frameY = 2;
        penguin
