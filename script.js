/* ================================
   Actividad 17 — p5.js (Ta-Te-Tí + Paddle 3D)
   ================================ */

let gameMode = 'tictactoe'; // 'tictactoe' | 'paddle'
let canvas;

const ui = {
  select: null,
  reset: null,
  statusText: null,
  scoreText: null,
};

function setup() {
  // Inicialmente creamos un canvas 2D para Ta-Te-Tí y luego podemos recrearlo para WEBGL
  canvas = createCanvas(540, 540); // tamaño cómodo para 3x3 de 180px
  canvas.parent('canvas-holder');
  textFont('system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Helvetica Neue, Arial');

  cacheUI();
  initTicTacToe();
  initPaddle(); // pre-inicializamos para tener valores listos

  updateStatus('Listo. Elegí un juego o empezá a jugar.');
  drawFns = { tictactoe: drawTicTacToe, paddle: drawPaddle };
}

function cacheUI() {
  ui.select = document.getElementById('gameSelect');
  ui.reset = document.getElementById('resetBtn');
  ui.statusText = document.getElementById('statusText');
  ui.scoreText = document.getElementById('scoreText');

  ui.select.addEventListener('change', (e) => switchGame(e.target.value));
  ui.reset.addEventListener('click', () => resetGame());
}

function switchGame(mode) {
  gameMode = mode;
  if (gameMode === 'paddle') {
    // recreamos canvas con WEBGL
    remove();
    canvas = createCanvas(800, 420, WEBGL);
    canvas.parent('canvas-holder');
    updateStatus('Paddle 3D — W/S (P1) y ↑/↓ (P2).');
  } else {
    // volver a 2D
    remove();
    canvas = createCanvas(540, 540);
    canvas.parent('canvas-holder');
    updateStatus('Ta-Te-Tí — clic para jugar.');
  }
  resetGame();
}

function resetGame() {
  if (gameMode === 'tictactoe') {
    initTicTacToe();
  } else {
    initPaddle(true);
  }
}

/* --------- Estado y utilidades UI ---------- */
function updateStatus(msg) {
  ui.statusText.textContent = msg;
}
function updateScore() {
  ui.scoreText.textContent = `P1: ${paddle.score1} — P2: ${paddle.score2}`;
}

/* ===========================
   Ta-Te-Tí (2D)
   =========================== */
let ttt;

function initTicTacToe() {
  // 0 vacío, 1 X, 2 O
  ttt = {
    board: Array.from({ length: 3 }, () => [0, 0, 0]),
    xTurn: true,
    ended: false,
    cellSize: width / 3
  };
}

function mousePressed() {
  if (gameMode !== 'tictactoe') return;

  if (ttt.ended) return;
  const i = floor(mouseX / ttt.cellSize);
  const j = floor(mouseY / ttt.cellSize);
  if (i < 0 || i > 2 || j < 0 || j > 2) return;

  if (ttt.board[i][j] === 0) {
    ttt.board[i][j] = ttt.xTurn ? 1 : 2;
    ttt.xTurn = !ttt.xTurn;
    const winner = checkWinner();
    if (winner === 1) {
      updateStatus('Ganó X 🎉 — Reiniciá para jugar de nuevo.');
      ttt.ended = true;
    } else if (winner === 2) {
      updateStatus('Ganó O 🎉 — Reiniciá para jugar de nuevo.');
      ttt.ended = true;
    } else if (winner === 3) {
      updateStatus('Empate 🤝 — Reiniciá para jugar de nuevo.');
      ttt.ended = true;
    } else {
      updateStatus(`Turno de ${ttt.xTurn ? 'X' : 'O'}.`);
    }
  }
}

function checkWinner() {
  const b = ttt.board;
  // filas/columnas
  for (let i = 0; i < 3; i++) {
    if (b[i][0] && b[i][0] === b[i][1] && b[i][1] === b[i][2]) return b[i][0];
    if (b[0][i] && b[0][i] === b[1][i] && b[1][i] === b[2][i]) return b[0][i];
  }
  // diagonales
  if (b[0][0] && b[0][0] === b[1][1] && b[1][1] === b[2][2]) return b[0][0];
  if (b[2][0] && b[2][0] === b[1][1] && b[1][1] === b[0][2]) return b[2][0];

  // empate
  let filled = 0;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (b[i][j]) filled++;
  if (filled === 9) return 3; // empate

  return 0; // sigue
}

function drawBoard() {
  stroke(255); strokeWeight(4);
  const s = ttt.cellSize;
  // líneas verticales
  line(s, 0, s, height);
  line(2 * s, 0, 2 * s, height);
  // líneas horizontales
  line(0, s, width, s);
  line(0, 2 * s, width, 2 * s);

  // piezas
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const cx = i * s + s / 2;
      const cy = j * s + s / 2;
      if (ttt.board[i][j] === 1) drawX(cx, cy, s * 0.6);
      if (ttt.board[i][j] === 2) drawO(cx, cy, s * 0.6);
    }
  }
}

function drawX(cx, cy, size) {
  const d = size / 2;
  stroke('#8bf0c8'); strokeWeight(10); line(cx - d, cy - d, cx + d, cy + d);
  line(cx - d, cy + d, cx + d, cy - d);
}
function drawO(cx, cy, size) {
  noFill(); stroke('#6ea8ff'); strokeWeight(10);
  circle(cx, cy, size);
}

