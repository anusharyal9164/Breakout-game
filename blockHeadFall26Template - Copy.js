// Anush Aryal CG 360/560 - Breakout Game Logic

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let strikes = 0;
let gameRunning = false;

const paddle = { x: 350, y: 550, width: 120, height: 20, speed: 8, dx: 0 };

// Ball starts slow and accelerates gradually up to maxSpeed
const ball = { x: 400, y: 300, radius: 10, speedX: 2.5, speedY: -2.5, maxSpeed: 7.5 };

const bricks = [];
const rowCount = 3;
const colCount = 6;
const brickWidth = 115;
const brickHeight = 25;
const brickPadding = 10;
const brickOffsetTop = 50;
const brickOffsetLeft = 45;

// Initialize Bricks
function initBricks() {
    bricks.length = 0;
    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
            bricks.push({ 
                x: c * (brickWidth + brickPadding) + brickOffsetLeft, 
                y: r * (brickHeight + brickPadding) + brickOffsetTop, 
                status: true 
            });
        }
    }
}
initBricks();

function startGame() {
    if (!gameRunning && strikes < 3) {
        gameRunning = true;
        document.getElementById("gamestatus").innerText = "Game in Progress";
        document.getElementById("gamestatus").style.color = "#ffcc00";
    }
}

function resetGame() {
    score = 0;
    strikes = 0;
    gameRunning = false;
    paddle.x = 350;
    paddle.dx = 0;
    ball.x = 400;
    ball.y = 300;
    ball.speedX = 2.5;
    ball.speedY = -2.5;
    initBricks();
    document.getElementById("scoreboard").innerText = `Score: ${score} | Strikes: ${strikes}/3`;
    document.getElementById("gamestatus").innerText = "Game Reset. Click Start to Play!";
    document.getElementById("gamestatus").style.color = "#ffcc00";
}

// Keyboard controls
window.addEventListener("keydown", e => {
    if (e.key === "ArrowRight" || e.key === "d") paddle.dx = paddle.speed;
    if (e.key === "ArrowLeft" || e.key === "a") paddle.dx = -paddle.speed;
});

window.addEventListener("keyup", e => {
    if ((e.key === "ArrowRight" || e.key === "d") && paddle.dx > 0) paddle.dx = 0;
    if ((e.key === "ArrowLeft" || e.key === "a") && paddle.dx < 0) paddle.dx = 0;
});

function update() {
    if (!gameRunning) return;

    // Gradual acceleration loop
    let currentSpeed = Math.hypot(ball.speedX, ball.speedY);
    if (currentSpeed < ball.maxSpeed) {
        ball.speedX *= 1.0008;
        ball.speedY *= 1.0008;
    }

    paddle.x += paddle.dx;
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;

    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Wall collisions
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) ball.speedX = -ball.speedX;
    if (ball.y - ball.radius < 0) ball.speedY = -ball.speedY;

    // Bottom wall (Strike)
    if (ball.y + ball.radius > canvas.height) {
        strikes++;
        document.getElementById("scoreboard").innerText = `Score: ${score} | Strikes: ${strikes}/3`;
        
        if (strikes >= 3) {
            gameRunning = false;
            document.getElementById("gamestatus").innerText = "Game Over - You Lose! Click Reset.";
            document.getElementById("gamestatus").style.color = "red";
        } else {
            // Reset ball position and slow speed on strike loss
            ball.x = 400; 
            ball.y = 300; 
            ball.speedX = 2.5;
            ball.speedY = -2.5;
        }
    }

    // Paddle collision
    if (ball.y + ball.radius > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.speedY = -ball.speedY;
        ball.speedX += (ball.x - (paddle.x + paddle.width/2)) * 0.05; 
    }

    // Brick collisions
    bricks.forEach(b => {
        if (b.status) {
            if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                ball.speedY = -ball.speedY;
                b.status = false;
                score += 10;
                document.getElementById("scoreboard").innerText = `Score: ${score} | Strikes: ${strikes}/3`;
                
                if (bricks.every(brick => !brick.status)) {
                    gameRunning = false;
                    document.getElementById("gamestatus").innerText = "You Win! Fantastic!";
                    document.getElementById("gamestatus").style.color = "lightgreen";
                }
            }
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddle
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Draw ball
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    // Draw bricks
    bricks.forEach(b => {
        if (b.status) {
            ctx.fillStyle = "#3399ff";
            ctx.fillRect(b.x, b.y, brickWidth, brickHeight);
        }
    });
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start animation loop
loop();