-- =============================================================
--  CX em Foco — banco de dados (Supabase)
--  1) Troque SEU-EMAIL@EXEMPLO.COM pelo e-mail que você vai usar
--     para entrar na Redação (em minúsculas).
--  2) Cole tudo no Supabase em: SQL Editor → New query → Run.
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

-- Quem pode publicar (pode incluir mais e-mails separados por vírgula)
create or replace function public.eh_editor() returns boolean
language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'seu-email@exemplo.com'
  );
$$;

alter table public.materias enable row level security;
alter table public.config   enable row level security;

drop policy if exists "leitores veem publicadas" on public.materias;
drop policy if exists "editor ve tudo"           on public.materias;
drop policy if exists "editor insere"            on public.materias;
drop policy if exists "editor altera"            on public.materias;
drop policy if exists "editor exclui"            on public.materias;
drop policy if exists "todos leem config"        on public.config;
drop policy if exists "editor grava config"      on public.config;

-- Leitores: só matérias publicadas e com data já alcançada (agendadas ficam ocultas)
create policy "leitores veem publicadas" on public.materias
  for select using (status = 'publicado' and publicado_em <= now());

-- Editor: vê, cria, altera e exclui tudo
create policy "editor ve tudo" on public.materias for select using (public.eh_editor());
create policy "editor insere"  on public.materias for insert with check (public.eh_editor());
create policy "editor altera"  on public.materias for update using (public.eh_editor()) with check (public.eh_editor());
create policy "editor exclui"  on public.materias for delete using (public.eh_editor());

create policy "todos leem config"   on public.config for select using (true);
create policy "editor grava config" on public.config for all using (public.eh_editor()) with check (public.eh_editor());

grant select on public.materias, public.config to anon, authenticated;
grant insert, update, delete on public.materias, public.config to authenticated;
