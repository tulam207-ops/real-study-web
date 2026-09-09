const gridEl = document.getElementById('grid');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const overlayEl = document.getElementById('game-over-overlay');
const newGameBtn = document.getElementById('new-game-btn');
const retryBtn = document.getElementById('retry-btn');

let board = [];
let score = 0;
let bestScore = localStorage.getItem('2048_best_score') || 0;
bestEl.innerText = bestScore;

function init() {
  board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
  score = 0;
  scoreEl.innerText = score;
  overlayEl.classList.add('hidden');
  addRandomTile();
  addRandomTile();
  render();
}

function addRandomTile() {
  const emptyCells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) emptyCells.push({ r, c });
    }
  }
  if (emptyCells.length > 0) {
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
  }
}

function render() {
  gridEl.innerHTML = '';
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = board[r][c];
      const cell = document.createElement('div');
      cell.className = 'tile' + (val > 0 ? ` tile-${val}` : '');
      cell.innerText = val > 0 ? val : '';
      gridEl.appendChild(cell);
    }
  }
}

function slide(row) {
  let arr = row.filter(val => val !== 0);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      arr.splice(i + 1, 1);
    }
  }
  while (arr.length < 4) {
    arr.push(0);
  }
  return arr;
}

function moveLeft() {
  let changed = false;
  for (let r = 0; r < 4; r++) {
    const oldRow = [...board[r]];
    const newRow = slide(board[r]);
    board[r] = newRow;
    if (oldRow.some((val, idx) => val !== newRow[idx])) changed = true;
  }
  return changed;
}

function rotateBoard() {
  const newBoard = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      newBoard[c][3 - r] = board[r][c];
    }
  }
  board = newBoard;
}

function move(direction) {
  let changed = false;
  if (direction === 'left') {
    changed = moveLeft();
  } else if (direction === 'down') {
    rotateBoard();
    changed = moveLeft();
    rotateBoard();
    rotateBoard();
    rotateBoard();
  } else if (direction === 'right') {
    rotateBoard();
    rotateBoard();
    changed = moveLeft();
    rotateBoard();
    rotateBoard();
  } else if (direction === 'up') {
    rotateBoard();
    rotateBoard();
    rotateBoard();
    changed = moveLeft();
    rotateBoard();
  }

  if (changed) {
    scoreEl.innerText = score;
    if (score > bestScore) {
      bestScore = score;
      bestEl.innerText = bestScore;
      localStorage.setItem('2048_best_score', bestScore);
    }
    addRandomTile();
    render();
    if (checkGameOver()) {
      overlayEl.classList.remove('hidden');
    }
  }
}

function checkGameOver() {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return false;
      if (c < 3 && board[r][c] === board[r][c + 1]) return false;
      if (r < 3 && board[r][c] === board[r + 1][c]) return false;
    }
  }
  return true;
}

window.addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
  switch (e.key) {
    case 'ArrowLeft':
    case 'a':
    case 'A':
      move('left');
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      move('right');
      break;
    case 'ArrowUp':
    case 'w':
    case 'W':
      move('up');
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      move('down');
      break;
  }
});

// Touch swipe support
let touchStartX = 0;
let touchStartY = 0;

window.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (Math.abs(dx) > 30) {
      move(dx > 0 ? 'right' : 'left');
    }
  } else {
    if (Math.abs(dy) > 30) {
      move(dy > 0 ? 'down' : 'up');
    }
  }
}, { passive: true });

newGameBtn.addEventListener('click', init);
retryBtn.addEventListener('click', init);

init();
