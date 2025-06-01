// Game state elements
const cells = document.querySelectorAll('[data-cell]');
const message = document.getElementById('game-message');
const restartBtn = document.getElementById('restart-button');
const xScoreDisplay = document.getElementById('x-score');
const oScoreDisplay = document.getElementById('o-score');
const clickSound = new Audio('sounds/click.mp3');
const winSound = new Audio('sounds/win.mp3');
const drawSound = new Audio('sounds/draw.mp3');


// Game mode/setup variables
let player1Name = "Player 1";
let player2Name = "Player 2";
let isVsAI = true;
let difficulty = "hard";
let human = 'X';
let ai = 'O';
let currentPlayer = 'X';

let board = Array(9).fill(null);
let xScore = 0;
let oScore = 0;
let gameActive = true;

// Game setup
document.getElementById("game-mode").addEventListener("change", (e) => {
  isVsAI = e.target.value === "vs-ai";
  document.getElementById("difficulty-options").style.display = isVsAI ? "block" : "none";
  document.getElementById("player2-name").placeholder = isVsAI ? "AI Name" : "Player 2 Name";
});

document.getElementById("start-game").addEventListener("click", () => {
  player1Name = document.getElementById("player1-name").value || "Player 1";
  player2Name = document.getElementById("player2-name").value || (isVsAI ? "AI" : "Player 2");
  difficulty = document.getElementById("ai-difficulty").value;

  document.querySelector(".setup-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";

  startGame();
});

restartBtn.addEventListener('click', startGame);

// Start game function
function startGame() {
  board.fill(null);
  gameActive = true;
  currentPlayer = 'X';
  message.textContent = `${player1Name} (X), your turn!`;

  cells.forEach((cell, index) => {
    cell.textContent = '';
    cell.classList.remove('x', 'o', 'win');
    cell.removeEventListener('click', handleClick);
    cell.addEventListener('click', handleClick, { once: true });
  });

  if (isVsAI && currentPlayer === ai) {
    setTimeout(() => makeAIMove(), 500);
  }
}

function handleClick(e) {
  const index = [...cells].indexOf(e.target);
  if (!gameActive || board[index]) return;

  makeMove(index, currentPlayer);
  if (checkWinner(board, currentPlayer)) {
    endGame(`${getPlayerName(currentPlayer)} wins!`);
    return;
  }

  if (isDraw(board)) {
    endGame("It's a Draw!");
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

  if (isVsAI && currentPlayer === ai) {
    setTimeout(() => makeAIMove(), 500);
  } else {
    message.textContent = `${getPlayerName(currentPlayer)} (${currentPlayer}), your turn!`;
  }
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add(player.toLowerCase());
  clickSound.play();  // Play click sound here
}

function getPlayerName(symbol) {
  return symbol === 'X' ? player1Name : player2Name;
}

function endGame(result) {
  message.textContent = result;
  if (result.includes("wins")) {
    if (result.includes("AI")) oScore++;
    else xScore++;
    winSound.play();   // Play win sound here
  } else if (result.includes("Draw")) {
    drawSound.play();  // Play draw sound here
  }
  xScoreDisplay.textContent = xScore;
  oScoreDisplay.textContent = oScore;
  cells.forEach(cell => cell.removeEventListener('click', handleMove));
}


function isDraw(b) {
  return b.every(cell => cell !== null);
}

function checkWinner(b, p) {
  const winCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return winCombos.some(combo => combo.every(i => b[i] === p));
}

// AI Move Logic
function makeAIMove() {
  if (!gameActive) return;

  let move;
  switch (difficulty) {
    case 'easy':
      move = getRandomMove();
      break;
    case 'medium':
      move = Math.random() < 0.5 ? getBestMove() : getRandomMove();
      break;
    case 'hard':
    default:
      move = getBestMove();
      break;
  }

  makeMove(move, ai);

  if (checkWinner(board, ai)) {
    endGame(`${player2Name} wins!`);
  } else if (isDraw(board)) {
    endGame("It's a Draw!");
  } else {
    currentPlayer = human;
    message.textContent = `${player1Name} (${human}), your turn!`;
  }
}

function getRandomMove() {
  const empty = board.map((val, i) => val === null ? i : null).filter(i => i !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getBestMove() {
  let bestScore = -Infinity;
  let move;
  board.forEach((_, i) => {
    if (board[i] === null) {
      board[i] = ai;
      let score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  });
  return move;
}

function minimax(b, depth, isMaximizing) {
  if (checkWinner(b, ai)) return 10 - depth;
  if (checkWinner(b, human)) return depth - 10;
  if (isDraw(b)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i] === null) {
        b[i] = ai;
        best = Math.max(best, minimax(b, depth + 1, false));
        b[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i] === null) {
        b[i] = human;
        best = Math.min(best, minimax(b, depth + 1, true));
        b[i] = null;
      }
    }
    return best;
  }
}


function handleMove(index) {
  if (board[index] !== null) return;
  makeMove(index, human);
  let winCombo = checkWinner(board, human);
  if (winCombo) return endGame(`${getPlayerName()} wins!`, winCombo);
  if (isDraw(board)) return endGame("It's a Draw!");
  const aiMove = getBestMove();
  makeMove(aiMove, ai);
  winCombo = checkWinner(board, ai);
  if (winCombo) return endGame("AI wins!", winCombo);
  if (isDraw(board)) return endGame("It's a Draw!");
}

function endGame(result, winCombo = []) {
  message.textContent = result;
  if (result.includes("wins")) {
    if (result.includes("AI")) oScore++;
    else xScore++;
    winSound.play();
    // Highlight winning cells
    winCombo.forEach(i => cells[i].classList.add('win'));
  } else if (result.includes("Draw")) {
    drawSound.play();
  }
  xScoreDisplay.textContent = xScore;
  oScoreDisplay.textContent = oScore;
  cells.forEach(cell => cell.removeEventListener('click', handleMove));
}
