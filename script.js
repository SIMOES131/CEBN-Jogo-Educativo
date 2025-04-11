import { questionsAtualidades } from "./questionsAtualidades.js";
import { questionsCiencias } from "./questionsCiencias.js";
import { questionsGeografia } from "./questionsGeografia.js";
import { questionsGeral } from "./questionsGeral.js";
import { questionsHistoria } from "./questionsHistoria.js";
import { questionsMatematica } from "./qustionsMatematica.js";
import { questionsPortugues } from "./questionsPortugues.js";

const temas = {
  atualidades: questionsAtualidades,
  ciencias: questionsCiencias,
  geografia: questionsGeografia,
  historia: questionsHistoria,
  matematica: questionsMatematica,
  portugues: questionsPortugues,
  todos: [
    ...questionsAtualidades,
    ...questionsCiencias,
    ...questionsGeografia,
    ...questionsHistoria,
    ...questionsMatematica,
    ...questionsPortugues
  ]
};

const temaBtns = document.querySelectorAll('.tema-btn');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const questionEl = document.getElementById('question');
const game = document.getElementById('game');
const player = document.getElementById('player');
const scoreEl = document.getElementById('score');
const errorsEl = document.getElementById('errors');

let questions = [];
let jogoIniciado = false;
let erros = 0;
let score = 0;
let currentQuestionIndex = 0;
let answeredCorrectly = false;
let respondeuNaRodada = false;
let pulosRestantes = 3;
let jumping = false;

const maxErros = 3;
const maxPulos = 3;

const isMobile = window.innerWidth < 400;
let velocidadeOpcoes = isMobile ? 1 : 2;
let gravity = isMobile ? 5 : 15;
const espacamentoOpcoes = isMobile ? 800 : 800;

const trilhaAudio = new Audio('trilha2.mp3');
const somPulo = new Audio('pulo2.mp3');
const somAcerto = new Audio('acerto2.mp3');
const somErro = new Audio('erro.mp3');

trilhaAudio.loop = true;
trilhaAudio.volume = 1.0;
somPulo.volume = 0.7;
somAcerto.volume = 1.0;
somErro.volume = 1.0;

// Mensagem no topo
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
  backgroundColor: 'rgba(0,0,0,0.7)',
  top: '20px'
});
document.body.appendChild(mensagemFeedback);

function mostrarMensagem(texto, cor) {
  mensagemFeedback.innerText = texto;
  mensagemFeedback.style.backgroundColor = cor;

// Centralizar vertical e horizontal
mensagemFeedback.style.top = '50%';
mensagemFeedback.style.left = '50%';
mensagemFeedback.style.transform = 'translate(-50%, -50%)';



  mensagemFeedback.style.display = 'block';

  setTimeout(() => mensagemFeedback.style.display = 'none', 3000);
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
  if (!q) return;

  questionEl.innerText = q.question;
  document.querySelectorAll('.option').forEach(el => el.remove());

  setTimeout(() => {
    q.options.forEach((opt, i) => {
      const div = document.createElement('div');
      div.className = 'option';
      div.innerText = opt;
      div.style.left = `${window.innerWidth + (i * espacamentoOpcoes)}px`;
      div.style.top = `${30 + (i % 3) * 10}%`;
      div.dataset.correct = opt === q.answer;
      game.appendChild(div);
    });
  },5);
}


// Pulo do personagem

function jump() {
  if (!jogoIniciado || jumping || pulosRestantes <= 0) return;

  somPulo.currentTime = 0;
  somPulo.play();
  pulosRestantes--;
  jumping = true;

  const posicaoBase = 200;
  let jumpHeight = 0;
  const maxJump = isMobile ? 400 : 500;
  const jumpSpeed = isMobile ? 15 : 10;

  const jumpInterval = setInterval(() => {
    if (jumpHeight >= maxJump) {
      clearInterval(jumpInterval);

      const fall = setInterval(() => {
        jumpHeight -= gravity;

        if (jumpHeight <= 0) {
          clearInterval(fall);
          jumping = false;
          pulosRestantes = maxPulos;
          player.style.bottom = `${posicaoBase}px`;
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
    }, 10000);
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

// Estado: botão de iniciar desabilitado até escolher tema
startBtn.disabled = true;
startBtn.style.opacity = 0.5;

let temaSelecionado = null;

temaBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tema = btn.dataset.tema;
    if (!temas[tema]) {
      alert('Tema não encontrado.');
      return;
    }

    temaSelecionado = tema;
    startBtn.disabled = false;
    startBtn.style.opacity = 1;
    mostrarMensagem(`Tema "${tema}" selecionado. Clique em Iniciar!`, "#3498db");
  });
});

startBtn.addEventListener('click', () => {
  if (!temaSelecionado) {
    alert('Escolha um tema primeiro!');
    return;
  }

  questions = temas[temaSelecionado];
  embaralhar(questions);
  jogoIniciado = true;
  score = 0;
  erros = 0;
  currentQuestionIndex = 0;
  scoreEl.innerText = "Pontos: 0";
  errorsEl.innerText = `Erros: 0/${maxErros}`;
  trilhaAudio.play();
  startBtn.style.display = 'none';
  restartBtn.style.display = 'none';
  loadQuestion();
  gameLoop();
});


const personagem = document.getElementById('player');

// Verifica se o personagem existe antes de criar o balão
if (personagem) {
  const balao = document.createElement('div');
  balao.innerText = "Olá, eu sou aluno do CEBN e criei esse jogo divertido para que possamos aprender brincando.";

  // Estilização do balão
  Object.assign(balao.style, {
    position: 'absolute',
    backgroundColor: '#fff',
    color: '#000',
    padding: '10px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    maxWidth: '250px',
    textAlign: 'center',
    fontSize: '14px',
    zIndex: '1000'
  });

  // Posiciona o balão acima do personagem
  const personagemRect = personagem.getBoundingClientRect();
  balao.style.left = `${personagemRect.left + personagemRect.width / 1}px`;
  balao.style.top = `${personagemRect.top - 95}px`;
  balao.style.transform = 'translateX(-50%)';

  document.body.appendChild(balao);

  // Remove o balão depois de 15 segundos
  let balaoTimeout = setTimeout(() => {
    balao.remove();
  }, 15000);

  // Remove se clicar em iniciar
  startBtn.addEventListener('click', () => {
    balao.remove();
    clearTimeout(balaoTimeout);
  });
}




restartBtn.addEventListener('click', () => window.location.reload());
