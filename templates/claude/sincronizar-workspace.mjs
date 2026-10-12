// Pasta com vários repositórios (workspace): o Claude Code só lê o .claude/ da pasta aberta.
// Este script copia agentes e atalhos do repositório "fonte" para o .claude/ do workspace.
// Instalado como hook SessionStart no workspace, roda sozinho a cada conversa e fica em silêncio.
//
// Uso: node <repo>/.claude/sincronizar-workspace.mjs <repo> [pasta-do-workspace]
//      (sem o segundo argumento, usa a pasta aberta no Claude Code)
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const workspace = resolve(process.argv[3] || process.env.CLAUDE_PROJECT_DIR || process.cwd());
const repo = resolve(workspace, process.argv[2] || ".");
const PASTAS = ["agents", "commands"];

const igual = (a, b) => existsSync(b) && readFileSync(a).equals(readFileSync(b));
const alterados = [];

for (const pasta of PASTAS) {
  const origem = join(repo, ".claude", pasta);
  const destino = join(workspace, ".claude", pasta);
  if (!existsSync(origem) || origem === destino) continue;
  mkdirSync(destino, { recursive: true });
  const nomes = readdirSync(origem).filter((n) => n.endsWith(".md"));
  for (const nome of nomes) {
    if (!igual(join(origem, nome), join(destino, nome))) {
      cpSync(join(origem, nome), join(destino, nome));
      alterados.push(`${pasta}/${nome}`);
    }
  }
  // Remove do workspace o que foi apagado no repositório (só arquivos .md desta sincronização).
  for (const nome of readdirSync(destino).filter((n) => n.endsWith(".md") && !nomes.includes(n))) {
    rmSync(join(destino, nome));
    alterados.push(`${pasta}/${nome} (removido)`);
  }
}

if (alterados.length) {
  process.stdout.write(`[desenvolvemais] .claude/ do workspace atualizado a partir de ${repo}: ${alterados.join(", ")}\n`);
}
