import { questionsAtualidades } from "./questionsAtualidades.js";
import { questionsCiencias } from "./questionsCiencias.js";
import { questionsGeografia } from "./questionsGeografia.js";
import { questionsIngles } from "./questionsIngles.js";
import { questionsHistoria } from "./questionsHistoria.js";
import { questionsMatematica } from "./questionsMatematica.js";
import { questionsPortugues } from "./questionsPortugues.js";

// Temas com questões organizadas por ano
const temas = {
  portugues: questionsPortugues,
  matematica: questionsMatematica,
  historia: questionsHistoria,
  geografia: questionsGeografia,
  ciencias: questionsCiencias,
  ingles: questionsIngles,
  atualidades: questionsAtualidades,
  todos: {
    ano6: [
      ...(questionsPortugues.ano6 || []),
      ...(questionsMatematica.ano6 || []),
      ...(questionsHistoria.ano6 || []),
      ...(questionsGeografia.ano6 || []),
      ...(questionsCiencias.ano6 || []),
      ...(questionsIngles.ano6 || []),
      ...(questionsAtualidades.ano6 || []),
    ],
    ano7: [
      ...(questionsPortugues.ano7 || []),
      ...(questionsMatematica.ano7 || []),
      ...(questionsHistoria.ano7 || []),
      ...(questionsGeografia.ano7 || []),
      ...(questionsCiencias.ano7 || []),
      ...(questionsIngles.ano7 || []),
      ...(questionsAtualidades.ano7 || []),
    ],
    ano8: [
      ...(questionsPortugues.ano8 || []),
      ...(questionsMatematica.ano8 || []),
      ...(questionsHistoria.ano8 || []),
      ...(questionsGeografia.ano8 || []),
      ...(questionsCiencias.ano8 || []),
      ...(questionsIngles.ano8 || []),
      ...(questionsAtualidades.ano8 || []),
    ],
    ano9: [
      ...(questionsPortugues.ano9 || []),
      ...(questionsMatematica.ano9 || []),
      ...(questionsHistoria.ano9 || []),
      ...(questionsGeografia.ano9 || []),
      ...(questionsCiencias.ano9 || []),
      ...(questionsIngles.ano9 || []),
      ...(questionsAtualidades.ano9 || []),
    ],
    geral: [
      ...(questionsPortugues.geral || []),
      ...(questionsMatematica.geral || []),
      ...(questionsHistoria.geral || []),
      ...(questionsGeografia.geral || []),
      ...(questionsCiencias.geral || []),
      ...(questionsIngles.geral || []),
      ...(questionsAtualidades.geral || []),
    ],
  },
};

// Elementos DOM
const anoSelect = document.getElementById("ano-select");
const temaSelect = document.getElementById("tema-select");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const questionEl = document.getElementById("question");
const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const errorsEl = document.getElementById("errors");

let questions = [];
let jogoIniciado = false;
let erros = 0;
let score = 0;
let currentQuestionIndex = 0;
let answeredCorrectly = false;
let respondeuNaRodada = false;
let pulosRestantes = 3;
let jumping = false;
let timeoutId = null;

const maxErros = 3;
const maxPulos = 3;

// Velocidade IGUAL para todas as telas
const velocidadeOpcoes = 1;
let gravity = 5;
const espacamentoOpcoes = 800;

// Tempo para as respostas aparecerem (12 segundos para cada pergunta)
const tempoPrimeiraResposta = 12000; // 12 segundos para cada resposta aparecer

// Posição base do jogador
const posicaoBase = window.innerWidth <= 768 ? 230 : 150;

const trilhaAudio = new Audio("trilha2.mp3");
const somPulo = new Audio("pulo2.mp3");
const somAcerto = new Audio("acerto2.mp3");
const somErro = new Audio("erro.mp3");

trilhaAudio.loop = true;
trilhaAudio.volume = 1.0;
somPulo.volume = 0.7;
somAcerto.volume = 1.0;
somErro.volume = 1.0;

// Mensagem de feedback
const mensagemFeedback = document.createElement("div");
Object.assign(mensagemFeedback.style, {
  position: "fixed",
  left: "50%",
  transform: "translateX(-50%)",
  padding: "10px 20px",
  fontSize: window.innerWidth <= 400 ? "18px" : "24px",
  color: "#fff",
  borderRadius: "10px",
  display: "none",
  zIndex: "9999",
  textAlign: "center",
  backgroundColor: "rgba(0,0,0,0.7)",
  top: "20px",
});
document.body.appendChild(mensagemFeedback);

