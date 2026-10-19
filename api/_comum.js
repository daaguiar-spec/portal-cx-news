// Funções compartilhadas pelas páginas do servidor (Vercel).
const SUPABASE_URL = process.env.SUPABASE_URL || "https://ouxzzduwjxmtixfftpsy.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_oWqksOTQBirkVbz2GQ7mKA_UUhttXlt";

const EDITORIAS = { atendimento: "Atendimento", experiencia: "Experiência do Cliente", lideranca: "Liderança" };

async function supa(caminho) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${caminho}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  return r.json();
}

function origem(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
}

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}
function corpoHTML(txt) {
  return String(txt || "").replace(/\r/g, "").split(/\n\s*\n/).map(b => {
    b = b.trim(); if (!b) return "";
    const l = b.split("\n");
    if (b.startsWith("## ")) return `<h2>${inline(b.slice(3))}</h2>`;
    if (l.every(x => x.startsWith(">"))) return `<blockquote>${inline(l.map(x => x.replace(/^>\s?/, "")).join(" "))}</blockquote>`;
    if (l.every(x => /^[-•]\s/.test(x))) return `<ul>${l.map(x => `<li>${inline(x.replace(/^[-•]\s/, ""))}</li>`).join("")}</ul>`;
    if (l.every(x => /^\d+[.)]\s/.test(x))) return `<ol>${l.map(x => `<li>${inline(x.replace(/^\d+[.)]\s/, ""))}</li>`).join("")}</ol>`;
    return `<p>${l.map(inline).join("<br>")}</p>`;
  }).join("");
}
function textoPlano(txt, max = 160) {
  const t = String(txt || "").replace(/[#>*\[\]()_-]/g, " ").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).replace(/\s+\S*$/, "") + "…" : t;
}

async function nomeSite() {
  try {
    const c = await supa("config?id=eq.site&select=dados");
    return (c[0] && c[0].dados && c[0].dados.nome) || "CX em Foco";
  } catch { return "CX em Foco"; }
}

module.exports = { supa, origem, esc, corpoHTML, textoPlano, nomeSite, EDITORIAS };
