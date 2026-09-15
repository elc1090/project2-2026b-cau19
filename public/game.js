// ---- Elementos da pagina ----
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const currentScoreEl = document.getElementById('current-score');
const scoreForm = document.getElementById('score-form');
const playerNameInput = document.getElementById('player-name');
const rankingList = document.getElementById('ranking-list');

// ---- Constantes do jogo ----
const GROUND_Y = 160; // altura do "chao" dentro do canvas
const GRAVITY = 0.6;
const JUMP_FORCE = -10;

// velocidade dos obstaculos: comeca lenta e sobe aos poucos ate um teto,
// pra dar tempo do jogador se acostumar antes de ficar dificil
const INITIAL_SPEED = 2.5;
const MAX_SPEED = 7;
const SPEED_RAMP_FRAMES = 1800; // ~30s a 60fps ate atingir a velocidade maxima

// intervalo entre obstaculos tambem diminui com a velocidade, mas nunca
// fica curto demais (senao vira impossivel de reagir)
const INITIAL_SPAWN_INTERVAL = 110;
const MIN_SPAWN_INTERVAL = 55;

// ---- Estado do jogo ----
let state = 'idle'; // idle | playing | gameover
let dino = { x: 40, y: GROUND_Y - 20, width: 20, height: 20, velocityY: 0 };
let obstacles = [];
let frameCount = 0;
let framesSinceLastObstacle = 0;
let obstacleSpeed = INITIAL_SPEED;
let score = 0;

function resetGame() {
  dino = { x: 40, y: GROUND_Y - 20, width: 20, height: 20, velocityY: 0 };
  obstacles = [];
  frameCount = 0;
  framesSinceLastObstacle = 0;
  obstacleSpeed = INITIAL_SPEED;
  score = 0;
  currentScoreEl.textContent = 'Score: 0';
}

function jump() {
  // So pode pular se estiver no chao (evita pulo duplo no ar)
  const onGround = dino.y >= GROUND_Y - dino.height;
  if (onGround) {
    dino.velocityY = JUMP_FORCE;
  }
}

function handleInput() {
  if (state === 'idle') {
    state = 'playing';
    startScreen.classList.add('hidden');
    requestAnimationFrame(loop);
  } else if (state === 'playing') {
    jump();
  }
  // se state === 'gameover', o input e tratado pelo formulario, nao aqui
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    handleInput();
  }
});
canvas.addEventListener('pointerdown', handleInput);

function spawnObstacle() {
  const height = 15 + Math.random() * 20;
  obstacles.push({
    x: canvas.width,
    y: GROUND_Y - height,
    width: 12,
    height,
  });
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function update() {
  frameCount++;

  // fisica do pulo: a cada frame a velocidade aumenta pela gravidade
  dino.velocityY += GRAVITY;
  dino.y += dino.velocityY;
  if (dino.y > GROUND_Y - dino.height) {
    dino.y = GROUND_Y - dino.height;
    dino.velocityY = 0;
  }

  // progressao de dificuldade: velocidade sobe aos poucos ate o teto
  const ramp = Math.min(frameCount / SPEED_RAMP_FRAMES, 1);
  obstacleSpeed = INITIAL_SPEED + ramp * (MAX_SPEED - INITIAL_SPEED);
  const spawnInterval =
    INITIAL_SPAWN_INTERVAL - ramp * (INITIAL_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL);

  framesSinceLastObstacle++;
  if (framesSinceLastObstacle >= spawnInterval) {
    spawnObstacle();
    framesSinceLastObstacle = 0;
  }

  // move obstaculos e remove os que sairam da tela
  obstacles.forEach((o) => (o.x -= obstacleSpeed));
  obstacles = obstacles.filter((o) => o.x + o.width > 0);

  // colisao encerra o jogo
  for (const o of obstacles) {
    if (rectsOverlap(dino, o)) {
      endGame();
      return;
    }
  }

  // score sobe com o tempo sobrevivido
  score = Math.floor(frameCount / 6);
  currentScoreEl.textContent = `Score: ${score}`;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // chao
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(canvas.width, GROUND_Y);
  ctx.stroke();

  // dino
  ctx.fillStyle = '#333';
  ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

  // obstaculos
  ctx.fillStyle = '#c0392b';
  obstacles.forEach((o) => ctx.fillRect(o.x, o.y, o.width, o.height));
}

function loop() {
  if (state !== 'playing') return;
  update();
  draw();
  if (state === 'playing') {
    requestAnimationFrame(loop);
  }
}

function endGame() {
  state = 'gameover';
  finalScoreEl.textContent = score;
  gameOverScreen.classList.remove('hidden');
}

// ---- Envio de score e ranking ----
scoreForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = playerNameInput.value.trim();
  if (!name) return;

  await fetch('/api/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, score }),
  });

  playerNameInput.value = '';
  gameOverScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  state = 'idle';
  resetGame();
  draw();
  await loadRanking();
});

async function loadRanking() {
  const res = await fetch('/api/scores');
  const scores = await res.json();

  rankingList.innerHTML = '';
  scores.forEach((s) => {
    const li = document.createElement('li');
    li.textContent = `${s.name} - ${s.score}`;
    rankingList.appendChild(li);
  });
}

// ---- Inicializacao ----
resetGame();
draw();
loadRanking();
