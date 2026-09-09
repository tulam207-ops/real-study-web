const canvas = document.getElementById('tetrisCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

const linesEl = document.getElementById('lines');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const overlay = document.getElementById('overlay');
const restartBtn = document.getElementById('restart-btn');
const pauseBtn = document.getElementById('pause-btn');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;

const COLORS = [
  null,
  '#ef4444', // Z (red)
  '#22c55e', // S (green)
  '#3b82f6', // J (blue)
  '#f97316', // L (orange)
  '#eab308', // O (yellow)
  '#06b6d4', // I (cyan)
  '#a855f7'  // T (purple)
];

const SHAPES = [
  [],
  [[1, 1, 0], [0, 1, 1], [0, 0, 0]], // Z
  [[0, 2, 2], [2, 2, 0], [0, 0, 0]], // S
  [[3, 0, 0], [3, 3, 3], [0, 0, 0]], // J
  [[0, 0, 4], [4, 4, 4], [0, 0, 0]], // L
  [[5, 5], [5, 5]],                  // O
  [[0, 0, 0, 0], [6, 6, 6, 6], [0, 0, 0, 0], [0, 0, 0, 0]], // I
  [[0, 7, 0], [7, 7, 7], [0, 0, 0]]  // T
];

let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let lines = 0;
let level = 1;
let dropCounter = 0;
let dropInterval = 800;
let lastTime = 0;
let isPaused = false;
let isGameOver = false;

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function getRandomPiece() {
  const typeId = Math.floor(Math.random() * 7) + 1;
  const matrix = SHAPES[typeId];
  return {
    matrix,
    x: Math.floor(COLS / 2) - Math.ceil(matrix[0].length / 2),
    y: 0,
    color: typeId
  };
}

function resetGame() {
  board = createBoard();
  score = 0;
  lines = 0;
  level = 1;
  dropInterval = 800;
  scoreEl.innerText = score;
  linesEl.innerText = lines;
  levelEl.innerText = level;
  isGameOver = false;
  isPaused = false;
  overlay.classList.add('hidden');
  nextPiece = getRandomPiece();
  spawnPiece();
}

function spawnPiece() {
  currentPiece = nextPiece;
  nextPiece = getRandomPiece();
  drawNext();
  if (collide(board, currentPiece)) {
    isGameOver = true;
    overlay.classList.remove('hidden');
  }
}

function drawNext() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const matrix = nextPiece.matrix;
  const size = 16;
  const offX = (nextCanvas.width - matrix[0].length * size) / 2;
  const offY = (nextCanvas.height - matrix.length * size) / 2;

  matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val !== 0) {
        nextCtx.fillStyle = COLORS[val];
        nextCtx.fillRect(offX + x * size, offY + y * size, size - 1, size - 1);
      }
    });
  });
}

function collide(b, piece) {
  const m = piece.matrix;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (
        m[y][x] !== 0 &&
        (b[y + piece.y] && b[y + piece.y][x + piece.x]) !== 0
      ) {
        return true;
      }
    }
  }
  return false;
}

function merge(b, piece) {
  piece.matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val !== 0) {
        b[y + piece.y][x + piece.x] = val;
      }
    });
  });
}

function rotate(matrix) {
  const N = matrix.length;
  const result = matrix.map((row, i) =>
    row.map((val, j) => matrix[N - 1 - j][i])
  );
  return result;
}

function playerRotate() {
  const originalMatrix = currentPiece.matrix;
  currentPiece.matrix = rotate(currentPiece.matrix);
  let offset = 1;
  while (collide(board, currentPiece)) {
    currentPiece.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > currentPiece.matrix[0].length) {
      currentPiece.matrix = originalMatrix;
      return;
    }
  }
}

function playerMove(dir) {
  currentPiece.x += dir;
  if (collide(board, currentPiece)) {
    currentPiece.x -= dir;
  }
}

function playerDrop() {
  currentPiece.y++;
  if (collide(board, currentPiece)) {
    currentPiece.y--;
    merge(board, currentPiece);
    clearLines();
    spawnPiece();
  }
  dropCounter = 0;
}

function playerHardDrop() {
  while (!collide(board, currentPiece)) {
    currentPiece.y++;
  }
  currentPiece.y--;
  merge(board, currentPiece);
  clearLines();
  spawnPiece();
  dropCounter = 0;
}

function clearLines() {
  let linesCleared = 0;
  outer: for (let y = ROWS - 1; y >= 0; --y) {
    for (let x = 0; x < COLS; ++x) {
      if (board[y][x] === 0) {
        continue outer;
      }
    }
    const row = board.splice(y, 1)[0].fill(0);
    board.unshift(row);
    ++linesCleared;
    ++y;
  }

  if (linesCleared > 0) {
    lines += linesCleared;
    score += linesCleared * 100 * level;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(150, 800 - (level - 1) * 60);

    linesEl.innerText = lines;
    scoreEl.innerText = score;
    levelEl.innerText = level;
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val !== 0) {
        ctx.fillStyle = COLORS[val];
        ctx.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
      }
    });
  });
}

function draw() {
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle grid
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += BLOCK_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += BLOCK_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  drawMatrix(board, { x: 0, y: 0 });
  if (currentPiece) {
    drawMatrix(currentPiece.matrix, currentPiece);
  }
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  if (!isPaused && !isGameOver) {
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
      playerDrop();
    }
  }

  draw();
  requestAnimationFrame(update);
}

window.addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault();
  }
  if (isGameOver) return;

  if (e.key === 'ArrowLeft' || e.key === 'a') playerMove(-1);
  else if (e.key === 'ArrowRight' || e.key === 'd') playerMove(1);
  else if (e.key === 'ArrowDown' || e.key === 's') playerDrop();
  else if (e.key === 'ArrowUp' || e.key === 'w') playerRotate();
  else if (e.key === ' ') playerHardDrop();
  else if (e.key === 'p' || e.key === 'P') {
    isPaused = !isPaused;
    pauseBtn.innerText = isPaused ? 'RESUME' : 'PAUSE';
  }
});

// Mobile button listeners
document.getElementById('m-left').addEventListener('click', () => playerMove(-1));
document.getElementById('m-right').addEventListener('click', () => playerMove(1));
document.getElementById('m-down').addEventListener('click', () => playerDrop());
document.getElementById('m-rotate').addEventListener('click', () => playerRotate());
document.getElementById('m-drop').addEventListener('click', () => playerHardDrop());

pauseBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  pauseBtn.innerText = isPaused ? 'RESUME' : 'PAUSE';
});

restartBtn.addEventListener('click', resetGame);

resetGame();
update();
