// Hook SessionStart do Claude Code: ao abrir a conversa, confere se há deploy com falha
// (issues "deploy-falhou" abertas pelo workflow de deploy). Se houver, o texto abaixo entra
// no contexto do Claude, que avisa o dev logo no início. Usa o `gh` logado; sem chave de API.
//
// Pasta com vários repositórios: passe as pastas como argumentos
//   node status-deploy.mjs vivit_cursos vivit_pay
// Sem argumentos, usa a pasta do projeto. Qualquer problema (sem gh, offline, sem GitHub) → fica em silêncio.
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const base = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const pastas = process.argv.slice(2).length ? process.argv.slice(2).map((p) => resolve(base, p)) : [base];

function gh(args, cwd) {
  return execFileSync("gh", args, { cwd, encoding: "utf8", timeout: 8000, stdio: ["ignore", "pipe", "ignore"] });
}

const linhas = [];
for (const cwd of pastas) {
  try {
    const falhas = JSON.parse(gh(["issue", "list", "--label", "deploy-falhou", "--state", "open", "--limit", "5", "--json", "number,title,url"], cwd));
    for (const f of falhas) linhas.push(`- ${pastas.length > 1 ? `[${cwd.split(/[\\/]/).pop()}] ` : ""}#${f.number} ${f.title} (${f.url})`);
  } catch {
    // sem gh / offline / pasta sem repositório no GitHub: não atrapalha o início da conversa
  }
}

if (linhas.length) {
  process.stdout.write(
    `[desenvolvemais] Há ${linhas.length} falha(s) de deploy em aberto:\n${linhas.join("\n")}\n` +
      "Antes de qualquer outra coisa, leia a issue (gh issue view <n>) e o log (gh run view <id> --log-failed) " +
      "e avise o dev em até 4 frases: onde falhou, provável causa, se a produção está segura (voltou para a " +
      "versão anterior?) e pergunte se ele quer que você corrija. Para corrigir, siga o fluxo " +
      "'quando algo falha' (teste vermelho que reproduz → correção → PR).\n"
  );
}
