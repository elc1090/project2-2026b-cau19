const path = require('path');
const express = require('express');
const supabase = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Caminho absoluto (baseado em __dirname, nao no diretorio de trabalho atual)
// porque em ambiente serverless (Vercel) o cwd nao e garantido ser a raiz do
// projeto, o que fazia express.static('public') nao achar a pasta.
app.use(express.static(path.join(__dirname, 'public')));

// Retorna o top 10 do ranking, do maior score para o menor
app.get('/api/scores', async (req, res) => {
  const { data, error } = await supabase
    .from('scores')
    .select('name, score, created_at')
    .order('score', { ascending: false })
    .limit(10);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar o ranking' });
  }

  res.json(data);
});

// Recebe um novo score e salva no banco
app.post('/api/scores', async (req, res) => {
  const { name, score } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Nome invalido' });
  }
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return res.status(400).json({ error: 'Score invalido' });
  }

  const { data, error } = await supabase
    .from('scores')
    .insert({ name: name.trim().slice(0, 20), score: Math.floor(score) })
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao salvar o score' });
  }

  res.status(201).json(data);
});

// Na Vercel o servidor roda como funcao serverless (o modulo e importado,
// nao executado com "node server.js"), entao so chamamos listen() localmente.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
