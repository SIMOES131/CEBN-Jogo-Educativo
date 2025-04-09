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
let gravity = window.innerWidth < 600 ? 2 : 4;
let answeredCorrectly = false;
let respondeuNaRodada = false;

// Sons do jogo
const trilhaAudio = new Audio('trilha2.mp3');
const somPulo = new Audio('pulo2.mp3');
const somAcerto = new Audio('acerto2.mp3');
const somErro = new Audio('erro.mp3');

trilhaAudio.loop = true;
trilhaAudio.volume = 1.0;
somPulo.volume = 0.7;
somAcerto.volume = 1.0;
somErro.volume = 1.0;

// Feedback visual (mensagem)
const mensagemFeedback = document.createElement('div');
mensagemFeedback.style.position = 'fixed';
mensagemFeedback.style.left = '50%';
mensagemFeedback.style.transform = 'translateX(-50%)';
mensagemFeedback.style.padding = '10px 20px';
mensagemFeedback.style.fontSize = '24px';
mensagemFeedback.style.color = '#fff';
mensagemFeedback.style.borderRadius = '10px';
mensagemFeedback.style.display = 'none';
mensagemFeedback.style.zIndex = '9999';
document.body.appendChild(mensagemFeedback);

// Posiciona a mensagem inicialmente na altura do botão iniciar
const startBtnTop = startBtn.getBoundingClientRect().top;
mensagemFeedback.style.top = `${startBtnTop - 60}px`;

function mostrarMensagem(texto, cor) {
  mensagemFeedback.innerText = texto;
  mensagemFeedback.style.backgroundColor = cor;
  mensagemFeedback.style.display = 'block';
  setTimeout(() => {
    mensagemFeedback.style.display = 'none';
  }, 1000);
}

// Embaralha as perguntas
function embaralhar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Carrega nova pergunta
function loadQuestion() {
  answeredCorrectly = false;
  respondeuNaRodada = false;
  const q = questions[currentQuestionIndex];
  questionEl.innerText = q.question;

  document.querySelectorAll('.option').forEach(el => el.remove());

setTimeout(() => {
  q.options.forEach((opt, i) => {
    const div = document.createElement('div');
    div.classList.add('option');
    div.innerText = opt;
    div.style.left = `${window.innerWidth + (i * 1500)}px`;
    div.style.top = '50%';
    div.dataset.correct = opt === q.answer;
    game.appendChild(div);
  });
}, 4000);

  

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
    somPulo.currentTime = 0;
    somPulo.play();

    pulosRestantes--;
    jumping = true;
    let jumpHeight = 0;
    const maxJump = 500;
    const jumpSpeed = 10;

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

// Controles
document.addEventListener('keydown', e => {
  if (e.code === 'Space') jump();
});
player.addEventListener('click', jump);

// Verifica colisão
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
  const options = document.querySelectorAll('.option');

  options.forEach(opt => {
    let left = parseInt(opt.style.left);
    left -= 4;
    opt.style.left = `${left}px`;

    if (left < -100) {
      opt.remove();
      if (opt.dataset.correct === "true" && !answeredCorrectly && !respondeuNaRodada) {
        respondeuNaRodada = true;
        mostrarMensagem("❌ Resposta Errada!", "red");
        handleError();
      }
    }

    if (!respondeuNaRodada && checkCollision(opt)) {
      respondeuNaRodada = true;

      if (opt.dataset.correct === "true") {
        mostrarMensagem("✅ Resposta Certa!", "green");
        handleCorrectAnswer();
      } else {
        mostrarMensagem("❌ Resposta Errada!", "red");
        handleError();
      }

      document.querySelectorAll('.option').forEach(el => el.remove());
    }
  });

  if (jogoIniciado) requestAnimationFrame(gameLoop);
}





// Adicione esta variável no início do seu script
const messageEl = document.getElementById('message');

function showMessage(text, duration = 1500) {
  messageEl.textContent = text;
  messageEl.classList.remove('hidden');
  
  setTimeout(() => {
    messageEl.classList.add('hidden');
  }, duration);
}

function handleCorrectAnswer() {
  somAcerto.play();
  score += 100;
  scoreEl.innerText = `Pontos: ${score}`;
  answeredCorrectly = true;
  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    showMessage("✅ Resposta Correta! +100 pontos");
    setTimeout(() => {
      loadQuestion();
    }, 800);
  } else {
    showMessage("🎉 Parabéns! Você respondeu todas as perguntas!", 3000);
    setTimeout(() => {
      endGame();
    }, 3000);
  }
}

function handleError() {
  somErro.play();
  erros++;
  errorsEl.innerText = `Erros: ${erros} / ${maxErros}`;
  currentQuestionIndex++;

  if (erros >= maxErros) {
    showMessage("💀 Game Over! Tente novamente.", 3000);
    setTimeout(() => {
      endGame();
    }, 3000);
  } else {
    showMessage("❌ Resposta Errada!");
    if (currentQuestionIndex < questions.length) {
      setTimeout(() => {
        loadQuestion();
      }, 800);
    } else {
      showMessage("🎉 Parabéns! Você respondeu todas as perguntas!", 3000);
      setTimeout(() => {
        endGame();
      }, 3000);
    }
  }
}

// Modifique a função endGame para não receber mais a mensagem como parâmetro
function endGame() {
  jogoIniciado = false;
  restartBtn.style.display = 'block';
  trilhaAudio.pause();
}







// Iniciar o jogo
startBtn.addEventListener('click', () => {
  embaralhar(questions);
  jogoIniciado = true;
  score = 0;
  erros = 0;
  currentQuestionIndex = 0;
  scoreEl.innerText = "Pontos: 0";
  errorsEl.innerText = `Erros: 0 / ${maxErros}`;
  restartBtn.style.display = 'none';
  trilhaAudio.play();
  loadQuestion();
  gameLoop();
  startBtn.style.display = 'none';
});

// Reiniciar o jogo
restartBtn.addEventListener('click', () => {
  window.location.reload();
});

// Inicia o loop do jogo
gameLoop();
