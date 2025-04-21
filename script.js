
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

const escaleras = {
  3: 22,
  5: 8,
  11: 26,
  20: 29
};

const serpientes = {
  27: 1,
  21: 9,
  17: 4
};

for (let i = 2; i <= 6; i++) {
  const opt = document.createElement("option");
  opt.value = i;
  opt.innerText = i;
  numPlayersSelect.appendChild(opt);
}

numPlayersSelect.value = 2;
numPlayersSelect.addEventListener("change", updateNameInputs);

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

    // Dibujar escaleras
    if (escaleras[i]) {
      const span = document.createElement("span");
      span.innerText = "⬆";
      span.style.color = "green";
      cell.appendChild(span);
    }

    // Dibujar serpientes
    if (Object.values(serpientes).includes(i)) {
      const span = document.createElement("span");
      span.innerText = "⬇";
      span.style.color = "red";
      cell.appendChild(span);
    }

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


const diceAudio = new Audio("dice.mp3");

function rollDice() {
  diceAudio.play();

  // Añadir animación visual
  diceResult.classList.remove("roll-animation");
  void diceResult.offsetWidth; // Truco para reiniciar animación
  diceResult.classList.add("roll-animation");

  diceResult.innerText = "Tirando...";
  let roll = 1;
  let count = 0;
  const interval = setInterval(() => {
    roll = Math.floor(Math.random() * 6) + 1;
    diceResult.innerText = "🎲 " + roll;
    count++;
    if (count > 10) {
      clearInterval(interval);
      finalizeRoll(roll);
    }
  }, 100);
}


function finalizeRoll(roll) {
  positions[currentPlayer] += roll;
  if (positions[currentPlayer] > 100) positions[currentPlayer] = 100;

  if (escaleras[positions[currentPlayer]]) {
    positions[currentPlayer] = escaleras[positions[currentPlayer]];
  } else if (serpientes[positions[currentPlayer]]) {
    positions[currentPlayer] = serpientes[positions[currentPlayer]];
  }

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
