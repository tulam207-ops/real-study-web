const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMsg = document.getElementById('overlay-msg');
const restartBtn = document.getElementById('restart-btn');

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 1;
let dy = 0;
let nextDx = 1;
let nextDy = 0;
let score = 0;
let highScore = localStorage.getItem('snake_high_score') || 0;
highScoreEl.innerText = highScore;

let gameInterval = null;
let isPaused = false;
let isGameOver = false;

function initGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  dx = 1;
  dy = 0;
  nextDx = 1;
  nextDy = 0;
  score = 0;
  scoreEl.innerText = score;
  isGameOver = false;
  isPaused = false;
  overlay.classList.add('hidden');
  spawnFood();
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 110);
}

function spawnFood() {
  let valid = false;
  while (!valid) {
    food = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT)
    };
    valid = !snake.some(segment => segment.x === food.x && segment.y === food.y);
  }
}

function gameLoop() {
  if (isPaused || isGameOver) return;

  dx = nextDx;
  dy = nextDy;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Wall collision
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    return gameOver();
  }

  // Self collision
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    return gameOver();
  }

  snake.unshift(head);

  // Check food
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.innerText = score;
    if (score > highScore) {
      highScore = score;
      highScoreEl.innerText = highScore;
      localStorage.setItem('snake_high_score', highScore);
    }
    spawnFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  // Clear screen
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid subtle lines
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.width; i += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // Draw food (apple)
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(
    food.x * GRID_SIZE + GRID_SIZE / 2,
    food.y * GRID_SIZE + GRID_SIZE / 2,
    GRID_SIZE / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Glow on food
  ctx.fillStyle = '#fca5a5';
  ctx.beginPath();
  ctx.arc(
    food.x * GRID_SIZE + GRID_SIZE / 3,
    food.y * GRID_SIZE + GRID_SIZE / 3,
    GRID_SIZE / 6,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Draw snake
  snake.forEach((seg, index) => {
    if (index === 0) {
      // Head
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(seg.x * GRID_SIZE + 1, seg.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
      
      // Eyes
      ctx.fillStyle = '#052e16';
      const eyeSize = 3;
      if (dx === 1) {
        ctx.fillRect(seg.x * GRID_SIZE + 13, seg.y * GRID_SIZE + 4, eyeSize, eyeSize);
        ctx.fillRect(seg.x * GRID_SIZE + 13, seg.y * GRID_SIZE + 13, eyeSize, eyeSize);
      } else if (dx === -1) {
        ctx.fillRect(seg.x * GRID_SIZE + 4, seg.y * GRID_SIZE + 4, eyeSize, eyeSize);
        ctx.fillRect(seg.x * GRID_SIZE + 4, seg.y * GRID_SIZE + 13, eyeSize, eyeSize);
      } else if (dy === 1) {
        ctx.fillRect(seg.x * GRID_SIZE + 4, seg.y * GRID_SIZE + 13, eyeSize, eyeSize);
        ctx.fillRect(seg.x * GRID_SIZE + 13, seg.y * GRID_SIZE + 13, eyeSize, eyeSize);
      } else {
        ctx.fillRect(seg.x * GRID_SIZE + 4, seg.y * GRID_SIZE + 4, eyeSize, eyeSize);
        ctx.fillRect(seg.x * GRID_SIZE + 13, seg.y * GRID_SIZE + 4, eyeSize, eyeSize);
      }
    } else {
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(seg.x * GRID_SIZE + 1, seg.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    }
  });
}

function gameOver() {
  isGameOver = true;
  clearInterval(gameInterval);
  overlayTitle.innerText = 'GAME OVER';
  overlayMsg.innerText = `Final Score: ${score}`;
  restartBtn.innerText = 'PLAY AGAIN';
  overlay.classList.remove('hidden');
}

window.addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault();
  }

  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
    if (dy === 0) { nextDx = 0; nextDy = -1; }
  } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
    if (dy === 0) { nextDx = 0; nextDy = 1; }
  } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    if (dx === 0) { nextDx = -1; nextDy = 0; }
  } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    if (dx === 0) { nextDx = 1; nextDy = 0; }
  } else if (e.key === ' ') {
    if (isGameOver) {
      initGame();
    } else {
      isPaused = !isPaused;
    }
  }
});

document.getElementById('btn-up').addEventListener('click', () => {
  if (dy === 0) { nextDx = 0; nextDy = -1; }
});
document.getElementById('btn-down').addEventListener('click', () => {
  if (dy === 0) { nextDx = 0; nextDy = 1; }
});
document.getElementById('btn-left').addEventListener('click', () => {
  if (dx === 0) { nextDx = -1; nextDy = 0; }
});
document.getElementById('btn-right').addEventListener('click', () => {
  if (dx === 0) { nextDx = 1; nextDy = 0; }
});

restartBtn.addEventListener('click', initGame);

// Start on load
initGame();
