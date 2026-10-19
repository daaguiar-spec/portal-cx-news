// Entrega a imagem de capa de uma matéria como arquivo (para prévias e Google Imagens).
const { supa } = require("./_comum");
module.exports = async (req, res) => {
  const id = String((req.query && req.query.id) || "");
  try {
    const l = await supa(`materias?id=eq.${encodeURIComponent(id)}&status=eq.publicado&select=img:dados->>imagem`);
    const img = l[0] && l[0].img;
    const m = img && img.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
    if (!m) { res.writeHead(302, { Location: "/og-padrao.jpg" }); res.end(); return; }
    res.setHeader("Content-Type", m[1]);
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
    res.status(200).send(Buffer.from(m[2], "base64"));
  } catch (e) {
    console.error(e); res.writeHead(302, { Location: "/og-padrao.jpg" }); res.end();
  }
};