function mostrarMensagem(texto, cor) {
  mensagemFeedback.innerText = texto;
  mensagemFeedback.style.backgroundColor = cor;
  mensagemFeedback.style.top = "50%";
  mensagemFeedback.style.left = "50%";
  mensagemFeedback.style.transform = "translate(-50%, -50%)";
  mensagemFeedback.style.display = "block";
  setTimeout(() => (mensagemFeedback.style.display = "none"), 3000);
}

function embaralhar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function loadQuestion() {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  answeredCorrectly = false;
  respondeuNaRodada = false;

  const q = questions[currentQuestionIndex];
  if (!q) return;

  questionEl.innerText = q.question;
  document.querySelectorAll(".option").forEach((el) => el.remove());

  timeoutId = setTimeout(() => {
    if (jogoIniciado && currentQuestionIndex < questions.length) {
      if (questions[currentQuestionIndex] === q) {
        // Embaralha as opções
        const opcoesEmbaralhadas = [...q.options];
        for (let i = opcoesEmbaralhadas.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [opcoesEmbaralhadas[i], opcoesEmbaralhadas[j]] = [
            opcoesEmbaralhadas[j],
            opcoesEmbaralhadas[i],
          ];
        }

        opcoesEmbaralhadas.forEach((opt, i) => {
          const div = document.createElement("div");
          div.className = "option";
          div.innerText = opt;
          div.style.left = `${window.innerWidth + i * espacamentoOpcoes}px`;
          const heights = [30, 40, 30, 40];
          div.style.top = `${heights[i % heights.length]}%`;
          div.dataset.correct = opt === q.answer;
          game.appendChild(div);
        });
      }
    }
    timeoutId = null;
  }, tempoPrimeiraResposta);
}

