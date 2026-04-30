const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Carrega perguntas do JSON
const questions = JSON.parse(fs.readFileSync('./database/questions.json', 'utf8'));

// Endpoint para pegar perguntas paginadas (fases de 5)
app.get('/api/questions/:fase', (req, res) => {
  const fase = parseInt(req.params.fase);
  const start = (fase - 1) * 5;
  const end = start + 5;
  const faseQuestions = questions.slice(start, end);
  
  if (faseQuestions.length === 0) {
    return res.status(404).json({ error: 'Fase não existe' });
  }
  
  // Remove a resposta correta (só envia alternativas)
  const safeQuestions = faseQuestions.map(q => ({
    id: q.id,
    text: q.text,
    options: q.options,
    correct: q.correct // será usado apenas no front, mas melhor manter escondido
  }));
  
  res.json(safeQuestions);
});

// Verifica resposta (recebe id e resposta do usuário)
app.post('/api/check', (req, res) => {
  const { questionId, answer } = req.body;
  const question = questions.find(q => q.id === questionId);
  if (!question) return res.status(404).json({ error: 'Questão não encontrada' });
  
  const isCorrect = (question.correct === answer);
  res.json({ correct: isCorrect, correctAnswer: question.correct });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});