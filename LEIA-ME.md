# CX em Foco: como colocar o portal no ar

> ✅ **Parte 2 (Supabase) já está feita.** O `config.js` já tem as chaves do seu projeto, e o login da Redação é **comercial@sinaspeonline.com**. Falta só a **Parte 1**: publicar no Vercel.

Na pasta você encontra estes arquivos:

| Arquivo | Para que serve |
|---|---|
| `index.html` | O site completo (capa, editorias, matérias, busca e Redação) |
| `config.js` | Onde você cola as chaves do banco de dados (Supabase) |
| `supabase.sql` | Cria as tabelas e as regras de segurança do banco |
| `LEIA-ME.md` | Este guia |

O site funciona em duas etapas:

- **Só no Vercel (sem banco):** o site fica no ar em **modo demonstração**, mostrando as 8 matérias de exemplo apenas para leitura. A Redação fica **fechada**: ninguém consegue entrar nem publicar.
- **Vercel + Supabase (recomendado):** as matérias ficam num banco de dados na nuvem. Você entra na Redação com e-mail e senha, e tudo o que publicar aparece para todos os leitores.

---

## Parte 1: publicar no Vercel (cerca de 5 minutos)

**Opção A, sem GitHub (mais simples)**
1. Crie uma conta grátis em **vercel.com**.
2. Instale o Vercel CLI no computador (é preciso ter o Node.js instalado): `npm i -g vercel`
3. No terminal, entre na pasta `cx-em-foco` e rode `vercel`. Aceite as opções padrão.
4. No fim aparece o endereço do site (ex.: `cx-em-foco.vercel.app`). Para publicar como versão oficial, rode `vercel --prod`.

**Opção B, com GitHub (melhor para atualizar depois)**
1. Crie um repositório no GitHub e envie os arquivos desta pasta.
2. No Vercel, clique em **Add New → Project**, escolha o repositório e clique em **Deploy**.
   Não há build: o Vercel detecta que é um site estático.
3. Sempre que você alterar um arquivo no GitHub, o Vercel atualiza o site sozinho.

---

## Parte 2: ligar o banco de dados Supabase (cerca de 10 minutos, grátis)

1. Crie uma conta em **supabase.com** e clique em **New project**. Escolha um nome, uma senha do banco e a região **South America (São Paulo)**.
2. Abra o arquivo `supabase.sql` e troque `seu-email@exemplo.com` pelo seu e-mail, em letras minúsculas.
3. No Supabase, vá em **SQL Editor → New query**, cole todo o conteúdo do `supabase.sql` e clique em **Run**.
4. Crie o seu usuário da Redação: **Authentication → Users → Add user → Create new user**. Use o **mesmo e-mail** do passo 2, crie uma senha e marque **Auto Confirm User**.
5. Por segurança, desative novos cadastros em **Authentication → Sign In / Providers**, desligando **Allow new users to sign up**.
6. Pegue as chaves em **Project Settings → API** (ou **Data API**):
   - **Project URL**
   - **anon public key**
7. Abra o `config.js` e cole as duas chaves:
   ```js
   window.CONFIG_PORTAL = {
     SUPABASE_URL: "https://seuprojeto.supabase.co",
     SUPABASE_ANON_KEY: "eyJhbGciOi..."
   };
   ```
8. Publique de novo no Vercel (`vercel --prod`, ou envie o `config.js` para o GitHub).

> A chave *anon* pode ficar pública: ela só permite o que as regras do `supabase.sql` deixam. Leitores só leem matérias publicadas, e apenas o seu e-mail consegue publicar. **Nunca** coloque a chave *service_role* no site.

---

## Segurança da Redação

- A Redação **sempre pede e-mail e senha**. Sem login não há como publicar, editar ou excluir.
- Só o e-mail cadastrado no `supabase.sql` tem permissão de publicar. Essa regra fica no próprio banco de dados, então nem alguém que crie outra conta consegue publicar.
- Depois de entrar, o navegador lembra o seu login. Em computador compartilhado, clique em **Sair** (no alto da página) quando terminar.
- Para trocar a senha: Supabase → **Authentication → Users**, clique no seu usuário e use **Send password recovery** ou **Reset password**.

## Parte 3: publicar matérias no dia a dia

1. Clique no botão **Redação** (com o cadeado), no alto da página ou no rodapé.
2. Entre com o e-mail e a senha criados no Supabase.
3. Clique em **+ Nova matéria** e preencha título, linha fina, texto, editoria, tipo (Notícia ou Artigo/Opinião), imagem, autor e tags.
4. Clique em **Publicar**. Ela entra na capa na hora.
   - **★ Destaque na capa:** a matéria vira manchete.
   - **Rascunho:** só você vê.
   - **Data futura:** a matéria fica agendada e aparece sozinha na hora marcada.
5. Em **Configurações do site** você muda o nome do portal, o slogan e o texto do rodapé.

**Formatação do texto**

| Você escreve | Aparece como |
|---|---|
| `## Subtítulo` | Intertítulo |
| `**negrito**` | **negrito** |
| `*itálico*` | *itálico* |
| `> frase` | Citação em destaque |
| `- item` | Lista |
| `[texto](https://link)` | Link |

Deixe uma linha em branco entre os parágrafos.

---

## Domínio próprio (ex.: cxemfoco.com.br)

1. Registre o domínio no **registro.br**.
2. No Vercel: **Project → Settings → Domains → Add** e digite o domínio.
3. O Vercel mostra os registros de DNS. Copie esses registros para o painel do Registro.br, em **DNS → Editar zona**. A ativação pode levar algumas horas.

## Dúvidas comuns

- **A Redação diz que o login ainda não está ativo:** o `config.js` ainda está vazio ou não foi publicado de novo.
- **"Sua conta não tem permissão para publicar":** o e-mail do login é diferente do e-mail colocado no `supabase.sql`. Corrija o arquivo e rode-o de novo no SQL Editor.
- **As matérias de exemplo** só existem no modo demonstração. Com o Supabase ligado, o portal começa vazio, pronto para as suas matérias.

---

## Google e compartilhamento (SEO)

- Cada matéria tem endereço próprio: `seusite/materia/nome-da-materia`.
- O Vercel monta cada matéria no servidor (pasta `api/`), com título, descrição, imagem e dados estruturados para o Google, e com prévia bonita no WhatsApp e no LinkedIn.
- Mapa do site automático: `seusite/sitemap.xml`. Robots: `seusite/robots.txt`.
- Arquivos envolvidos: `vercel.json`, pasta `api/` e `og-padrao.jpg` (imagem usada quando a matéria não tem foto).

**Cadastrar no Google Search Console (uma vez só):**
1. Acesse search.google.com/search-console e clique em **Adicionar propriedade → Prefixo do URL**.
2. Digite o endereço do site (ex.: `https://portal-cx-news.vercel.app`).
3. Verifique pelo método **Tag HTML**: copie só o código `content="..."` e peça para colocá-lo no `index.html`.
4. Depois de verificado, vá em **Sitemaps**, digite `sitemap.xml` e clique em **Enviar**.
