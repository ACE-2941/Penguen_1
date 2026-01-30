const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 360;
canvas.height = 640;

let puan = 0;
let gameActive = true;
let gameOverTimer = 0;

const kenarPayi = 10;

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
    isJumping: false,

    // 🔥 YENİ HAREKET SİSTEMİ
    speedX: 0,
    maxSpeed: 4,
    acceleration: 0.5,
    friction: 0.85
};

let obstacles = [];
let timer = 0;
let moveDir = 0;

// ---------------- PC KONTROLLER ----------------
window.onkeydown = (e) => {
    if (e.key === "ArrowLeft") moveDir = -1;
    if (e.key === "ArrowRight") moveDir = 1;
    if (e.key === " " || e.key === "ArrowUp") jump();
    if (!gameActive && gameOverTimer > 30) resetGame();
};

window.onkeyup = (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        moveDir = 0;
    }
};

// ---------------- MOBİL KONTROLLER ----------------
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();

    if (!gameActive) {
        if (gameOverTimer > 30) resetGame();
        return;
    }

    const touchX = e.touches[0].clientX;
    const mid = window.innerWidth / 2;

    moveDir = touchX < mid ? -1 : 1;
    jump();
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!gameActive) return;

    const touchX = e.touches[0].clientX;
    const mid = window.innerWidth / 2;

    moveDir = touchX < mid ? -1 : 1;
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    moveDir = 0;
}, { passive: false });

// ---------------- JUMP ----------------
function jump() {
    if (!penguin.isJumping && gameActive) {
        penguin.velocityY = -16;
        penguin.isJumping = true;
        penguin.frameY = 2;
    }
}

// ---------------- UPDATE ----------------
function update() {
    if (!gameActive) {
        gameOverTimer++;
        return;
    }

    // YATAY HAREKET (PC + MOBİL)
    if (moveDir !== 0) {
        penguin.speedX += moveDir * penguin.acceleration;
    } else {
        penguin.speedX *= penguin.friction;
    }

    penguin.speedX = Math.max(
        -penguin.maxSpeed,
        Math.min(penguin.maxSpeed, penguin.speedX)
    );

    penguin.x += penguin.speedX;

    penguin.x = Math.max(
        kenarPayi,
        Math.min(canvas.width - penguin.w - kenarPayi, penguin.x)
    );

    // DÜŞEY FİZİK
    penguin.y += penguin.velocityY;
    penguin.velocityY += penguin.gravity;

    if (penguin.y >= 500) {
        penguin.y = 500;
        penguin.velocityY = 0;
        penguin.isJumping = false;
        penguin.frameY = 0;
    }

    timer++;
}

// ---------------- DRAW ----------------
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    ctx.drawImage(
        penguinImg,
        penguin.frameX * penguin.w,
        penguin.frameY * penguin.h,
        penguin.w,
        penguin.h,
        penguin.x,
        penguin.y,
        penguin.w,
        penguin.h
    );

    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("Puan: " + puan, 20, 30);
}

// ---------------- RESET ----------------
function resetGame() {
    gameActive = true;
    gameOverTimer = 0;
    puan = 0;
    obstacles = [];
    penguin.x = 130;
    penguin.y = 500;
    penguin.speedX = 0;
    penguin.velocityY = 0;
}

// ---------------- LOOP ----------------
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
