// Hook PreToolUse do Claude Code: "testes são o contrato".
// Criar teste novo é livre (TDD). Editar um teste que JÁ EXISTE na branch principal
// faz o Claude Code pedir confirmação ao dev antes de aplicar.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename, dirname, relative } from "node:path";

const PADRAO_TESTE =
  /(^|[\/\\])(tests?|__tests__|spec|e2e|cypress)[\/\\]|\.(test|spec|cy)\.[cm]?[jt]sx?$|(^|[\/\\])test_[^\/\\]+\.py$|_test\.(py|go)$|Test\.(java|kt|cs)$/i;
const BRANCHES_PRINCIPAIS = ["origin/main", "main", "origin/master", "master"];

function lerEntrada() {
  try {
    return JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return null;
  }
}

// Pergunta ao git a partir da pasta do próprio arquivo ("<branch>:./<nome>"),
// assim não depende do formato de caminho do sistema operacional.
function existeNaPrincipal(caminho) {
  return BRANCHES_PRINCIPAIS.some((branch) => {
    try {
      execFileSync("git", ["cat-file", "-e", `${branch}:./${basename(caminho)}`], {
        cwd: dirname(caminho),
        stdio: "ignore",
      });
      return true;
    } catch {
      return false;
    }
  });
}

const caminho = lerEntrada()?.tool_input?.file_path;
if (!caminho || !PADRAO_TESTE.test(caminho)) process.exit(0);
if (!existeNaPrincipal(caminho)) process.exit(0);

const relativoAoProjeto = relative(process.env.CLAUDE_PROJECT_DIR || process.cwd(), caminho);
const relativo = relativoAoProjeto.startsWith("..") ? caminho : relativoAoProjeto;

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason:
        `"${relativo}" é um teste que já existe na main (contrato). ` +
        "Só aprove se a mudança de comportamento foi decidida por você; ela deve constar em 'Testes alterados' no PR.",
    },
  })
);
