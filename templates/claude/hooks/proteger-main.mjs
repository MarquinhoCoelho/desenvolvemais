// Hook PreToolUse do Claude Code: bloqueia commit/push direto na main/master
// e push forçado. O trabalho sempre vai por branch + Pull Request.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

function lerEntrada() {
  try {
    return JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return null;
  }
}

function branchAtual() {
  try {
    return execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function bloquear(motivo) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: motivo,
      },
    })
  );
  process.exit(0);
}

const comando = lerEntrada()?.tool_input?.command ?? "";
if (!/\bgit\b/.test(comando)) process.exit(0);

const principal = /^(main|master)$/;
const ehPush = /\bgit\s+push\b/.test(comando);
const ehCommit = /\bgit\s+commit\b/.test(comando);

if (ehPush && /(--force\b|\s-f\b|--force-with-lease)/.test(comando)) {
  bloquear("Push forçado é bloqueado pelo fluxo desenvolvemais. Peça ao dev para fazer manualmente, se for mesmo necessário.");
}
if (ehPush && /\b(origin\s+)?(main|master)\b(?!\S*:)/.test(comando.replace(/^.*\bgit\s+push\b/, ""))) {
  bloquear("Push direto na main é bloqueado. Crie uma branch (feature/<ID>-...) e abra um Pull Request.");
}
if ((ehCommit || ehPush) && principal.test(branchAtual())) {
  bloquear("Você está na main. Crie uma branch (git switch -c feature/<ID>-descricao) antes de commitar ou dar push.");
}
