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
let gravity = window.innerWidth < 600 ? 2 : 4;
let answeredCorrectly = false;

// 🎵 Sons do jogo
const trilhaAudio = new Audio('trilha.mp3');
const somPulo = new Audio('pulo.mp3');
const somAcerto = new Audio('acerto.mp3');
const somErro = new Audio('erro.mp3');

trilhaAudio.loop = true;
trilhaAudio.volume = 0.3;
somPulo.volume = 0.7;
somAcerto.volume = 1.0;
somErro.volume = 1.0;

// Função para embaralhar perguntas
function embaralhar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/// Balão de fala antes do jogo (aparece depois de um tempo)
const speechBubble = document.createElement('div');
speechBubble.innerText = 'Olá! Eu sou aluno do CEBN e desenvolvi este jogo para que possamos aprender de forma divertida.';
Object.assign(speechBubble.style, {
  display: 'none', // começa invisível
  bottom: '0px',
  marginRight: '0px',
  marginLeft: '-15%',
  marginBottom: '45%',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: '#fff',
  border: '2px solid #333',
  borderRadius: '15px',
  padding: '15px 20px',
  fontSize: '18px',
  maxWidth: '200px',
  textAlign: 'center',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  zIndex: 1000,
  position: 'absolute'
});
game.appendChild(speechBubble);

// Mostra o balão depois de 3 segundos
setTimeout(() => {
  speechBubble.style.display = 'block';

  // Esconde o balão após 15 segundos, caso o jogo ainda não tenha começado
  setTimeout(() => {
    if (!jogoIniciado) {
      speechBubble.style.display = "none";
    }
  }, 15000);

}, 3000); // aparece depois de 3 segundos



// Container de informações do jogo
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
  fontSize: '20px',
  fontWeight: 'bold',
  padding: '10px 20px',
  marginTop: '80px',
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
  fontSize: "20px",
  borderRadius: "8px",
  marginTop: "240px",
  backgroundColor: "#00FF00",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  width: "120px",
  textAlign: "center"
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
    div.style.left = `${2500 + i * 2000}px`;
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
    somPulo.currentTime = 0;
    somPulo.play();

    pulosRestantes--;
    jumping = true;
    let jumpHeight = 0;
    const maxJump = 400;
    const jumpSpeed = 17;

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

// Detecta clique no personagem para pulo
player.addEventListener('click', () => {
  jump();
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
        somAcerto.currentTime = 0;
        somAcerto.play();

        score += 100;
        scoreEl.innerText = `Pontos: ${score}`;
        answeredCorrectly = true;
        nextQuestion();
      } else if (opt.dataset.correct === "false" && player.offsetTop >= 300) {
        somErro.currentTime = 0;
        somErro.play();

        erros++;
        erroEl.innerText = `Erros: ${erros}/${maxErros}`;
        if (erros >= maxErros) gameOver();
        else nextQuestion();
      }
    }

    if (left < -100 && !answeredCorrectly && opt.dataset.correct === "true") {
      somErro.currentTime = 0;
      somErro.play();

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
    victory();
  }
}

// Vitória do jogo
function victory() {
  trilhaAudio.pause();
  trilhaAudio.currentTime = 0;

  questionEl.innerText = `🎉 Parabéns, você venceu!\nPontuação final: ${score}`;
  document.querySelectorAll('.option').forEach(el => el.remove());
  restartBtn.style.display = "block";
}

// Fim do jogo
function gameOver() {
  trilhaAudio.pause();
  trilhaAudio.currentTime = 0;

  questionEl.innerText = "Que pena você não conseguiu! Tente novamente! 😢";
  document.querySelectorAll('.option').forEach(el => el.remove());
  restartBtn.style.display = "block";
}

// Reiniciar o jogo
restartBtn.addEventListener('click', () => {
  embaralhar(questions);
  currentQuestionIndex = 0;
  score = 0;
  erros = 0;
  pulosRestantes = maxPulos;
  erroEl.innerText = `Erros: ${erros}/${maxErros}`;
  scoreEl.innerText = `Pontos: ${score}`;
  restartBtn.style.display = "none";
  trilhaAudio.play();
  loadQuestion();
});

// Iniciar o jogo
startBtn.addEventListener('click', () => {
  if (!jogoIniciado) {
    jogoIniciado = true;
    speechBubble.style.display = "none"; // 👈 Esconde o balão
    embaralhar(questions);
    currentQuestionIndex = 0;
    score = 0;
    erros = 0;
    pulosRestantes = maxPulos;
    scoreEl.innerText = `Pontos: ${score}`;
    erroEl.innerText = `Erros: ${erros}/${maxErros}`;
    trilhaAudio.play();
    loadQuestion();
    gameLoop();
    startBtn.style.display = "none";
  }
});
