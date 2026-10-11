// Hook SessionStart do Claude Code: ao abrir a conversa, confere se há deploy com falha
// (issues "deploy-falhou" abertas pelo workflow de deploy). Se houver, o texto abaixo entra
// no contexto do Claude, que avisa o dev logo no início. Usa o `gh` logado; sem chave de API.
// Qualquer problema (sem gh, sem internet, sem repo no GitHub) → fica em silêncio.
import { execFileSync } from "node:child_process";

function gh(args) {
  return execFileSync("gh", args, { encoding: "utf8", timeout: 8000, stdio: ["ignore", "pipe", "ignore"] });
}

try {
  const falhas = JSON.parse(
    gh(["issue", "list", "--label", "deploy-falhou", "--state", "open", "--limit", "5", "--json", "number,title,url"])
  );
  if (falhas.length > 0) {
    const lista = falhas.map((f) => `- #${f.number} ${f.title} (${f.url})`).join("\n");
    process.stdout.write(
      `[desenvolvemais] Há ${falhas.length} falha(s) de deploy em aberto:\n${lista}\n` +
        "Antes de qualquer outra coisa, leia a issue (gh issue view <n>) e o log (gh run view <id> --log-failed) " +
        "e avise o dev em até 4 frases: onde falhou, provável causa, se a produção está segura (voltou para a " +
        "versão anterior?) e pergunte se ele quer que você corrija. Para corrigir, siga o fluxo " +
        "'quando algo falha' (teste vermelho que reproduz → correção → PR).\n"
    );
  }
} catch {
  // sem gh / offline / repo sem GitHub: não atrapalha o início da conversa
}
