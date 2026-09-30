-- =============================================================
--  CX em Foco — banco de dados (Supabase)
--  Cole tudo no Supabase em: SQL Editor → New query → Run.
--  Quem pode publicar: qualquer usuário criado em Authentication → Users.
--  Por isso, mantenha DESLIGADO "Allow new users to sign up".
-- =============================================================

create table if not exists public.materias (
  id            text primary key,
  status        text not null default 'publicado' check (status in ('publicado','rascunho')),
  publicado_em  timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  dados         jsonb not null
);

create table if not exists public.config (
  id    text primary key,
  dados jsonb not null
);

alter table public.materias enable row level security;
alter table public.config   enable row level security;

drop policy if exists "leitores veem publicadas" on public.materias;
drop policy if exists "editor ve tudo"           on public.materias;
drop policy if exists "editor insere"            on public.materias;
drop policy if exists "editor altera"            on public.materias;
drop policy if exists "editor exclui"            on public.materias;
drop policy if exists "todos leem config"        on public.config;
drop policy if exists "editor grava config"      on public.config;
drop function if exists public.eh_editor();

-- Leitores: só matérias publicadas e com data já alcançada
create policy "leitores veem publicadas" on public.materias
  for select using (status = 'publicado' and publicado_em <= now());

-- Editor (usuário logado): vê, cria, altera e exclui
create policy "editor ve tudo" on public.materias for select to authenticated
  using (true);
create policy "editor insere" on public.materias for insert to authenticated
  with check (true);
create policy "editor altera" on public.materias for update to authenticated
  using (true)
  with check (true);
create policy "editor exclui" on public.materias for delete to authenticated
  using (true);

create policy "todos leem config" on public.config for select using (true);
create policy "editor grava config" on public.config for all to authenticated
  using (true)
  with check (true);

grant usage on schema public to anon, authenticated;
grant select on public.materias, public.config to anon, authenticated;
grant insert, update, delete on public.materias, public.config to authenticated;
