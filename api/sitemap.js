// Mapa do site para o Google: atualiza sozinho a cada matéria publicada.
const { supa, origem, esc } = require("./_comum");
module.exports = async (req, res) => {
  const base = origem(req);
  let l = [];
  try { l = await supa("materias?status=eq.publicado&select=id,publicado_em,atualizado_em,sd:dados->>siteDaniel&order=publicado_em.desc&limit=5000"); } catch (e) { console.error(e); }
  const agora = new Date();
  const urls = [`<url><loc>${base}/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>`, `<url><loc>${base}/sobre</loc><priority>0.3</priority></url>`, `<url><loc>${base}/privacidade</loc><priority>0.2</priority></url>`]
    .concat(l.filter(x => new Date(x.publicado_em) <= agora && x.sd !== "true").map(x =>
      `<url><loc>${esc(base + "/materia/" + encodeURIComponent(x.id))}</loc><lastmod>${new Date(x.atualizado_em || x.publicado_em).toISOString()}</lastmod></url>`));
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`);
};
