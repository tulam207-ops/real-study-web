const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const p1ScoreEl = document.getElementById('p1-score');
const p2ScoreEl = document.getElementById('p2-score');
const modeSelect = document.getElementById('game-mode');
const resetBtn = document.getElementById('reset-btn');
const overlay = document.getElementById('overlay');
const winnerText = document.getElementById('winner-text');
const playAgainBtn = document.getElementById('play-again-btn');

const WINNING_SCORE = 5;

let p1Score = 0;
let p2Score = 0;
let isGameOver = false;

// Paddle config
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 70;
const PADDLE_SPEED = 6;

const p1 = {
  x: 20,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  w: PADDLE_WIDTH,
  h: PADDLE_HEIGHT,
  dy: 0
};

const p2 = {
  x: canvas.width - 20 - PADDLE_WIDTH,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  w: PADDLE_WIDTH,
  h: PADDLE_HEIGHT,
  dy: 0
};

// Ball config
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 7,
  speed: 5,
  dx: 5,
  dy: 3
};

const keys = {};

function resetBall(scoringPlayer) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 5;
  ball.dx = scoringPlayer === 1 ? 5 : -5;
  ball.dy = (Math.random() * 2 - 1) * 3;
}

function resetGame() {
  p1Score = 0;
  p2Score = 0;
  p1ScoreEl.innerText = p1Score;
  p2ScoreEl.innerText = p2Score;
  isGameOver = false;
  overlay.classList.add('hidden');
  p1.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
  p2.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
  resetBall(Math.random() > 0.5 ? 1 : 2);
}

function update() {
  if (isGameOver) return;

  // Player 1 movement (W/S)
  if (keys['w'] || keys['W']) {
    p1.y = Math.max(0, p1.y - PADDLE_SPEED);
  }
  if (keys['s'] || keys['S']) {
    p1.y = Math.min(canvas.height - p1.h, p1.y + PADDLE_SPEED);
  }

  // Player 2 movement
  const isAI = modeSelect.value === 'ai';
  if (isAI) {
    // Smooth AI tracking
    const targetY = ball.y - p2.h / 2;
    if (p2.y + p2.h / 2 < ball.y - 10) {
      p2.y += Math.min(4.5, targetY - p2.y);
    } else if (p2.y + p2.h / 2 > ball.y + 10) {
      p2.y -= Math.min(4.5, p2.y - targetY);
    }
  } else {
    // Player 2 keys (ArrowUp/ArrowDown)
    if (keys['ArrowUp']) {
      p2.y = Math.max(0, p2.y - PADDLE_SPEED);
    }
    if (keys['ArrowDown']) {
      p2.y = Math.min(canvas.height - p2.h, p2.y + PADDLE_SPEED);
    }
  }

  // Keep paddles inside bounds
  p1.y = Math.max(0, Math.min(canvas.height - p1.h, p1.y));
  p2.y = Math.max(0, Math.min(canvas.height - p2.h, p2.y));

  // Ball movement
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Top / Bottom wall collision
  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
    ball.dy *= -1;
  }

  // Paddle 1 collision
  if (
    ball.x - ball.radius <= p1.x + p1.w &&
    ball.x + ball.radius >= p1.x &&
    ball.y >= p1.y &&
    ball.y <= p1.y + p1.h
  ) {
    ball.dx = Math.abs(ball.dx) * 1.05; // speed up slightly
    // Calculate angle based on hit position
    const hitPoint = (ball.y - (p1.y + p1.h / 2)) / (p1.h / 2);
    ball.dy = hitPoint * 5;
  }

  // Paddle 2 collision
  if (
    ball.x + ball.radius >= p2.x &&
    ball.x - ball.radius <= p2.x + p2.w &&
    ball.y >= p2.y &&
    ball.y <= p2.y + p2.h
  ) {
    ball.dx = -Math.abs(ball.dx) * 1.05;
    const hitPoint = (ball.y - (p2.y + p2.h / 2)) / (p2.h / 2);
    ball.dy = hitPoint * 5;
  }

  // Goal Left (P2 scores)
  if (ball.x - ball.radius <= 0) {
    p2Score++;
    p2ScoreEl.innerText = p2Score;
    if (p2Score >= WINNING_SCORE) {
      endGame(isAI ? 'Computer Wins!' : 'Player 2 Wins!');
    } else {
      resetBall(2);
    }
  }

  // Goal Right (P1 scores)
  if (ball.x + ball.radius >= canvas.width) {
    p1Score++;
    p1ScoreEl.innerText = p1Score;
    if (p1Score >= WINNING_SCORE) {
      endGame('Player 1 Wins!');
    } else {
      resetBall(1);
    }
  }
}

function endGame(winner) {
  isGameOver = true;
  winnerText.innerText = winner;
  overlay.classList.remove('hidden');
}

function draw() {
  // Clear
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Center dashed line
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Paddles
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(p1.x, p1.y, p1.w, p1.h);

  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(p2.x, p2.y, p2.w, p2.h);

  // Ball
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (['ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
});

window.addEventListener('keyup', e => {
  keys[e.key] = false;
});

// Mouse control for Player 1
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const scaleY = canvas.height / rect.height;
  const mouseY = (e.clientY - rect.top) * scaleY;
  p1.y = mouseY - p1.h / 2;
});

// Touch control for Player 1
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const scaleY = canvas.height / rect.height;
  const touchY = (e.touches[0].clientY - rect.top) * scaleY;
  p1.y = touchY - p1.h / 2;
}, { passive: false });

resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', resetGame);
modeSelect.addEventListener('change', resetGame);

resetGame();
loop();