function drawTicTacToe() {
  background(15, 18, 32);
  drawBoard();
}

/* ===========================
   Paddle 3D (WEBGL)
   =========================== */
let paddle;

function initPaddle(full = false) {
  paddle = {
    ballPos: createVector(0, 0, 0),
    ballVel: createVector(4, 3, 2),
    ballR: 10,
    p1: { y: 0, h: 90, w: 12, x: -width/2 + 30, speed: 6 },
    p2: { y: 0, h: 90, w: 12, x:  width/2 - 30, speed: 6 },
    score1: 0,
    score2: 0,
  };
  if (full) updateScore();
}

function keyPressed() {
  // nada aquí; se procesa en draw para permitir múltiples teclas presionadas
}

function drawPaddle() {
  background(7, 9, 18);
  // Luces suaves
  ambientLight(120);
  pointLight(180, 200, 255, 0, -200, 300);
  pointLight(170, 255, 210, 0, 200, -300);

  // Campo
  noStroke();
  push();
  rotateX(-PI/2.2);
  specularMaterial(30, 36, 70);
  box(760, 8, 340);
  pop();

  // Controles: P1 (W/S), P2 (UP/DOWN)
  if (keyIsDown(87)) paddle.p1.y -= paddle.p1.speed; // W
  if (keyIsDown(83)) paddle.p1.y += paddle.p1.speed; // S
  if (keyIsDown(UP_ARROW)) paddle.p2.y -= paddle.p2.speed;
  if (keyIsDown(DOWN_ARROW)) paddle.p2.y += paddle.p2.speed;

  // Limites verticales
  const maxY = 180 - paddle.p1.h/2;
  paddle.p1.y = constrain(paddle.p1.y, -maxY, maxY);
  paddle.p2.y = constrain(paddle.p2.y, -maxY, maxY);

  // Pelota
  paddle.ballPos.add(paddle.ballVel);

  // Rebotes en techo/suelo virtuales
  if (paddle.ballPos.y > 180 - paddle.ballR || paddle.ballPos.y < -180 + paddle.ballR) {
    paddle.ballVel.y *= -1;
  }
  // Profundidad Z suave
  if (paddle.ballPos.z > 150 - paddle.ballR || paddle.ballPos.z < -150 + paddle.ballR) {
    paddle.ballVel.z *= -1;
  }

  // Colisiones con paletas (X)
  // P1
  if (paddle.ballPos.x - paddle.ballR < paddle.p1.x + paddle.p1.w/2 &&
      abs(paddle.ballPos.y - paddle.p1.y) < paddle.p1.h/2 + paddle.ballR) {
    paddle.ballPos.x = paddle.p1.x + paddle.p1.w/2 + paddle.ballR;
    paddle.ballVel.x = abs(paddle.ballVel.x) * 1.03; // acelera leve
    // agrega un poco de efecto según la diferencia de Y
    paddle.ballVel.y += (paddle.ballPos.y - paddle.p1.y) * 0.02;
  }
  // P2
  if (paddle.ballPos.x + paddle.ballR > paddle.p2.x - paddle.p2.w/2 &&
      abs(paddle.ballPos.y - paddle.p2.y) < paddle.p2.h/2 + paddle.ballR) {
    paddle.ballPos.x = paddle.p2.x - paddle.p2.w/2 - paddle.ballR;
    paddle.ballVel.x = -abs(paddle.ballVel.x) * 1.03;
    paddle.ballVel.y += (paddle.ballPos.y - paddle.p2.y) * 0.02;
  }

  // Puntos (sale por izquierda/derecha)
  if (paddle.ballPos.x < -width/2 - 40) {
    paddle.score2++;
    updateScore();
    pointReset(1);
  } else if (paddle.ballPos.x > width/2 + 40) {
    paddle.score1++;
    updateScore();
    pointReset(-1);
  }

  // Dibujar pelota
  push();
  translate(paddle.ballPos.x, paddle.ballPos.y, paddle.ballPos.z);
  shininess(40);
  specularMaterial(110, 210, 255);
  sphere(paddle.ballR);
  pop();

  // Dibujar paletas
  drawPaddleBar(paddle.p1.x, paddle.p1.y, paddle.p1.w, paddle.p1.h, '#8bf0c8');
  drawPaddleBar(paddle.p2.x, paddle.p2.y, paddle.p2.w, paddle.p2.h, '#6ea8ff');
}

function drawPaddleBar(x, y, w, h, hex) {
  push();
  translate(x, y, 0);
  const c = color(hex);
  ambientMaterial(red(c), green(c), blue(c));
  box(w, h, 24);
  pop();
}

function pointReset(direction = 1) {
  paddle.ballPos.set(0, 0, 0);
  const speed = 4;
  paddle.ballVel.set(speed * direction, random(-3, 3), random(-2, 2));
  updateStatus('Punto anotado. ¡Sigue el juego!');
}

/* ===========================
   Loop principal
   =========================== */
let drawFns = {};
function draw() {
  if (gameMode === 'tictactoe') {
    drawFns.tictactoe();
  } else {
    drawFns.paddle();
  }
}
