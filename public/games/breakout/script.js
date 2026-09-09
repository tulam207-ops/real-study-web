const canvas = document.getElementById('breakoutCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMsg = document.getElementById('overlay-msg');
const playBtn = document.getElementById('play-btn');

let score = 0;
let lives = 3;
let isGameOver = false;

// Paddle
const paddle = {
  w: 80,
  h: 12,
  x: canvas.width / 2 - 40,
  y: canvas.height - 24,
  speed: 7,
  dx: 0
};

// Ball
const ball = {
  x: canvas.width / 2,
  y: canvas.height - 40,
  radius: 6,
  speed: 4.5,
  dx: 3.5,
  dy: -3.5
};

// Bricks
const rowCount = 5;
const colCount = 7;
const brickWidth = 52;
const brickHeight = 16;
const brickPadding = 7;
const brickOffsetTop = 40;
const brickOffsetLeft = 16;

const rowColors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8'];
let bricks = [];

function initBricks() {
  bricks = [];
  for (let r = 0; r < rowCount; r++) {
    bricks[r] = [];
    for (let c = 0; c < colCount; c++) {
      bricks[r][c] = {
        x: c * (brickWidth + brickPadding) + brickOffsetLeft,
        y: r * (brickHeight + brickPadding) + brickOffsetTop,
        status: 1,
        color: rowColors[r]
      };
    }
  }
}

function initGame() {
  score = 0;
  lives = 3;
  scoreEl.innerText = score;
  livesEl.innerText = lives;
  isGameOver = false;
  overlay.classList.add('hidden');
  resetBall();
  initBricks();
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 40;
  ball.dx = (Math.random() > 0.5 ? 3.5 : -3.5);
  ball.dy = -4;
  paddle.x = canvas.width / 2 - paddle.w / 2;
}

let rightPressed = false;
let leftPressed = false;

window.addEventListener('keydown', e => {
  if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd') rightPressed = true;
  if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a') leftPressed = true;
  if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
});

window.addEventListener('keyup', e => {
  if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd') rightPressed = false;
  if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a') leftPressed = false;
});

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const relativeX = (e.clientX - rect.left) * scaleX;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, relativeX - paddle.w / 2));
  }
});

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const relativeX = (e.touches[0].clientX - rect.left) * scaleX;
  paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, relativeX - paddle.w / 2));
}, { passive: false });

function update() {
  if (isGameOver) return;

  if (rightPressed && paddle.x < canvas.width - paddle.w) {
    paddle.x += paddle.speed;
  } else if (leftPressed && paddle.x > 0) {
    paddle.x -= paddle.speed;
  }

  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall bounce left & right
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
  }

  // Wall bounce top
  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }

  // Paddle bounce
  if (
    ball.y + ball.radius >= paddle.y &&
    ball.y - ball.radius <= paddle.y + paddle.h &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.w
  ) {
    ball.dy = -Math.abs(ball.dy);
    // Angle adjustment
    const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
    ball.dx = hit * 5;
  }

  // Ball fell down
  if (ball.y + ball.radius > canvas.height) {
    lives--;
    livesEl.innerText = lives;
    if (lives <= 0) {
      isGameOver = true;
      overlayTitle.innerText = 'GAME OVER';
      overlayMsg.innerText = `Final Score: ${score}`;
      overlay.classList.remove('hidden');
    } else {
      resetBall();
    }
  }

  // Brick collision
  let allCleared = true;
  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      const b = bricks[r][c];
      if (b.status === 1) {
        allCleared = false;
        if (
          ball.x > b.x &&
          ball.x < b.x + brickWidth &&
          ball.y > b.y &&
          ball.y < b.y + brickHeight
        ) {
          ball.dy = -ball.dy;
          b.status = 0;
          score += 15;
          scoreEl.innerText = score;
        }
      }
    }
  }

  if (allCleared) {
    isGameOver = true;
    overlayTitle.innerText = 'YOU WIN! 🎉';
    overlayMsg.innerText = `Completed with ${score} pts!`;
    overlay.classList.remove('hidden');
  }
}

function draw() {
  ctx.fillStyle = '#05080f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Bricks
  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      const b = bricks[r][c];
      if (b.status === 1) {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, brickWidth, brickHeight, 3);
        ctx.fill();
      }
    }
  }

  // Paddle
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 6);
  ctx.fill();

  // Ball
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

playBtn.addEventListener('click', initGame);

initGame();
loop();
