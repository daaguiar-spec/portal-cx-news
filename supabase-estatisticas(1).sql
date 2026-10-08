-- =============================================================
--  CX em Foco — estatísticas (rodar UMA vez no SQL Editor do Supabase)
--  Registra visitas, exibições/cliques de anúncios e compartilhamentos
--  de forma ANÔNIMA (sem nome, e-mail ou IP).
-- =============================================================

create table if not exists public.eventos (
  id          bigint generated always as identity primary key,
  criado_em   timestamptz not null default now(),
  tipo        text not null check (tipo in ('visita','exibicao_anuncio','clique_anuncio','compartilhar')),
  pagina      text,
  materia     text,
  origem      text,
  dispositivo text,
  visitante   text,
  espaco      text,
  alvo        text
);
create index if not exists eventos_criado_em_idx on public.eventos (criado_em);
create index if not exists eventos_tipo_idx on public.eventos (tipo);

alter table public.eventos enable row level security;

drop policy if exists "qualquer um registra" on public.eventos;
drop policy if exists "editor le"            on public.eventos;

-- Qualquer leitor pode REGISTRAR um evento (com limites de tamanho)…
create policy "qualquer um registra" on public.eventos for insert to anon, authenticated
  with check (
    char_length(coalesce(pagina,''))      <= 200 and
    char_length(coalesce(materia,''))     <= 200 and
    char_length(coalesce(origem,''))      <= 60  and
    char_length(coalesce(dispositivo,'')) <= 20  and
    char_length(coalesce(visitante,''))   <= 64  and
    char_length(coalesce(espaco,''))      <= 40  and
    char_length(coalesce(alvo,''))        <= 120
  );
-- …mas só quem está logado na Redação pode LER.
create policy "editor le" on public.eventos for select to authenticated using (true);

grant insert on public.eventos to anon, authenticated;
grant select on public.eventos to authenticated;

-- Resumo usado pelo painel "Estatísticas" da Redação
create or replace function public.estatisticas(dias int default 30)
returns jsonb
language sql stable security invoker
set search_path = public
as $$
  with e as (
    select * from public.eventos
    where criado_em >= (date_trunc('day', now() at time zone 'America/Sao_Paulo') - make_interval(days => greatest(dias,1) - 1)) at time zone 'America/Sao_Paulo'
  ),
  v as (select * from e where tipo = 'visita')
  select jsonb_build_object(
    'visitas',     (select count(*) from v),
    'visitantes',  (select count(distinct visitante) from v),
    'leituras',    (select count(*) from v where materia is not null),
    'exibicoes',   (select count(*) from e where tipo = 'exibicao_anuncio'),
    'cliques',     (select count(*) from e where tipo = 'clique_anuncio'),
    'por_dia', coalesce((select jsonb_agg(jsonb_build_object('dia', d, 'visitas', n, 'visitantes', u) order by d)
                from (select to_char(criado_em at time zone 'America/Sao_Paulo', 'YYYY-MM-DD') d, count(*) n, count(distinct visitante) u
                      from v group by 1) x), '[]'::jsonb),
    'materias', coalesce((select jsonb_agg(jsonb_build_object('id', materia, 'n', n) order by n desc)
                from (select materia, count(*) n from v where materia is not null group by 1 order by 2 desc limit 10) x), '[]'::jsonb),
    'origens', coalesce((select jsonb_agg(jsonb_build_object('origem', origem, 'n', n) order by n desc)
                from (select origem, count(*) n from v where origem is not null group by 1) x), '[]'::jsonb),
    'dispositivos', coalesce((select jsonb_agg(jsonb_build_object('dispositivo', dispositivo, 'n', n) order by n desc)
                from (select dispositivo, count(*) n from v where dispositivo is not null group by 1) x), '[]'::jsonb),
    'anuncios', coalesce((select jsonb_agg(jsonb_build_object('espaco', espaco, 'alvo', alvo, 'exibicoes', ex, 'cliques', cl) order by ex desc)
                from (select espaco, alvo,
                             count(*) filter (where tipo = 'exibicao_anuncio') ex,
                             count(*) filter (where tipo = 'clique_anuncio')   cl
                      from e where tipo in ('exibicao_anuncio','clique_anuncio') group by 1, 2) x), '[]'::jsonb),
    'compartilhamentos_por', coalesce((select jsonb_agg(jsonb_build_object('alvo', alvo, 'n', n) order by n desc)
                from (select alvo, count(*) n from e where tipo = 'compartilhar' group by 1) x), '[]'::jsonb)
  );
$$;

revoke execute on function public.estatisticas(int) from public, anon;
grant execute on function public.estatisticas(int) to authenticated;
