
const board = document.getElementById("board");
const numPlayersSelect = document.getElementById("numPlayers");
const playerNamesDiv = document.getElementById("player-names");
const gameBoard = document.getElementById("game-board");
const turnInfo = document.getElementById("turn-info");
const diceResult = document.getElementById("dice-result");
const challengeDiv = document.getElementById("challenge");

let players = [];
let currentPlayer = 0;
let positions = [];
let retos = [
  "Imita un animal durante 10 segundos.",
  "Cuenta una anécdota vergonzosa.",
  "Haz un cumplido picante a alguien.",
  "Baila sin música durante 15 segundos.",
  "Haz una risa falsa hasta que alguien más se ría.",
  "Di un trabalenguas sin equivocarte.",
  "Intercambia asiento con quien quieras.",
  "Haz una declaración de amor a una botella.",
  "Saca una historia ridícula inventada ahora mismo.",
  "Pide perdón al aire por algo absurdo."
];

for (let i = 2; i <= 6; i++) {
  const opt = document.createElement("option");
  opt.value = i;
  opt.innerText = i;
  numPlayersSelect.appendChild(opt);
}

numPlayersSelect.value = 2;
numPlayersSelect.addEventListener("change", () => {
  updateNameInputs();
});

function updateNameInputs() {
  playerNamesDiv.innerHTML = "";
  const num = parseInt(numPlayersSelect.value);
  for (let i = 0; i < num; i++) {
    const input = document.createElement("input");
    input.placeholder = "Jugador " + (i + 1);
    playerNamesDiv.appendChild(input);
    playerNamesDiv.appendChild(document.createElement("br"));
  }
}

function startGame() {
  const inputs = playerNamesDiv.querySelectorAll("input");
  players = Array.from(inputs).map(input => input.value || "Jugador");
  positions = new Array(players.length).fill(1);
  document.getElementById("player-setup").classList.add("hidden");
  gameBoard.classList.remove("hidden");
  drawBoard();
  updateTurnInfo();
}

function drawBoard() {
  board.innerHTML = "";
  for (let i = 100; i >= 1; i--) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.innerText = i;
    board.appendChild(cell);
  }
  updatePlayerPositions();
}

function updatePlayerPositions() {
  const cells = board.querySelectorAll(".cell");
  players.forEach((name, idx) => {
    const pos = positions[idx];
    const cellIndex = 100 - pos;
    const marker = document.createElement("div");
    marker.className = "player";
    marker.innerText = name[0];
    cells[cellIndex].appendChild(marker);
  });
}

function updateTurnInfo() {
  turnInfo.innerText = "Turno de " + players[currentPlayer];
}

function rollDice() {
  const roll = Math.floor(Math.random() * 6) + 1;
  diceResult.innerText = "Has sacado un " + roll;
  positions[currentPlayer] += roll;
  if (positions[currentPlayer] > 100) positions[currentPlayer] = 100;

  // Escaleras
  if (positions[currentPlayer] === 3) positions[currentPlayer] = 22;
  if (positions[currentPlayer] === 5) positions[currentPlayer] = 8;
  if (positions[currentPlayer] === 11) positions[currentPlayer] = 26;
  if (positions[currentPlayer] === 20) positions[currentPlayer] = 29;

  // Serpientes
  if (positions[currentPlayer] === 27) positions[currentPlayer] = 1;
  if (positions[currentPlayer] === 21) positions[currentPlayer] = 9;
  if (positions[currentPlayer] === 17) positions[currentPlayer] = 4;

  drawBoard();
  showChallenge(positions[currentPlayer]);

  if (positions[currentPlayer] === 100) {
    alert(players[currentPlayer] + " ha ganado 🎉");
    return;
  }

  currentPlayer = (currentPlayer + 1) % players.length;
  updateTurnInfo();
}

function showChallenge(pos) {
  const reto = retos[pos % retos.length];
  challengeDiv.classList.remove("hidden");
  challengeDiv.innerText = "Casilla " + pos + ": " + reto;
  setTimeout(() => {
    challengeDiv.classList.add("hidden");
  }, 5000);
}

updateNameInputs();
