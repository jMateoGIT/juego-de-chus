const emojiOptions = ["😀", "😎", "🐸", "🐱", "👻", "🤖", "🍕", "🚀", "🌈", "🧃", "🔥", "💀"];
const board = document.getElementById("board");
const numPlayersSelect = document.getElementById("numPlayers");
const playerNamesDiv = document.getElementById("player-names");
const gameBoard = document.getElementById("game-board");
const turnInfo = document.getElementById("turn-info");
const diceResult = document.getElementById("dice-result");
const challengeDiv = document.getElementById("challenge");
const fichaColors = ["#ff5e5e", "#4caf50", "#2196f3", "#ff9800", "#9c27b0", "#795548"];

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
  20: 37,
  44: 56,
  68: 86
};

const serpientes = {
  13: 1,
  43: 21,
  65: 47,
  89: 70
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
    const nameInput = document.createElement("input");
    nameInput.placeholder = "Nombre Jugador " + (i + 1);
    nameInput.classList.add("name-input");
    
    const emojiSelect = document.createElement("select");
    emojiSelect.classList.add("emoji-input");

    emojiOptions.forEach(emoji => {
      const option = document.createElement("option");
      option.value = emoji;
      option.textContent = emoji;
      emojiSelect.appendChild(option);
    });

    
    playerNamesDiv.appendChild(nameInput);
    playerNamesDiv.appendChild(emojiSelect);
    playerNamesDiv.appendChild(document.createElement("br"));
  }
}

function startGame() {
  const inputs = playerNamesDiv.querySelectorAll("input");
  const nameInputs = playerNamesDiv.querySelectorAll(".name-input");
  const emojiInputs = playerNamesDiv.querySelectorAll(".emoji-input");

  players = Array.from(nameInputs).map((input, idx) => {
    const name = input.value || "Jugador";
    const emoji = emojiInputs[idx].value || "🙂";
    const color = fichaColors[idx % fichaColors.length]; // asigna un color por jugador
    return { name, emoji, color };
  });
  
  positions = new Array(players.length).fill(1);
  document.getElementById("player-setup").classList.add("hidden");
  gameBoard.classList.remove("hidden");
  drawBoard();
  setTimeout(() => {
    updateTurnInfo();
  }, 0);
}

function drawSnakeHead(svg, x, y, angle, color = 'red') {
  const ns = "http://www.w3.org/2000/svg";

  const group = document.createElementNS(ns, "g");

  // Primero rotamos, luego trasladamos (orden importante)
  group.setAttribute("transform", `translate(${x}, ${y}) rotate(${angle})`);
  group.setAttribute("style", "pointer-events: none");

  // Cabeza
  const head = document.createElementNS(ns, "ellipse");
  head.setAttribute("cx", 0);
  head.setAttribute("cy", 0);
  head.setAttribute("rx", 8);
  head.setAttribute("ry", 6);
  head.setAttribute("fill", color);
  group.appendChild(head);

  // Ojos
  const eye1 = document.createElementNS(ns, "circle");
  eye1.setAttribute("cx", -3);
  eye1.setAttribute("cy", -2);
  eye1.setAttribute("r", 1.5);
  eye1.setAttribute("fill", "white");
  group.appendChild(eye1);

  const eye2 = document.createElementNS(ns, "circle");
  eye2.setAttribute("cx", 3);
  eye2.setAttribute("cy", -2);
  eye2.setAttribute("r", 1.5);
  eye2.setAttribute("fill", "white");
  group.appendChild(eye2);

  // Lengua
  const tongue = document.createElementNS(ns, "path");
  tongue.setAttribute("d", "M 0 5 L -2 12 M 0 5 L 2 12");
  tongue.setAttribute("stroke", "black");
  tongue.setAttribute("stroke-width", "1");
  group.appendChild(tongue);

  svg.appendChild(group);
}

