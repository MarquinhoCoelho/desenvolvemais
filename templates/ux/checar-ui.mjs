#!/usr/bin/env node
// Acabamento da interface (kit desenvolvemais): procura, só nas LINHAS NOVAS do diff, o que o revisor de UX reprova sempre.
//   travessao       — "—" (ou "–" como separador) em texto de interface
//   title_nativo    — atributo title= em elemento HTML (use o tooltip do projeto)
//   dialogo_nativo  — alert(), confirm(), prompt() do navegador (use o modal do projeto)
//   emoji_icone     — emoji em telas (use ícone da biblioteca do projeto)
//
// Uso: node scripts/checar-ui.mjs [base]        base padrão: origin/main (ou a branch de .devmais/config.yml)
// Sai com código 1 se encontrar algo. Desligar regra: .devmais/config.yml → agentes.revisor_ux.regras_desligadas
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const EXT = /\.(tsx|jsx|vue|svelte|html|astro|hbs|ejs)$/i;
const config = existsSync(".devmais/config.yml") ? readFileSync(".devmais/config.yml", "utf8") : "";
const desligadas = (/regras_desligadas:\s*\[([^\]]*)\]/.exec(config)?.[1] ?? "")
  .split(",")
  .map((r) => r.trim())
  .filter(Boolean);
const branch = /^\s*branch:\s*([\w./-]+)/m.exec(config)?.[1] ?? "main";
const base = process.argv[2] ?? `origin/${branch}`;

const REGRAS = [
  {
    id: "travessao",
    msg: "travessão em texto de interface (use vírgula, dois-pontos, parênteses ou ponto)",
    // Ignora comentários de código (// ... e {/* ... */}) e linhas só de comentário.
    teste: (l) => /[—]|\s–\s/.test(l.replace(/\/\/.*$|\/\*.*?\*\/|\{\/\*.*?\*\/\}/g, "")) && !/^\s*(\*|\/\/|\/\*)/.test(l),
  },
  {
    id: "title_nativo",
    msg: "title= nativo em elemento HTML (use o componente de tooltip do projeto)",
    teste: (l) => /<[a-z][a-z0-9-]*\b[^>]*\stitle=/.test(l),
  },
  {
    id: "dialogo_nativo",
    msg: "alert/confirm/prompt do navegador (use o modal/aviso do projeto)",
    teste: (l) => /(^|[^\w.])(window\.)?(alert|confirm|prompt)\s*\(/.test(l) && !/^\s*(\*|\/\/)/.test(l),
  },
  {
    id: "emoji_icone",
    msg: "emoji na interface (use um ícone da biblioteca do projeto)",
    // © ® ™ contam como "pictográfico" no Unicode, mas são texto normal de rodapé.
    teste: (l) => /\p{Extended_Pictographic}/u.test(l.replace(/\/\/.*$/, "").replace(/[©®™]/g, "")) && !/^\s*(\*|\/\/)/.test(l),
  },
].filter((r) => !desligadas.includes(r.id));

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

let diff;
try {
  diff = git(["diff", "--unified=0", "--no-color", `${base}...HEAD`]);
} catch {
  diff = git(["diff", "--unified=0", "--no-color", "HEAD"]); // sem a base (ex.: clone raso): compara com o último commit
}

const achados = [];
let arquivo = null;
let linha = 0;
for (const l of diff.split("\n")) {
  if (l.startsWith("+++ ")) {
    const p = l.slice(4).replace(/^b\//, "");
    arquivo = EXT.test(p) ? p : null;
    continue;
  }
  const h = /^@@ -\d+(?:,\d+)? \+(\d+)/.exec(l);
  if (h) {
    linha = Number(h[1]);
    continue;
  }
  if (!arquivo || !l.startsWith("+") || l.startsWith("+++")) continue;
  const texto = l.slice(1);
  for (const r of REGRAS) if (r.teste(texto)) achados.push(`${arquivo}:${linha}  [${r.id}] ${r.msg}\n    ${texto.trim().slice(0, 140)}`);
  linha++;
}

if (achados.length) {
  console.log(`Acabamento da interface: ${achados.length} problema(s) nas linhas novas:\n`);
  console.log(achados.join("\n"));
  process.exit(1);
}
console.log("Acabamento da interface: nada encontrado nas linhas novas.");
