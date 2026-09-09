const canvas = document.getElementById('dinoCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const hiScoreEl = document.getElementById('hi-score');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMsg = document.getElementById('overlay-msg');
const playBtn = document.getElementById('play-btn');

let hiScore = localStorage.getItem('dino_hi_score') || 0;
hiScoreEl.innerText = String(hiScore).padStart(5, '0');

let isPlaying = false;
let score = 0;
let speed = 6;
let frame = 0;

// Dino
const GROUND_Y = 160;
const dino = {
  x: 40,
  y: GROUND_Y - 40,
  w: 36,
  h: 40,
  vy: 0,
  jumpPower: -11,
  gravity: 0.6,
  isGrounded: true,
  isDucking: false
};

// Obstacles
let obstacles = [];
let clouds = [
  { x: 120, y: 40, w: 40, h: 14 },
  { x: 340, y: 60, w: 50, h: 16 },
  { x: 520, y: 30, w: 44, h: 14 }
];

function startGame() {
  isPlaying = true;
  score = 0;
  speed = 6;
  frame = 0;
  obstacles = [];
  dino.y = GROUND_Y - 40;
  dino.vy = 0;
  dino.isGrounded = true;
  overlay.classList.add('hidden');
}

function gameOver() {
  isPlaying = false;
  overlayTitle.innerText = 'GAME OVER';
  overlayMsg.innerText = `You scored ${Math.floor(score)} points`;
  playBtn.innerText = 'PLAY AGAIN';
  overlay.classList.remove('hidden');
}

function jump() {
  if (!isPlaying) {
    startGame();
  } else if (dino.isGrounded && !dino.isDucking) {
    dino.vy = dino.jumpPower;
    dino.isGrounded = false;
  }
}

function spawnObstacle() {
  const isBird = score > 150 && Math.random() < 0.25;
  if (isBird) {
    obstacles.push({
      type: 'bird',
      x: canvas.width,
      y: GROUND_Y - 42,
      w: 30,
      h: 20
    });
  } else {
    // Cactus
    const count = Math.random() < 0.35 ? 2 : 1;
    obstacles.push({
      type: 'cactus',
      x: canvas.width,
      y: GROUND_Y - 36,
      w: 18 * count,
      h: 36
    });
  }
}

function update() {
  if (!isPlaying) return;

  frame++;
  score += 0.15;
  scoreEl.innerText = String(Math.floor(score)).padStart(5, '0');

  if (score > hiScore) {
    hiScore = Math.floor(score);
    hiScoreEl.innerText = String(hiScore).padStart(5, '0');
    localStorage.setItem('dino_hi_score', hiScore);
  }

  // Gradual speed up
  if (frame % 300 === 0 && speed < 12) {
    speed += 0.4;
  }

  // Dino physics
  dino.vy += dino.gravity;
  dino.y += dino.vy;

  const currentH = dino.isDucking ? 24 : 40;
  if (dino.y + currentH >= GROUND_Y) {
    dino.y = GROUND_Y - currentH;
    dino.vy = 0;
    dino.isGrounded = true;
  }

  // Spawn obstacles
  const minInterval = Math.max(50, 90 - Math.floor(speed * 3));
  if (frame % minInterval === 0 && Math.random() < 0.75) {
    spawnObstacle();
  }

  // Move clouds
  clouds.forEach(c => {
    c.x -= speed * 0.2;
    if (c.x + c.w < 0) c.x = canvas.width + Math.random() * 80;
  });

  // Move and check obstacles
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    obs.x -= speed;

    // Collision detection
    const dw = dino.isDucking ? 44 : dino.w;
    const dh = dino.isDucking ? 24 : dino.h;
    if (
      dino.x + 6 < obs.x + obs.w &&
      dino.x + dw - 6 > obs.x &&
      dino.y + 4 < obs.y + obs.h &&
      dino.y + dh > obs.y + 4
    ) {
      gameOver();
      return;
    }
  }

  obstacles = obstacles.filter(obs => obs.x + obs.w > 0);
}

function draw() {
  // Clear
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Clouds
  ctx.fillStyle = '#cbd5e1';
  clouds.forEach(c => {
    ctx.beginPath();
    ctx.roundRect(c.x, c.y, c.w, c.h, 6);
    ctx.fill();
  });

  // Ground line
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(canvas.width, GROUND_Y);
  ctx.stroke();

  // Ground pebbles
  ctx.fillStyle = '#94a3b8';
  for (let i = 0; i < canvas.width; i += 40) {
    const x = (i - (frame * speed) % 40);
    ctx.fillRect(x, GROUND_Y + 8, 4, 2);
    ctx.fillRect(x + 18, GROUND_Y + 16, 6, 2);
  }

  // Obstacles
  obstacles.forEach(obs => {
    if (obs.type === 'cactus') {
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(obs.x + 2, obs.y, obs.w - 4, obs.h);
      // Arms
      ctx.fillRect(obs.x - 3, obs.y + 8, obs.w + 6, 6);
    } else {
      // Bird
      ctx.fillStyle = '#475569';
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      // Wing flap
      const wingY = (frame % 20 < 10) ? obs.y - 6 : obs.y + 12;
      ctx.fillRect(obs.x + 8, wingY, 10, 6);
    }
  });

  // Dino
  ctx.fillStyle = '#334155';
  const dw = dino.isDucking ? 44 : dino.w;
  const dh = dino.isDucking ? 24 : dino.h;

  if (dino.isDucking) {
    // Body
    ctx.fillRect(dino.x, dino.y + 8, 38, 16);
    // Head forward
    ctx.fillRect(dino.x + 28, dino.y + 2, 16, 14);
    // Eye
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(dino.x + 36, dino.y + 4, 3, 3);
  } else {
    // Upright body
    ctx.fillRect(dino.x, dino.y + 14, 24, 20);
    // Head
    ctx.fillRect(dino.x + 14, dino.y, 22, 18);
    // Eye
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(dino.x + 26, dino.y + 4, 3, 3);
    // Legs animation
    ctx.fillStyle = '#334155';
    if (dino.isGrounded) {
      if (Math.floor(frame / 6) % 2 === 0) {
        ctx.fillRect(dino.x + 4, dino.y + 34, 4, 6);
        ctx.fillRect(dino.x + 16, dino.y + 34, 4, 3);
      } else {
        ctx.fillRect(dino.x + 4, dino.y + 34, 4, 3);
        ctx.fillRect(dino.x + 16, dino.y + 34, 4, 6);
      }
    } else {
      ctx.fillRect(dino.x + 4, dino.y + 34, 4, 6);
      ctx.fillRect(dino.x + 16, dino.y + 34, 4, 6);
    }
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', e => {
  if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key)) {
    e.preventDefault();
    jump();
  }
  if (['ArrowDown', 's', 'S'].includes(e.key)) {
    e.preventDefault();
    dino.isDucking = true;
  }
});

window.addEventListener('keyup', e => {
  if (['ArrowDown', 's', 'S'].includes(e.key)) {
    dino.isDucking = false;
  }
});

canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  jump();
}, { passive: false });

playBtn.addEventListener('click', startGame);

loop();
