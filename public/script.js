let faseAtual = 1;
let pontuacao = 0;
let vidas = 3;
let perguntasAtuais = [];
let indicePergunta = 0;
let podeResponder = true;

const faseInfo = document.getElementById('faseInfo');
const pontuacaoDiv = document.getElementById('pontuacao');
const vidasDiv = document.getElementById('vidas');
const perguntaContainer = document.getElementById('perguntaContainer');
const mensagemDiv = document.getElementById('mensagem');
const proximoBtn = document.getElementById('proximoBtn');
const reiniciarBtn = document.getElementById('reiniciarBtn');

async function carregarFase(fase) {
  const res = await fetch(`/api/questions/${fase}`);
  if (!res.ok) {
    mensagemDiv.innerText = '🏆 Parabéns! Você zerou o jogo!';
    proximoBtn.style.display = 'none';
    reiniciarBtn.style.display = 'inline-block';
    return;
  }
  perguntasAtuais = await res.json();
  indicePergunta = 0;
  podeResponder = true;
  faseInfo.innerText = `📚 Fase ${fase}`;
  mostrarPergunta();
}

function mostrarPergunta() {
  if (indicePergunta >= perguntasAtuais.length) {
    proximaFase();
    return;
  }
  const q = perguntasAtuais[indicePergunta];
  perguntaContainer.innerHTML = `<h3>${q.text}</h3>`;
  q.options.forEach(opcao => {
    const btn = document.createElement('div');
    btn.innerText = opcao;
    btn.classList.add('opcao');
    btn.onclick = () => responder(q.id, opcao, btn);
    perguntaContainer.appendChild(btn);
  });
  mensagemDiv.innerText = '';
  proximoBtn.style.display = 'none';
}

async function responder(id, resposta, btnElement) {
  if (!podeResponder) return;
  podeResponder = false;

  const res = await fetch('/api/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId: id, answer: resposta })
  });
  const data = await res.json();

  if (data.correct) {
    pontuacao += 10;
    mensagemDiv.innerText = '✅ Correto! +10 pontos';
    btnElement.classList.add('correct');
  } else {
    vidas--;
    mensagemDiv.innerText = `❌ Errado! Resposta certa: ${data.correctAnswer}`;
    btnElement.classList.add('wrong');
  }

  pontuacaoDiv.innerText = `⭐ Pontos: ${pontuacao}`;
  vidasDiv.innerText = `❤️ Vidas: ${vidas}`;

  if (vidas <= 0) {
    gameOver();
    return;
  }

  proximoBtn.style.display = 'inline-block';
}

function proximaFase() {
  indicePergunta++;
  if (indicePergunta < perguntasAtuais.length) {
    perguntaContainer.innerHTML = '';
    mostrarPergunta();
    podeResponder = true;
  } else {
    faseAtual++;
    carregarFase(faseAtual);
  }
}

function gameOver() {
  mensagemDiv.innerHTML = `💀 GAME OVER! Pontuação final: ${pontuacao}`;
  perguntaContainer.innerHTML = '';
  proximoBtn.style.display = 'none';
  reiniciarBtn.style.display = 'inline-block';
}

function reiniciarJogo() {
  faseAtual = 1;
  pontuacao = 0;
  vidas = 3;
  indicePergunta = 0;
  podeResponder = true;
  pontuacaoDiv.innerText = `⭐ Pontos: 0`;
  vidasDiv.innerText = `❤️ Vidas: 3`;
  reiniciarBtn.style.display = 'none';
  carregarFase(1);
}

proximoBtn.onclick = () => {
  perguntaContainer.innerHTML = '';
  if (indicePergunta + 1 < perguntasAtuais.length) {
    indicePergunta++;
    mostrarPergunta();
    podeResponder = true;
    proximoBtn.style.display = 'none';
  } else {
    proximaFase();
  }
};

reiniciarBtn.onclick = reiniciarJogo;

carregarFase(1);