function drawLine(svg, start, end, color, isCurved) {
  const ns = "http://www.w3.org/2000/svg";
  const path = document.createElementNS(ns, "path");

  if (isCurved) {
    // Más ondulación tipo serpiente 🐍
    const segments = 4;
    const dx = (end.x - start.x) / segments;
    const dy = (end.y - start.y) / segments;
    let d = `M ${start.x} ${start.y}`;
    
    for (let i = 1; i <= segments; i++) {
      const x = start.x + dx * i;
      const y = start.y + dy * i;

      // Alternar control points arriba/abajo para ondulación
      const controlX = start.x + dx * (i - 0.5);
      const controlY = start.y + dy * (i - 0.5) + (i % 2 === 0 ? -30 : 30);

      d += ` Q ${controlX} ${controlY}, ${x} ${y}`;
    }

    path.setAttribute("d", d);
  } else {
    // Dibujar escalera con peldaños y montantes verticales 🪜
    const segments = 6;
    const dx = (end.x - start.x) / segments;
    const dy = (end.y - start.y) / segments;
  
    const peldaños = [];
  
    for (let i = 0; i <= segments; i++) {
      // Base de cada peldaño
      const baseX = start.x + dx * i;
      const baseY = start.y + dy * i;
  
      // Peldaño horizontal perpendicular al vector de escalera
      const offset = 8; // longitud del peldaño
      const angle = Math.atan2(dy, dx) + Math.PI / 2;
      const x1 = baseX + Math.cos(angle) * offset;
      const y1 = baseY + Math.sin(angle) * offset;
      const x2 = baseX - Math.cos(angle) * offset;
      const y2 = baseY - Math.sin(angle) * offset;
  
      peldaños.push({ x1, y1, x2, y2 });
  
      // Dibujar peldaño
      const step = document.createElementNS(ns, "line");
      step.setAttribute("x1", x1);
      step.setAttribute("y1", y1);
      step.setAttribute("x2", x2);
      step.setAttribute("y2", y2);
      step.setAttribute("stroke", color);
      step.setAttribute("stroke-width", "3");
      step.setAttribute("stroke-linecap", "round");
      svg.appendChild(step);
    }
  
    // Dibujar montantes verticales conectando extremos de los peldaños
    const posteIzquierdo = document.createElementNS(ns, "path");
    const posteDerecho = document.createElementNS(ns, "path");
  
    // Vector del trayecto (normalizado)
    const dirX = dx / Math.hypot(dx, dy);
    const dirY = dy / Math.hypot(dx, dy);

    // Añadir margen visual (hacia atrás y adelante)
    const extension = 10;

    const startLeftX = peldaños[0].x1 - dirX * extension;
    const startLeftY = peldaños[0].y1 - dirY * extension;
    const endLeftX = peldaños[peldaños.length - 1].x1 + dirX * extension;
    const endLeftY = peldaños[peldaños.length - 1].y1 + dirY * extension;

    const startRightX = peldaños[0].x2 - dirX * extension;
    const startRightY = peldaños[0].y2 - dirY * extension;
    const endRightX = peldaños[peldaños.length - 1].x2 + dirX * extension;
    const endRightY = peldaños[peldaños.length - 1].y2 + dirY * extension;

    const dIzq = `M ${startLeftX} ${startLeftY} L ${endLeftX} ${endLeftY}`;
    const dDer = `M ${startRightX} ${startRightY} L ${endRightX} ${endRightY}`;
    
    posteIzquierdo.setAttribute("d", dIzq);
    posteDerecho.setAttribute("d", dDer);
  
    [posteIzquierdo, posteDerecho].forEach(poste => {
      poste.setAttribute("stroke", color);
      poste.setAttribute("stroke-width", "3");
      poste.setAttribute("fill", "none");
      svg.appendChild(poste);
    });
  }
  

  path.setAttribute("stroke", color);
  path.setAttribute("stroke-width", "3");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-dasharray", isCurved ? "none" : "6,4");

  svg.appendChild(path); // ⬅ PRIMERO insertamos la línea

  // Dibujar cabeza si es serpiente
  if (isCurved) {
    const segments = 4;
    const dx = (end.x - start.x) / segments;
    const dy = (end.y - start.y) / segments;
    const lastX = start.x + dx * segments;
    const lastY = start.y + dy * segments;
    const prevX = start.x + dx * (segments - 1);
    const prevY = start.y + dy * (segments - 1);
    const angle = Math.atan2(lastY - prevY, lastX - prevX) * (180 / Math.PI) - 90;

    drawSnakeHead(svg, lastX, lastY, angle, color); // ⬅ LUEGO insertamos la cabeza
  }
}


