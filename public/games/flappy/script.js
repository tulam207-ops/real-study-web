const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('best-score');
const finalScoreEl = document.getElementById('final-score');
const startOverlay = document.getElementById('start-overlay');
const gameoverOverlay = document.getElementById('gameover-overlay');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

let bestScore = localStorage.getItem('flappy_best_score') || 0;
bestScoreEl.innerText = bestScore;

let gameState = 'START'; // 'START' | 'PLAYING' | 'GAMEOVER'
let frame = 0;
let score = 0;

// Bird
const bird = {
  x: 50,
  y: 200,
  w: 24,
  h: 20,
  velocity: 0,
  gravity: 0.28,
  jump: -5.6,
  rotation: 0
};

// Pipes
let pipes = [];
const PIPE_WIDTH = 52;
const PIPE_GAP = 120;
const PIPE_SPEED = 2;

function initGame() {
  bird.y = 200;
  bird.velocity = 0;
  bird.rotation = 0;
  pipes = [];
  score = 0;
  scoreEl.innerText = score;
  frame = 0;
  gameState = 'PLAYING';
  startOverlay.classList.add('hidden');
  gameoverOverlay.classList.add('hidden');
}

function flap() {
  if (gameState === 'START') {
    initGame();
  } else if (gameState === 'PLAYING') {
    bird.velocity = bird.jump;
  } else if (gameState === 'GAMEOVER') {
    initGame();
  }
}

function spawnPipe() {
  const minHeight = 40;
  const maxHeight = canvas.height - PIPE_GAP - minHeight - 60; // 60 is ground
  const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
  pipes.push({
    x: canvas.width,
    topHeight: topHeight,
    bottomY: topHeight + PIPE_GAP,
    passed: false
  });
}

function update() {
  if (gameState !== 'PLAYING') return;

  frame++;

  // Bird physics
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;
  bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 6, bird.velocity * 0.1));

  // Floor collision (ground is 420)
  if (bird.y + bird.h >= canvas.height - 40) {
    bird.y = canvas.height - 40 - bird.h;
    return triggerGameOver();
  }

  // Ceiling collision
  if (bird.y <= 0) {
    bird.y = 0;
    bird.velocity = 0;
  }

  // Spawn pipes
  if (frame % 100 === 0) {
    spawnPipe();
  }

  // Update pipes
  for (let i = 0; i < pipes.length; i++) {
    const p = pipes[i];
    p.x -= PIPE_SPEED;

    // Bird bounding box
    const bx = bird.x + 2;
    const by = bird.y + 2;
    const bw = bird.w - 4;
    const bh = bird.h - 4;

    // Check collision with top pipe
    if (
      bx + bw > p.x &&
      bx < p.x + PIPE_WIDTH &&
      by < p.topHeight
    ) {
      return triggerGameOver();
    }

    // Check collision with bottom pipe
    if (
      bx + bw > p.x &&
      bx < p.x + PIPE_WIDTH &&
      by + bh > p.bottomY
    ) {
      return triggerGameOver();
    }

    // Score point
    if (!p.passed && p.x + PIPE_WIDTH < bird.x) {
      p.passed = true;
      score++;
      scoreEl.innerText = score;
      if (score > bestScore) {
        bestScore = score;
        bestScoreEl.innerText = bestScore;
        localStorage.setItem('flappy_best_score', bestScore);
      }
    }
  }

  // Remove off-screen pipes
  pipes = pipes.filter(p => p.x + PIPE_WIDTH > 0);
}

function triggerGameOver() {
  gameState = 'GAMEOVER';
  finalScoreEl.innerText = score;
  gameoverOverlay.classList.remove('hidden');
}

function draw() {
  // Clear sky
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Background clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.arc(80, 100, 24, 0, Math.PI * 2);
  ctx.arc(110, 95, 30, 0, Math.PI * 2);
  ctx.arc(140, 100, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(240, 160, 20, 0, Math.PI * 2);
  ctx.arc(265, 155, 26, 0, Math.PI * 2);
  ctx.arc(290, 160, 18, 0, Math.PI * 2);
  ctx.fill();

  // Pipes
  for (const p of pipes) {
    // Top Pipe
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topHeight);
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(p.x - 2, p.topHeight - 16, PIPE_WIDTH + 4, 16);

    // Bottom Pipe
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(p.x, p.bottomY, PIPE_WIDTH, canvas.height - p.bottomY - 40);
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(p.x - 2, p.bottomY, PIPE_WIDTH + 4, 16);
  }

  // Ground
  ctx.fillStyle = '#854d0e';
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(0, canvas.height - 40, canvas.width, 8);

  // Bird
  ctx.save();
  ctx.translate(bird.x + bird.w / 2, bird.y + bird.h / 2);
  ctx.rotate(bird.rotation);

  // Bird body (yellow circle/pill)
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.ellipse(0, 0, bird.w / 2, bird.h / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.ellipse(-4, 2, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(6, -4, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(7, -4, 2, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.moveTo(10, -2);
  ctx.lineTo(16, 2);
  ctx.lineTo(10, 6);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'ArrowUp') {
    e.preventDefault();
    flap();
  }
});

canvas.addEventListener('click', flap);
startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);

loop();
