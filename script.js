const game = document.getElementById("game");
const player = document.getElementById("player");
const questionEl = document.getElementById("question");
const scoreEl = document.getElementById("score");
const errorsEl = document.getElementById("errors");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

let jogoIniciado = false;
let erros = 0;
const maxErros = 3;
let pulosRestantes = 3;
const maxPulos = 3;
let currentQuestionIndex = 0;
let score = 0;
let jumping = false;
let answeredCorrectly = false;
let respondeuNaRodada = false;

const isMobile = window.innerWidth < 400;
let velocidadeOpcoes = isMobile ? 1 : 1;
let gravity = isMobile ? 4 : 8;
const espacamentoOpcoes = isMobile ? 1000 : 1000;

const trilhaAudio = new Audio('trilha2.mp3');
const somPulo = new Audio('pulo2.mp3');
const somAcerto = new Audio('acerto2.mp3');
const somErro = new Audio('erro.mp3');

trilhaAudio.loop = true;
trilhaAudio.volume = 1.0;
somPulo.volume = 0.7;
somAcerto.volume = 1.0;
somErro.volume = 1.0;

const mensagemFeedback = document.createElement('div');
Object.assign(mensagemFeedback.style, {
  position: 'fixed',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '10px 20px',
  fontSize: isMobile ? '18px' : '24px',
  color: '#fff',
  borderRadius: '10px',
  display: 'none',
  zIndex: '9999',
  textAlign: 'center',
  backgroundColor: 'rgba(0,0,0,0.7)'
});
document.body.appendChild(mensagemFeedback);

const startBtnTop = startBtn.getBoundingClientRect().top;
mensagemFeedback.style.top = `${startBtnTop - 60}px`;

function mostrarMensagem(texto, cor) {
  mensagemFeedback.innerText = texto;
  mensagemFeedback.style.backgroundColor = cor;
  mensagemFeedback.style.display = 'block';
  setTimeout(() => mensagemFeedback.style.display = 'none', 1000);
}




function embaralhar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function loadQuestion() {
  answeredCorrectly = false;
  respondeuNaRodada = false;
  const q = questions[currentQuestionIndex];

  questionEl.innerText = q.question;
  questionEl.style.backgroundColor = '';
  questionEl.style.color = '';

  document.querySelectorAll('.option').forEach(el => el.remove());

  q.options.forEach((opt, i) => {
    const div = document.createElement('div');
    div.className = 'option';
    div.innerText = opt;
    div.style.left = `${window.innerWidth + (i * espacamentoOpcoes)}px`;
    div.style.top = `${50 + (i % 3) * 10}%`;
    div.dataset.correct = opt === q.answer;
    game.appendChild(div);
  });

  if (currentQuestionIndex > 0 && currentQuestionIndex % 10 === 0) {
    const nivel = currentQuestionIndex >= 30 ? "Super Difícil" :
                  currentQuestionIndex >= 20 ? "Difícil" :
                  currentQuestionIndex >= 10 ? "Médio" : "Fácil";
    mostrarMensagem(`⚡ Nível: ${nivel}`, "#3498db");
  }
}




// LÓGICA DE PULO
function jump() {
  if (!jogoIniciado || jumping || pulosRestantes <= 0) return;

  somPulo.currentTime = 0;
  somPulo.play();
  pulosRestantes--;
  jumping = true;

  const posicaoBase = 105; // posição original do personagem
  let jumpHeight = 0;
  const maxJump = isMobile ? 400 : 500;
  const jumpSpeed = isMobile ? 15 : 10;

  const jumpInterval = setInterval(() => {
    if (jumpHeight >= maxJump) {
      clearInterval(jumpInterval);

      const fall = setInterval(() => {
        jumpHeight -= gravity;

        if (jumpHeight <= 0) {
          jumpHeight = 0;
          clearInterval(fall);
          player.style.bottom = `${posicaoBase}px`;
          jumping = false;
          pulosRestantes = maxPulos;
        } else {
          player.style.bottom = `${posicaoBase + jumpHeight}px`;
        }
      }, jumpSpeed);

    } else {
      jumpHeight += gravity;
      player.style.bottom = `${posicaoBase + jumpHeight}px`;
    }
  }, jumpSpeed);
}


document.addEventListener('keydown', e => e.code === 'Space' && jump());
player.addEventListener('click', jump);

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

function gameLoop() {
  if (!jogoIniciado) {
    requestAnimationFrame(gameLoop);
    return;
  }

  document.querySelectorAll('.option').forEach(opt => {
    let left = parseInt(opt.style.left);
    left -= velocidadeOpcoes;
    opt.style.left = `${left}px`;

    if (left < -100) {
      opt.remove();
      if (opt.dataset.correct === "true" && !answeredCorrectly && !respondeuNaRodada) {
        handleError();
      }
    }

    if (!respondeuNaRodada && checkCollision(opt)) {
      respondeuNaRodada = true;
      opt.dataset.correct === "true" ? handleCorrectAnswer() : handleError();
      document.querySelectorAll('.option').forEach(el => el.remove());
    }
  });

  requestAnimationFrame(gameLoop);
}

function handleCorrectAnswer() {
  somAcerto.play();
  score += 100;
  scoreEl.innerText = `Pontos: ${score}`;
  answeredCorrectly = true;
  currentQuestionIndex++;

  mostrarMensagem("✅ +100 pontos!", "#2ecc71");

  if (currentQuestionIndex < questions.length) {
    setTimeout(loadQuestion, 800);
  } else {
    mostrarMensagem("🎉 Você completou todas as perguntas!", "#f1c40f");
    setTimeout(endGame, 3000);
  }
}

function handleError() {
  somErro.play();
  erros++;
  errorsEl.innerText = `Erros: ${erros}/${maxErros}`;
  errorsEl.classList.add('pulse');
  setTimeout(() => errorsEl.classList.remove('pulse'), 500);

  mostrarMensagem("❌ Errou!", "#e74c3c");
  currentQuestionIndex++;

  if (erros >= maxErros) {
    setTimeout(() => {
      mostrarMensagem("💀 Game Over!", "#c0392b");
      endGame();
    }, 1500);
  } else if (currentQuestionIndex < questions.length) {
    setTimeout(loadQuestion, 1500);
  } else {
    setTimeout(() => {
      mostrarMensagem("🎉 Fim do jogo!", "#f1c40f");
      endGame();
    }, 1500);
  }
}

function endGame() {
  jogoIniciado = false;
  restartBtn.style.display = 'block';
  trilhaAudio.pause();
}

startBtn.addEventListener('click', () => {
  embaralhar(questions);
  jogoIniciado = true;
  score = 0;
  erros = 0;
  currentQuestionIndex = 0;
  scoreEl.innerText = "Pontos: 0";
  errorsEl.innerText = `Erros: 0/${maxErros}`;
  restartBtn.style.display = 'none';
  startBtn.style.display = 'none';
  trilhaAudio.play();
  loadQuestion();
  gameLoop();
});

restartBtn.addEventListener('click', () => window.location.reload());

window.addEventListener('resize', () => {
  const nowMobile = window.innerWidth < 600;
  if (nowMobile !== isMobile) {
    velocidadeOpcoes = nowMobile ? 2 : 4;
    gravity = nowMobile ? 2 : 4;
    espacamentoOpcoes = nowMobile ? 800 : 1500;
  }
});

gameLoop();
