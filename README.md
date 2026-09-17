# Projeto: Dino Game com persistência de dados em backend

![GIF do jogo em ação — adicionar depois que o jogo estiver jogável](./demo.gif "Demonstração do Dino Game")

> `demo.gif` ainda não existe. Depois de jogar uma partida, grave a tela (ex: ScreenToGif, Xbox Game Bar
> `Win+G`, ou o gravador de tela do navegador) e salve o arquivo como `demo.gif` na raiz do repositório.

## Acesso

**https://project2-2026b-cau19.vercel.app**

## Desenvolvedor(a)

Carlos Henrique Mendina Gonçalves Pereira — Engenharia de Computação

## Proposta

Jogo estilo "Dino Game": um personagem parado no canto esquerdo da tela desvia de obstáculos (pulando)
para sobreviver o maior tempo possível. Não há autenticação/login; o jogador apenas informa um nome ao
final da partida para entrar em uma tela de ranking com os maiores scores. O frontend se comunica com o
backend por meio de uma API (leitura e escrita), e os dados de ranking são persistidos do lado do
servidor.

Modalidade: **A** (parceria dev com Ricardo Facco Pigatto — comparação de decisões de código entre duas
implementações do mesmo "Dino Game").

## Parceria/cliente/usuário

Ricardo Facco Pigatto, autor da proposta original do "Dino Game" no documento de definições da
disciplina — também está desenvolvendo sua própria versão do jogo. Parceria de código (modalidade A):
comparar as decisões de implementação entre os dois projetos.

## Feedback/comentário da parceria/cliente/usuário

> A ser preenchido pelo Ricardo, com foco nas diferenças percebidas no código entre as duas
> implementações (modalidade A) — por exemplo, escolhas de stack, estrutura do backend, física do jogo,
> modelagem do banco de dados.

## Desenvolvimento

### Processo

Iniciei o projeto com pouca experiência prévia — apenas HTML e CSS soltos, sem contato com JavaScript —
e escolhi o Dino Game acreditando que seria fácil por causa do backend simples. A dificuldade real,
porém, esteve na lógica do jogo: minha maior virada de chave foi entender que o HTML/CSS criam a
estrutura prévia (como o `<canvas id="game-canvas">`) e o JavaScript apenas manipula esse elemento via
`document.getElementById`, quadro a quadro.

Para viabilizar o desenvolvimento, adaptei minha ideia inicial e trabalhei em conjunto com IA para
estruturar tutoriais, analisar código e resolver problemas mais complexos — como debugar um erro 404 na
Vercel, processo em que acompanhei e aprovei cada etapa. Ao mesmo tempo, mantive a mão na massa:
estruturei o HTML, ajustei manualmente a física do pulo e da gravidade, e escrevi trechos de código de
forma guiada.

Olhando para trás, hoje eu seguiria a dica da professora e escolheria algo como um formulário — a lógica
em tempo real do jogo pesou mais do que eu esperava. Ainda assim, o processo foi uma descoberta valiosa
e honesta sobre como construir e entender software.

### Trechos de código

> Escolha pelo menos 3 trechos para destacar e explique cada um com suas palavras. Sugestões de onde
> olhar, já que são os pontos mais didáticos do projeto:
> 1. A física do pulo em [game.js](./public/game.js) (variáveis `velocityY` e `GRAVITY`).
> 2. A detecção de colisão por retângulos (`rectsOverlap`) em [game.js](./public/game.js).
> 3. As rotas da API (`GET /api/scores` e `POST /api/scores`) em [server.js](./server.js).

## Tecnologias

### Linguagens e afins

- JavaScript (frontend com HTML5 Canvas, e backend com Node.js)
- HTML5 e CSS3
- Node.js + Express (servidor web e API REST)
- Supabase / PostgreSQL (`@supabase/supabase-js`) — banco de dados real, em uso atualmente
- Row Level Security (RLS) no Postgres, com policies restringindo a chave pública a apenas
  leitura e inserção de scores (sem update/delete)
- Deploy: Vercel (função serverless em `api/[...path].js` reexportando o app Express)

### Ambiente de desenvolvimento

- VS Code
- Claude Code (assistente de IA, usado para montar a estrutura inicial do projeto e o tutorial de
  desenvolvimento — o código e o processo de aprendizado foram revisados e explicados por mim)
- Node.js / npm
- Git e GitHub

## Referências e créditos

- [Documentação do Express](https://expressjs.com/pt-br/)
- [MDN — Canvas API](https://developer.mozilla.org/pt-BR/docs/Web/API/Canvas_API)
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do supabase-js](https://supabase.com/docs/reference/javascript/introduction)
- [Documentação de Row Level Security do Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Ideia original do "Dino Game" proposta por Ricardo Facco Pigatto no documento de definições da
  disciplina.

---
Projeto entregue para a disciplina de [Desenvolvimento de Software para a Web](http://github.com/andreainfufsm/elc1090-2026b) em 2026b
