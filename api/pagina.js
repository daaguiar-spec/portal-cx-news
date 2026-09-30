// Monta a capa e as páginas de matéria já com título, descrição e imagem
// (para o Google e para as prévias do WhatsApp/LinkedIn). Depois o site segue normal.
const { supa, origem, esc, corpoHTML, textoPlano, nomeSite, EDITORIAS } = require("./_comum");

module.exports = async (req, res) => {
  const base = origem(req);
  const slug = (req.query && req.query.slug) ? String(req.query.slug) : "";
  let html;
  try {
    const r = await fetch(`${base}/index.html`, { headers: { "x-interno": "1" } });
    html = await r.text();
  } catch (e) {
    res.status(500).send("Erro ao carregar o site."); return;
  }
  const site = await nomeSite();
  let head = "", corpo = "", status = 200;

  if (slug) {
    let m = null;
    try {
      const l = await supa(`materias?id=eq.${encodeURIComponent(slug)}&status=eq.publicado&select=id,publicado_em,atualizado_em,dados`);
      m = l[0] || null;
    } catch (e) { console.error(e); }
    if (!m) {
      status = 404;
      head = `<title>Matéria não encontrada | ${esc(site)}</title><meta name="robots" content="noindex">`;
    } else {
      const d = m.dados || {};
      const url = `${base}/materia/${encodeURIComponent(m.id)}`;
      const desc = d.linhaFina || textoPlano(d.corpo);
      const img = d.imagem ? `${base}/api/imagem?id=${encodeURIComponent(m.id)}` : `${base}/og-padrao.jpg`;
      const ld = {
        "@context": "https://schema.org", "@type": d.tipo === "artigo" ? "OpinionNewsArticle" : "NewsArticle",
        headline: d.titulo, description: desc, image: [img], datePublished: m.publicado_em,
        dateModified: d.atualizadoEm || m.atualizado_em || m.publicado_em,
        author: [{ "@type": "Person", name: d.autor || "Redação" }],
        publisher: { "@type": "Organization", name: site }, mainEntityOfPage: url,
        articleSection: EDITORIAS[d.editoria] || "", keywords: (d.tags || []).join(", ")
      };
      head = `<title>${esc(d.titulo)} | ${esc(site)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:site_name" content="${esc(site)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(d.titulo)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:locale" content="pt_BR">
<meta property="article:published_time" content="${esc(m.publicado_em)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(d.titulo)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`;
      const data = new Date(m.publicado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
      corpo = `<div class="wrap"><article class="materia" data-ed="${esc(d.editoria)}">
<span class="kicker" data-ed="${esc(d.editoria)}">${d.tipo === "artigo" ? "Opinião · " : ""}${esc(EDITORIAS[d.editoria] || "")}</span>
<h1>${esc(d.titulo)}</h1>${d.linhaFina ? `<p class="fina">${esc(d.linhaFina)}</p>` : ""}
<div class="byline"><div><strong>${esc(d.autor || "Redação")}</strong><span class="meta">${esc(data)}</span></div></div>
${d.imagem ? `<div class="capa"><img src="/api/imagem?id=${encodeURIComponent(m.id)}" alt="${esc(d.legenda || d.titulo)}"></div>` : ""}
${d.legenda ? `<p class="legenda">${esc(d.legenda)}</p>` : ""}
<div class="corpo">${corpoHTML(d.corpo)}</div></article></div>`;
    }
  } else {
    // capa: lista das últimas matérias, para o Google descobrir os links
    let l = [];
    try { l = await supa("materias?status=eq.publicado&select=id,publicado_em,dados->>titulo&order=publicado_em.desc&limit=30"); } catch (e) { console.error(e); }
    l = l.filter(x => new Date(x.publicado_em) <= new Date());
    head = `<title>${esc(site)} | Atendimento, experiência do cliente e liderança</title>
<meta name="description" content="Notícias, análises e artigos sobre atendimento, experiência do cliente e liderança.">
<link rel="canonical" href="${esc(base)}/">
<meta property="og:site_name" content="${esc(site)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(site)}">
<meta property="og:description" content="Atendimento, experiência do cliente e liderança.">
<meta property="og:url" content="${esc(base)}/">
<meta property="og:image" content="${esc(base)}/og-padrao.jpg">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">`;
    corpo = `<div class="wrap"><h1 class="sr">${esc(site)}</h1><ul class="ult-list">${l.map(x => `<li><a href="/materia/${encodeURIComponent(x.id)}">${esc(x.titulo)}</a></li>`).join("")}</ul></div>`;
  }

  // troca o cabeçalho padrão pelo específico da página
  html = html.replace(/<title>[\s\S]*?<meta name="twitter:card" content="summary_large_image">/, head);
  html = html.replace(/<main id="main">[\s\S]*?<\/main>/, `<main id="main">${corpo}</main>`);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=600");
  res.status(status).send(html);
};