function drawConnections() {
  const svg = document.getElementById("board-svg");
  svg.innerHTML = ""; // limpia anteriores

  const cells = board.querySelectorAll(".cell");

  // Posición de cada celda en la pantalla
  const getCoords = (pos) => {
    const index = 100 - pos; // posición inversa
    const cell = cells[index];
    const rect = cell.getBoundingClientRect();
    const containerRect = board.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top + rect.height / 2 - containerRect.top
    };
  };

  // Dibujar escaleras
  for (const [from, to] of Object.entries(escaleras)) {
    const start = getCoords(parseInt(from));
    const end = getCoords(to);
    drawLine(svg, start, end, "#8B5E3C", false); // recta
  }

  // Dibujar serpientes
  for (const [from, to] of Object.entries(serpientes)) {
    const start = getCoords(parseInt(from));
    const end = getCoords(to);
    drawLine(svg, start, end, "red", true); // curva
  }
}

// Inicializar el tablero
function drawBoard() {
  board.innerHTML = "";
  for (let i = 100; i >= 1; i--) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.innerText = i;

    // Dibujar escaleras
    if (escaleras[i]) {
      const icon = document.createElement("div");
      icon.className = "ladder-icon";
      icon.innerText = "🪜";
      cell.appendChild(icon);
    }
    // Dibujar serpientes
    if (Object.values(serpientes).includes(i)) {
      const icon = document.createElement("div");
      icon.className = "snake-icon";
      icon.innerText = "🐍";
      cell.appendChild(icon);
    }
    

    board.appendChild(cell);
  }
  updatePlayerPositions();
  drawConnections();
}

// Animación de movimiento de jugador
function movePlayerAnimated(idx, fromPos, toPos, callback) {
  const boardRect = board.getBoundingClientRect();
  const cells = board.querySelectorAll(".cell");

  const fromCell = cells[100 - fromPos];
  const toCell = cells[100 - toPos];

  const fromRect = fromCell.getBoundingClientRect();
  const toRect = toCell.getBoundingClientRect();

  const player = document.createElement("div");
  player.className = "player";
  player.innerText = players[idx].emoji;
  player.style.setProperty("--color", players[idx].color);
  player.title = players[idx].name;

  board.appendChild(player);

  // Posición inicial absoluta relativa al board
  const startX = fromRect.left - boardRect.left + fromRect.width / 2 - 12;
  const startY = fromRect.top - boardRect.top + fromRect.height / 2 - 12;

  const endX = toRect.left - boardRect.left + toRect.width / 2 - 12;
  const endY = toRect.top - boardRect.top + toRect.height / 2 - 12;

  player.style.transform = `translate(${startX}px, ${startY}px)`;

  requestAnimationFrame(() => {
    player.style.transform = `translate(${endX}px, ${endY}px)`;
  });

  // Eliminar marcador anterior y agregar fijo después de animar
  setTimeout(() => {
    player.remove();
    drawBoard(); // o solo updatePlayerPositions()
    if (callback) callback();
  }, 400);
}

// Actualizar posiciones de los jugadores en el tablero
function updatePlayerPositions() {
  const cells = board.querySelectorAll(".cell");

  // Limpiar jugadores actuales
  cells.forEach(cell => {
    cell.querySelectorAll(".player").forEach(p => p.remove());
  });

  // Agrupar jugadores por posición
  const posMap = {};
  players.forEach((player, idx) => {
    const pos = positions[idx];
    if (!posMap[pos]) posMap[pos] = [];
    posMap[pos].push(idx);
  });

  // Dibujar fichas en la celda correspondiente
  Object.keys(posMap).forEach(pos => {
    const playerIndices = posMap[pos];
    const cellIndex = 100 - pos;
    const cell = cells[cellIndex];

    playerIndices.forEach((idx, i) => {
      const marker = document.createElement("div");
      marker.className = "player corner-" + (i % 4);
      marker.innerText = players[idx].emoji;
      marker.style.backgroundColor = players[idx].color;
      marker.dataset.tooltip = players[idx].name;

      cell.appendChild(marker);
    });
  });
}


