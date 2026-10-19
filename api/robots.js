const { origem } = require("./_comum");
module.exports = (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send(`User-agent: *\nAllow: /\nDisallow: /api/\nAllow: /api/imagem\n\nSitemap: ${origem(req)}/sitemap.xml\n`);
};