function jump() {
  if (!jogoIniciado || jumping || pulosRestantes <= 0) return;

  somPulo.currentTime = 0;
  somPulo.play();
  pulosRestantes--;
  jumping = true;

  const isMobile = window.innerWidth <= 768;
  const posicaoBase = isMobile ? 230 : 150;
  let jumpHeight = 0;
  const maxJump = 300;
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

document.addEventListener("keydown", (e) => e.code === "Space" && jump());
player.addEventListener("click", jump);

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

// GAMELOOP SIMPLES
function gameLoop() {
  if (!jogoIniciado) {
    requestAnimationFrame(gameLoop);
    return;
  }

  const opcoes = document.querySelectorAll(".option");

  opcoes.forEach((opt) => {
    let left = parseInt(opt.style.left);
    left -= velocidadeOpcoes;
    opt.style.left = `${left}px`;

    // Verifica colisão
    if (!respondeuNaRodada && checkCollision(opt)) {
      respondeuNaRodada = true;

      if (opt.dataset.correct === "true") {
        // Acertou
        somAcerto.play();
        score += 1;
        scoreEl.innerText = `Pontos: ${score}`;
        answeredCorrectly = true;
        mostrarMensagem("✅ +1 pontos!", "#2ecc71");
      } else {
        // Errou
        somErro.play();
        erros++;
        errorsEl.innerText = `Erros: ${erros}/${maxErros}`;
        errorsEl.classList.add("pulse");
        setTimeout(() => errorsEl.classList.remove("pulse"), 500);
        mostrarMensagem("❌ Errou!", "#e74c3c");
      }

      // Remove todas as opções e avança
      document.querySelectorAll(".option").forEach((el) => el.remove());
      currentQuestionIndex++;

      if (erros >= maxErros) {
        setTimeout(() => {
          mostrarMensagem("💀 Game Over!", "#c0392b");
          endGame();
        }, 5000);
      } else if (currentQuestionIndex < questions.length) {
        setTimeout(loadQuestion, 2000);
      } else {
        setTimeout(() => {
          mostrarMensagem("🎉 Fim do jogo!", "#f1c40f");
          endGame();
        }, 1500);
      }
      return;
    }

    // Se passou da tela sem ser pega
    if (left < -100) {
      if (
        opt.dataset.correct === "true" &&
        !respondeuNaRodada &&
        !answeredCorrectly
      ) {
        opt.remove();

        // Conta como erro
        somErro.play();
        erros++;
        errorsEl.innerText = `Erros: ${erros}/${maxErros}`;
        errorsEl.classList.add("pulse");
        setTimeout(() => errorsEl.classList.remove("pulse"), 500);
        mostrarMensagem("❌ Errou!", "#e74c3c");

        respondeuNaRodada = true;
        currentQuestionIndex++;

        if (erros >= maxErros) {
          setTimeout(() => {
            mostrarMensagem("💀 Game Over!", "#c0392b");
            endGame();
          }, 5000);
        } else if (currentQuestionIndex < questions.length) {
          setTimeout(loadQuestion, 2000);
        } else {
          setTimeout(() => {
            mostrarMensagem("🎉 Fim do jogo!", "#f1c40f");
            endGame();
          }, 1500);
        }
      } else {
        opt.remove();
      }
    }
  });

  requestAnimationFrame(gameLoop);
}

function endGame() {
  jogoIniciado = false;
  restartBtn.style.display = "block";
  trilhaAudio.pause();
}

// Eventos dos seletores
anoSelect.addEventListener("change", () => {
  if (anoSelect.value) {
    temaSelect.disabled = false;
    temaSelect.value = "";
    startBtn.disabled = true;
    startBtn.style.opacity = 0.5;
    mostrarMensagem(
      `Ano ${anoSelect.options[anoSelect.selectedIndex].text} selecionado!`,
      "#3498db",
    );
  } else {
    temaSelect.disabled = true;
    temaSelect.value = "";
    startBtn.disabled = true;
    startBtn.style.opacity = 0.5;
  }
});

temaSelect.addEventListener("change", () => {
  if (temaSelect.value && anoSelect.value) {
    startBtn.disabled = false;
    startBtn.style.opacity = 1;
    mostrarMensagem(
      `${temaSelect.options[temaSelect.selectedIndex].text} selecionado!`,
      "#3498db",
    );
  } else {
    startBtn.disabled = true;
    startBtn.style.opacity = 0.5;
  }
});

startBtn.addEventListener("click", () => {
  if (!anoSelect.value || !temaSelect.value) {
    mostrarMensagem("Escolha o ano e a disciplina!", "#e67e22");
    return;
  }

  const ano = anoSelect.value;
  const tema = temaSelect.value;

  if (tema === "todos") {
    questions = temas.todos[ano] || [];
  } else {
    questions = temas[tema][ano] || [];
  }

  if (questions.length === 0) {
    mostrarMensagem("Não há questões disponíveis!", "#e67e22");
    return;
  }

  // Embaralha as perguntas
  questions = embaralhar(questions);

  jogoIniciado = true;
  erros = 0;
  score = 0;
  currentQuestionIndex = 0;
  answeredCorrectly = false;
  respondeuNaRodada = false;

  scoreEl.innerText = "Pontos: 0";
  errorsEl.innerText = `Erros: 0/${maxErros}`;

  trilhaAudio.play();
  startBtn.style.display = "none";
  restartBtn.style.display = "none";

  const posicaoBase = window.innerWidth <= 768 ? 230 : 150;
  player.style.bottom = `${posicaoBase}px`;

  loadQuestion();
  gameLoop();
});

// Balão de boas-vindas
/*
if (player) {
  const balao = document.createElement("div");
  balao.innerText =
    "Olá, nós somos alunos do CEBN e criamos este jogo divertido para que possamos aprender enquanto jogamos.";

  Object.assign(balao.style, {
    position: "absolute",
    backgroundColor: "#fff",
    color: "#000",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    maxWidth: "250px",
    textAlign: "center",
    fontSize: "14px",
    zIndex: "1000",
  });

  setTimeout(() => {
    const playerRect = player.getBoundingClientRect();
    balao.style.left = `${playerRect.left + playerRect.width / 2}px`;
    balao.style.top = `${playerRect.top - 70}px`;
    balao.style.transform = "translateX(-50%)";
  }, 100);

  document.body.appendChild(balao);

  let balaoTimeout = setTimeout(() => {
    balao.remove();
  }, 15000);

  startBtn.addEventListener("click", () => {
    balao.remove();
    clearTimeout(balaoTimeout);
  });
} */

restartBtn.addEventListener("click", () => window.location.reload());

requestAnimationFrame(gameLoop);