function updateTurnInfo() {
  turnInfo.innerText = "Turno de " + players[currentPlayer].name;
}


const diceAudio = new Audio("dice.mp3");
const escaleraAudio = new Audio("escalera.mp3");
const serpienteAudio = new Audio("serpiente.mp3");

function rollDice() {
  challengeDiv.classList.add("hidden"); // Ocultar reto anterior
  diceAudio.play();
  const diceVisual = document.getElementById("dice-visual");

  // Reiniciar animación
  diceVisual.classList.remove("roll-animation");
  void diceVisual.offsetWidth; // fuerza el reflow
  diceVisual.classList.add("roll-animation");

  diceResult.innerText = "Tirando...";
  let roll = 1;
  let count = 0;

  const interval = setInterval(() => {
    roll = Math.floor(Math.random() * 6) + 1;
    count++;
    if (count > 10) {
      clearInterval(interval);
      diceResult.innerText = `🎲 Resultado: ${roll}`;
      finalizeRoll(roll);
    }
  }, 100);
}


function finalizeRoll(roll) {
  const from = positions[currentPlayer];
  let to = positions[currentPlayer] + roll;

  if (to > 100) to = 100;

  animatePlayerMove(currentPlayer, from, to, () => {
    positions[currentPlayer] = to;

    // Ver si hay escalera o serpiente después de moverse
    const afterEffect = escaleras[to] || serpientes[to];

    if (afterEffect) {
      // 🎵 Sonido según tipo
      if (escaleras[to]) escaleraAudio.play();
      else if (serpientes[to]) serpienteAudio.play();
    
      animatePlayerMove(currentPlayer, to, afterEffect, () => {
        positions[currentPlayer] = afterEffect;
        finishTurn(afterEffect);
      });
    } else {
      finishTurn(to);
    }
  });
}

function finishTurn(pos) {
  showChallenge(pos);

  if (pos === 100) {
    alert(players[currentPlayer] + " ha ganado 🎉");
    return;
  }

  currentPlayer = (currentPlayer + 1) % players.length;
  updateTurnInfo();
}

function animatePlayerMove(idx, fromPos, toPos, callback) {
  const boardRect = board.getBoundingClientRect();
  const cells = board.querySelectorAll(".cell");

  const fromCell = cells[100 - fromPos];
  const toCell = cells[100 - toPos];

  const fromRect = fromCell.getBoundingClientRect();
  const toRect = toCell.getBoundingClientRect();

  const outer = document.createElement("div");
  outer.className = "player";
  outer.style.setProperty("--color", players[idx].color);
  outer.title = players[idx].name;

  const inner = document.createElement("div");
  inner.className = "bounce-inner";
  inner.innerText = players[idx].emoji;

  outer.appendChild(inner);
  board.appendChild(outer);

  // Eliminar la ficha estática de la celda original (si existe)
  fromCell.querySelectorAll(".player").forEach(el => el.remove());

  const startX = fromRect.left - boardRect.left + fromRect.width / 2 - 12;
  const startY = fromRect.top - boardRect.top + fromRect.height / 2 - 12;

  const endX = toRect.left - boardRect.left + toRect.width / 2 - 12;
  const endY = toRect.top - boardRect.top + toRect.height / 2 - 12;

  outer.style.transform = `translate(${startX}px, ${startY}px)`;

  requestAnimationFrame(() => {
    outer.style.transform = `translate(${endX}px, ${endY}px)`;
  });

  setTimeout(() => {
    inner.classList.add("bounce");

    setTimeout(() => {
      outer.remove();

      // ✅ Asegúrate de que la posición esté actualizada antes de redibujar
      positions[idx] = toPos;
      
      updatePlayerPositions();
      if (callback) callback();
         
    }, 500); // después del bounce
  }, 400); // después del movimiento
}



function showChallenge(pos) {
  const reto = retos[pos % retos.length];
  challengeDiv.classList.remove("hidden");
  challengeDiv.innerText = "Casilla " + pos + ": " + reto;
}

updateNameInputs();