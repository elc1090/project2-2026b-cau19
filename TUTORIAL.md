# Tutorial: Dino Game com persistência local (SQLite)

Este tutorial explica, passo a passo, como o projeto foi (ou deve ser) construído. A ideia é que você
consiga reproduzir cada etapa entendendo o "porquê", não só copiar o código pronto. Use isso como base
para escrever a seção **Processo** do seu README com suas próprias palavras.

Stack: **Node.js + Express** no backend, **SQLite** (via `better-sqlite3`) como banco local, e
**HTML/CSS/JavaScript puro com Canvas** no frontend. Depois migramos o banco para o Supabase (Postgres)
e fazemos o deploy.

---

## Fase 1 — Projeto local

### Passo 1: Preparar o projeto Node.js

1. Crie a pasta do projeto (ou use a que já tem o Git iniciado) e rode:
   ```
   npm init -y
   ```
   Isso cria o `package.json`, que guarda as dependências e os scripts do projeto.

2. Instale as bibliotecas que vamos usar:
   ```
   npm install express better-sqlite3
   ```
   - `express`: framework simples para criar um servidor web e uma API.
   - `better-sqlite3`: biblioteca para ler/escrever num banco SQLite, que é só **um arquivo** no disco
     (`database.db`). Isso é ótimo para aprender: não precisa instalar um banco de dados separado,
     não tem servidor de banco rodando, é só um arquivo.

3. Crie um `.gitignore` para não subir `node_modules/` e o arquivo do banco (`database.db`) para o Git.

### Passo 2: Criar a conexão com o banco (`database.js`)

O banco precisa de uma tabela para guardar os scores do ranking: nome do jogador, pontuação e data.

```js
const Database = require('better-sqlite3');
const db = new Database('database.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
```

`CREATE TABLE IF NOT EXISTS` garante que, ao rodar o servidor pela primeira vez, a tabela é criada
automaticamente — você não precisa criar o banco manualmente.

### Passo 3: Criar o servidor Express (`server.js`)

O servidor tem duas responsabilidades:
1. Servir os arquivos estáticos do jogo (pasta `public/`: HTML, CSS, JS).
2. Expor uma API para salvar e consultar o ranking.

Duas rotas bastam:
- `GET /api/scores` → devolve os 10 melhores scores.
- `POST /api/scores` → recebe `{ name, score }` e salva no banco.

Veja `server.js` no projeto. Repare que sempre validamos o que chega do cliente (nome não vazio, score
é número) antes de gravar — nunca confie em dados vindos do frontend.

Para rodar: `npm start` (ou `node server.js`) e abrir `http://localhost:3000`.

### Passo 4: Montar o HTML base (`public/index.html`)

Estrutura mínima: um `<canvas>` onde o jogo é desenhado, uma tela inicial, uma tela de "fim de jogo"
com formulário para digitar o nome, e uma lista de ranking.

### Passo 5: O jogo em si (`public/game.js`)

Esse é o coração do projeto. Um jogo em Canvas é basicamente um **loop** que roda a cada frame:

```js
function loop() {
  update(); // atualiza posições, física, colisões
  draw();   // desenha tudo de novo na tela
  requestAnimationFrame(loop); // agenda o próximo frame (~60x por segundo)
}
```

Os conceitos principais:

- **Física do pulo (gravidade)**: o dino tem uma `velocityY`. A cada frame, somamos a gravidade a essa
  velocidade e somamos a velocidade à posição `y`. Isso cria uma curva de pulo natural, sem precisar de
  nenhuma fórmula complicada — é só "a cada frame, cai um pouco mais rápido".
- **Obstáculos**: um array de retângulos que nascem do lado direito da tela e se movem para a
  esquerda. A cada frame, filtramos os que já saíram da tela para não acumular memória.
- **Progressão de dificuldade**: a velocidade dos obstáculos (`obstacleSpeed`) e o intervalo entre eles
  (`spawnInterval`) não são fixos. Um fator `ramp` cresce de 0 a 1 ao longo de `SPEED_RAMP_FRAMES`
  frames (~30s) e é usado para interpolar entre um valor inicial (mais lento, mais espaçado) e um teto
  máximo (mais rápido, mais frequente). Isso evita começar difícil demais e também evita que o jogo
  fique impossível depois de muito tempo (por isso o `Math.min(..., 1)` no `ramp`).
- **Colisão**: comparação de retângulos (AABB - *Axis-Aligned Bounding Box*). Dois retângulos se
  sobrepõem se, ao mesmo tempo, há sobreposição no eixo X e no eixo Y. É a forma mais simples de detectar
  colisão em jogos 2D.
- **Score**: cresce com o tempo sobrevivido (contamos frames e convertemos para um número menor).

### Passo 6: Salvando o score e mostrando o ranking

Quando o jogo termina (`endGame()`), mostramos a tela de game over com o score final e um formulário.
Ao enviar o formulário, fazemos um `fetch` para `POST /api/scores`. Depois, recarregamos o ranking com
outro `fetch` para `GET /api/scores` e atualizamos a lista na tela.

Esse é o requisito central do projeto: **persistência de dados através de uma API**, sem precisar de
login — só o nome digitado ao final da partida.

### Passo 7: Testar localmente

1. `npm start`
2. Abra `http://localhost:3000`
3. Jogue, perca, salve um score, veja se ele aparece no ranking.
4. Pare o servidor (Ctrl+C) e rode de novo — o `database.db` continua no disco, então os scores
   persistem entre execuções. Esse é o comportamento que comprova que a persistência funciona antes
   mesmo de existir um banco "de verdade" na nuvem.

---

## Fase 2 — Banco de dados real (Supabase) e deploy

> ⚠️ **Status: ainda não iniciada.** Até agora só existe o banco SQLite local (`database.db`). Não há
> projeto criado no Supabase, nem deploy. Os passos abaixo são o planejamento de como isso vai ser
> feito quando a fase 1 estiver validada.

Isso vem depois que o jogo estiver funcionando 100% local. Resumo do que muda:

1. Criar um projeto no [Supabase](https://supabase.com) (Postgres gerenciado).
2. Criar a tabela `scores` no Supabase (mesmas colunas de antes, mas em SQL do Postgres).
3. Trocar `better-sqlite3` pelo cliente do Supabase (`@supabase/supabase-js`) ou por uma conexão Postgres
   (`pg`), usando variáveis de ambiente (`SUPABASE_URL`, `SUPABASE_KEY`) em vez de deixar credenciais no
   código.
4. Ajustar `database.js` para essa nova conexão — as rotas do `server.js` praticamente não mudam, porque
   a lógica de "buscar top 10" e "inserir score" continua a mesma, só troca *onde* os dados são salvos.
5. Fazer deploy do backend (Render ou Vercel) e do frontend (pode ser o mesmo serviço, servindo a pasta
   `public/`).
6. Atualizar a seção **Acesso** do README com a URL publicada.

Vamos detalhar essa fase quando o jogo local estiver pronto e testado.
