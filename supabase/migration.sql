-- Rode este arquivo inteiro no Supabase: Dashboard do seu projeto > SQL Editor > New query > Run.

-- Tabela de ranking do Dino Game
create table if not exists scores (
  id bigint generated always as identity primary key,
  name text not null,
  score integer not null,
  created_at timestamptz not null default now()
);

-- Ativa Row Level Security (RLS): por padrao, ninguem acessa a tabela.
-- As policies abaixo liberam exatamente o que o jogo precisa, nada mais.
alter table scores enable row level security;

-- O jogo nao tem login, entao qualquer pessoa (chave anon) pode ler o ranking...
create policy "Qualquer pessoa pode ler o ranking"
  on scores for select
  to anon
  using (true);

-- ...e inserir um novo score ao final da partida.
create policy "Qualquer pessoa pode inserir um score"
  on scores for insert
  to anon
  with check (true);

-- Note que nao existe policy de update/delete: mesmo com a chave anon,
-- ninguem consegue alterar ou apagar scores ja salvos.
