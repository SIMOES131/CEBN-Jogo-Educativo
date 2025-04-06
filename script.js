const game = document.getElementById("game");
const player = document.getElementById("player");
const questionEl = document.getElementById("question");
const scoreEl = document.getElementById("score");
const startBtn = document.getElementById("startBtn");

let jogoIniciado = false;
let erros = 0;
const maxErros = 3;

let pulosRestantes = 3;
const maxPulos = 3;
let currentQuestionIndex = 0;
let score = 0;
let jumping = false;
let gravity = 4;
let answeredCorrectly = false;

// Criar container de informações do jogo
const infoContainer = document.createElement('div');
Object.assign(infoContainer.style, {
  position: 'absolute',
  top: '60px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px'
});
document.body.appendChild(infoContainer);

// Exibição de erros
const erroEl = document.createElement('div');
erroEl.id = 'erros';
erroEl.innerText = `Erros: ${erros}/${maxErros}`;
Object.assign(erroEl.style, {
  backgroundColor: '#2196f3',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '10px 20px',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  textAlign: 'center',
  display: 'inline-block'
});
infoContainer.appendChild(erroEl);

// Botão de reiniciar
const restartBtn = document.createElement("button");
restartBtn.innerText = "Reiniciar";
Object.assign(restartBtn.style, {
  display: "none",
  padding: "12px 24px",
  fontSize: "18px",
  borderRadius: "8px",
  backgroundColor: "#2196f3",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  width: "150px"
});
infoContainer.appendChild(restartBtn);

// Carrega nova pergunta
function loadQuestion() {
  answeredCorrectly = false;
  const q = questions[currentQuestionIndex];
  questionEl.innerText = q.question;

  document.querySelectorAll('.option').forEach(el => el.remove());

  q.options.forEach((opt, i) => {
    const div = document.createElement('div');
    div.classList.add('option');
    div.innerText = opt;
    div.style.left = `${1000 + i * 600}px`;
    div.dataset.correct = opt === q.answer;
    game.appendChild(div);
  });

  if (currentQuestionIndex > 0 && currentQuestionIndex % 10 === 0) {
    let nivel = "Fácil";
    if (currentQuestionIndex >= 30) nivel = "Super Difícil";
    else if (currentQuestionIndex >= 20) nivel = "Difícil";
    else if (currentQuestionIndex >= 10) nivel = "Médio";
    alert(`⚡ Nível atualizado: ${nivel}`);
  }
}

// Pulo do jogador
function jump() {
  if (!jumping && pulosRestantes > 0) {
    pulosRestantes--;
    jumping = true;
    let jumpHeight = 0;
    const maxJump = 500;
    const jumpSpeed = 15;

    const jumpInterval = setInterval(() => {
      if (jumpHeight >= maxJump) {
        clearInterval(jumpInterval);
        const fall = setInterval(() => {
          if (jumpHeight <= 0) {
            clearInterval(fall);
            jumping = false;
            pulosRestantes = maxPulos;
          } else {
            jumpHeight -= gravity;
            player.style.bottom = `${50 + jumpHeight}px`;
          }
        }, jumpSpeed);
      } else {
        jumpHeight += gravity;
        player.style.bottom = `${50 + jumpHeight}px`;
      }
    }, jumpSpeed);
  }
}

// Detecta tecla espaço para pulo
document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    jump();
  }
});

// Verifica colisão entre jogador e opções
function checkCollision(option) {
  const playerRect = player.getBoundingClientRect();
  const optRect = option.getBoundingClientRect();

  return (
    playerRect.left < optRect.right &&
    playerRect.right > optRect.left &&
    playerRect.bottom > optRect.top &&
    playerRect.top < optRect.bottom
  );
}

// Loop principal do jogo
function gameLoop() {
  if (!jogoIniciado) return;

  const options = document.querySelectorAll('.option');
  options.forEach(opt => {
    let left = parseInt(opt.style.left);
    left -= 2;
    opt.style.left = `${left}px`;

    if (checkCollision(opt)) {
      if (opt.dataset.correct === "true" && player.offsetTop >= 300) {
        score += 100;
        scoreEl.innerText = `Pontos: ${score}`;
        answeredCorrectly = true;
        nextQuestion();
      } else if (opt.dataset.correct === "false" && player.offsetTop >= 300) {
        erros++;
        erroEl.innerText = `Erros: ${erros}/${maxErros}`;
        if (erros >= maxErros) gameOver();
        else nextQuestion();
      }
    }

    if (left < -100 && !answeredCorrectly && opt.dataset.correct === "true") {
      erros++;
      erroEl.innerText = `Erros: ${erros}/${maxErros}`;
      if (erros >= maxErros) gameOver();
      else nextQuestion();
    }
  });

  requestAnimationFrame(gameLoop);
}

// Avança para próxima pergunta
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    loadQuestion();
  } else {
    location.reload();
  }
}

// Fim do jogo
function gameOver() {
  questionEl.innerText = "Você perdeu! 😢";
  document.querySelectorAll('.option').forEach(el => el.remove());
  restartBtn.style.display = "block";
}

// Reiniciar o jogo
restartBtn.addEventListener('click', () => {
  currentQuestionIndex = 0;
  score = 0;
  erros = 0;
  pulosRestantes = maxPulos;
  erroEl.innerText = `Erros: ${erros}/${maxErros}`;
  scoreEl.innerText = `Pontos: ${score}`;
  restartBtn.style.display = "none";
  loadQuestion();
});

// Iniciar o jogo
startBtn.addEventListener('click', () => {
  if (!jogoIniciado) {
    jogoIniciado = true;
    loadQuestion();
    gameLoop();
    startBtn.style.display = "none";
  }
});
