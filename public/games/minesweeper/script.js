const gridEl = document.getElementById('grid');
const mineCountEl = document.getElementById('mine-count');
const timerEl = document.getElementById('timer');
const faceBtn = document.getElementById('face-btn');
const flagModeBtn = document.getElementById('flag-mode-btn');

const ROWS = 9;
const COLS = 9;
const MINES = 10;

let board = [];
let minesLeft = MINES;
let timer = 0;
let timerInterval = null;
let isGameOver = false;
let flagMode = false;
let firstClick = true;

function init() {
  clearInterval(timerInterval);
  timer = 0;
  timerInterval = null;
  timerEl.innerText = '000';
  isGameOver = false;
  firstClick = true;
  minesLeft = MINES;
  mineCountEl.innerText = String(minesLeft).padStart(3, '0');
  faceBtn.innerText = '🙂';

  board = [];
  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      board[r][c] = {
        r,
        c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      };
    }
  }

  renderBoard();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer = Math.min(999, timer + 1);
    timerEl.innerText = String(timer).padStart(3, '0');
  }, 1000);
}

function plantMines(firstR, firstC) {
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    // Don't place on first click or neighbors
    if (Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1) continue;
    if (!board[r][c].isMine) {
      board[r][c].isMine = true;
      placed++;
    }
  }

  // Calculate numbers
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            if (board[nr][nc].isMine) count++;
          }
        }
      }
      board[r][c].neighborMines = count;
    }
  }
}

function renderBoard() {
  gridEl.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cellData = board[r][c];
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;

      if (cellData.isRevealed) {
        cell.classList.add('revealed');
        if (cellData.isMine) {
          cell.classList.add('mine');
          cell.innerText = '💣';
        } else if (cellData.neighborMines > 0) {
          cell.classList.add(`c${cellData.neighborMines}`);
          cell.innerText = cellData.neighborMines;
        }
      } else if (cellData.isFlagged) {
        cell.innerText = '🚩';
      }

      cell.addEventListener('click', () => handleClick(r, c));
      cell.addEventListener('contextmenu', e => {
        e.preventDefault();
        handleRightClick(r, c);
      });

      gridEl.appendChild(cell);
    }
  }
}

function handleClick(r, c) {
  if (isGameOver) return;
  if (flagMode) {
    handleRightClick(r, c);
    return;
  }

  const cell = board[r][c];
  if (cell.isFlagged || cell.isRevealed) return;

  if (firstClick) {
    firstClick = false;
    plantMines(r, c);
    startTimer();
  }

  if (cell.isMine) {
    // Game Over
    revealAllMines();
    isGameOver = true;
    clearInterval(timerInterval);
    faceBtn.innerText = '😵';
    renderBoard();
    return;
  }

  revealCell(r, c);
  checkWin();
  renderBoard();
}

function handleRightClick(r, c) {
  if (isGameOver || firstClick) return;
  const cell = board[r][c];
  if (cell.isRevealed) return;

  cell.isFlagged = !cell.isFlagged;
  minesLeft += cell.isFlagged ? -1 : 1;
  mineCountEl.innerText = String(minesLeft).padStart(3, '0');
  renderBoard();
}

function revealCell(r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
  const cell = board[r][c];
  if (cell.isRevealed || cell.isFlagged) return;

  cell.isRevealed = true;

  if (cell.neighborMines === 0 && !cell.isMine) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        revealCell(r + dr, c + dc);
      }
    }
  }
}

function revealAllMines() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].isMine) {
        board[r][c].isRevealed = true;
      }
    }
  }
}

function checkWin() {
  let unrevealedSafe = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c].isMine && !board[r][c].isRevealed) {
        unrevealedSafe++;
      }
    }
  }
  if (unrevealedSafe === 0) {
    isGameOver = true;
    clearInterval(timerInterval);
    faceBtn.innerText = '😎';
  }
}

flagModeBtn.addEventListener('click', () => {
  flagMode = !flagMode;
  flagModeBtn.classList.toggle('active', flagMode);
  flagModeBtn.innerText = `Flag Mode: ${flagMode ? 'ON 🚩' : 'OFF'}`;
});

faceBtn.addEventListener('click', init);

init();
