window.focus();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GRAVITY = 0.6;
const JUMP_POWER = -12;
const SCROLL_SPEED = 4; // 右に進んでいるように見せるためのスクロール速度

// プレイヤー（スケボー）
const player = {
  x: 150,
  y: 0,
  width: 40,
  height: 40,
  vy: 0,
  onGround: false
};

// 足場（プラットフォーム）の配列
let platforms = [];
let spawnX = 0; // 次の足場を生成する基準位置
let score = 0;
let gameOver = false;

// 初期足場を作る
function initPlatforms() {
  platforms = [];
  spawnX = 0;
  for (let i = 0; i < 6; i++) {
    spawnPlatform();
  }
}

// ランダムな足場を1つ生成
function spawnPlatform() {
  const width = 120 + Math.random() * 80;
  const gap = 60 + Math.random() * 80; // 足場と足場の間のすき間
  const heightBase = 280;
  const heightVariation = Math.random() * 80 - 40; // 少し上下に揺らす
  const y = heightBase + heightVariation;

  const platform = {
    x: spawnX,
    y: y,
    width: width,
    height: 20
  };

  platforms.push(platform);
  spawnX += width + gap;
}

// 入力
let keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Space" || e.key === " ") {
    if (!gameOver && player.onGround) {
      player.vy = JUMP_POWER;
      player.onGround = false;
    }
    if (gameOver) {
      restart();
    }
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

// ゲームループ
function update() {
  if (gameOver) {
    draw();
    return;
  }

  // スクロール（世界を左に動かす）
  platforms.forEach(p => {
    p.x -= SCROLL_SPEED;
  });
  score += 0.1;

  // 足場が画面外に出たら削除＆新規生成
  if (platforms.length > 0 && platforms[0].x + platforms[0].width < 0) {
    platforms.shift();
    spawnPlatform();
  }

  // プレイヤーの物理
  player.vy += GRAVITY;
  player.y += player.vy;
  player.onGround = false;

  // 足場との当たり判定（簡易）
  for (const p of platforms) {
const isWithinX =
  player.x + player.width > p.x &&
  player.x < p.x + p.width;

const isFallingOnTop =
  player.vy >= 0 &&                     // 下向きに落ちている
  player.y + player.height <= p.y &&    // プレイヤーの底が足場より上
  player.y + player.height + player.vy >= p.y; // 次のフレームで足場に到達

if (isWithinX && isFallingOnTop) {
  player.y = p.y - player.height;
  player.vy = 0;
  player.onGround = true;
}
  }

  // 画面外に落ちたらゲームオーバー
  if (player.y > canvas.height) {
    gameOver = true;
  }

  draw();
  requestAnimationFrame(update);
}

// 描画
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 地面のライン（飾り）
  ctx.fillStyle = "#4a7a3c";
  ctx.fillRect(0, 340, canvas.width, 60);

  // 足場
  ctx.fillStyle = "#3b3b3b";
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

  // プレイヤー（スケボーくん）
  ctx.fillStyle = "#ffeb3b";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // スケボーのタイヤっぽい丸
  ctx.fillStyle = "#333333";
  ctx.beginPath();
  ctx.arc(player.x + 8, player.y + player.height, 6, 0, Math.PI * 2);
  ctx.arc(player.x + player.width - 8, player.y + player.height, 6, 0, Math.PI * 2);
  ctx.fill();

  // スコア
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px sans-serif";
  ctx.fillText("距離: " + Math.floor(score), 20, 30);

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "32px sans-serif";
    ctx.fillText("ゲームオーバー", canvas.width / 2 - 90, canvas.height / 2 - 10);
    ctx.font = "20px sans-serif";
    ctx.fillText("スペースキーでリスタート", canvas.width / 2 - 120, canvas.height / 2 + 30);
  }
}

// リスタート
function restart() {
  player.y = 100;
  player.vy = 0;
  player.onGround = false;
  score = 0;
  gameOver = false;
  initPlatforms();
}

// 初期化してスタート
player.y = 100;
initPlatforms();

update();

