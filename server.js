const express = require('express');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Retorna o top 10 do ranking, do maior score para o menor
app.get('/api/scores', (req, res) => {
  const scores = db
    .prepare('SELECT name, score, created_at FROM scores ORDER BY score DESC LIMIT 10')
    .all();
  res.json(scores);
});

// Recebe um novo score e salva no banco
app.post('/api/scores', (req, res) => {
  const { name, score } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Nome invalido' });
  }
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return res.status(400).json({ error: 'Score invalido' });
  }

  const insert = db.prepare('INSERT INTO scores (name, score) VALUES (?, ?)');
  const result = insert.run(name.trim().slice(0, 20), Math.floor(score));

  res.status(201).json({ id: result.lastInsertRowid, name, score });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
