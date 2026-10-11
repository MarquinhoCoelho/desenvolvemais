// Hook PreToolUse do Claude Code: bloqueia commit/push direto na branch de produção
// e push forçado. O trabalho sempre vai por branch + Pull Request.
//
// Funciona também numa pasta com vários repositórios: descobre o repositório do comando por
// `cd <pasta> && ...` ou `git -C <pasta> ...`. A branch de produção vem de `.devmais/config.yml`
// (deploy.branch) daquele repositório; main e master são sempre protegidas.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";

function lerEntrada() {
  try {
    return JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return null;
  }
}

const entrada = lerEntrada();
const comando = entrada?.tool_input?.command ?? "";
if (!/\bgit\b/.test(comando)) process.exit(0);

const base = entrada?.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
const tirarAspas = (s) => s.replace(/^["']|["']$/g, "");
const absoluto = (p) => (isAbsolute(p) || /^[A-Za-z]:[\\/]/.test(p) ? p : resolve(base, p));

// Pasta do repositório que o comando vai mexer.
function pastaDoComando() {
  const c = /\bgit\s+-C\s+("[^"]+"|'[^']+'|\S+)/.exec(comando);
  if (c) return absoluto(tirarAspas(c[1]));
  const cds = [...comando.matchAll(/(?:^|&&|;|\|\|)\s*cd\s+("[^"]+"|'[^']+'|[^\s;&|]+)/g)];
  if (cds.length) return absoluto(tirarAspas(cds[cds.length - 1][1]));
  return base;
}

function git(args, cwd) {
  try {
    return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

const pasta = pastaDoComando();
const raiz = git(["rev-parse", "--show-toplevel"], pasta) || pasta;
const branchAtual = git(["branch", "--show-current"], raiz);

const protegidas = new Set(["main", "master"]);
const cfg = join(raiz, ".devmais", "config.yml");
if (existsSync(cfg)) {
  const b = /^\s*branch:\s*([\w./-]+)/m.exec(readFileSync(cfg, "utf8"))?.[1];
  if (b) protegidas.add(b);
}
const nomes = [...protegidas].map((b) => b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

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

const ehPush = /\bgit\b[^;&|]*\bpush\b/.test(comando);
const ehCommit = /\bgit\b[^;&|]*\bcommit\b/.test(comando);
const depoisDoPush = comando.replace(/^.*\bpush\b/, "");

if (ehPush && /(--force\b|\s-f\b|--force-with-lease)/.test(depoisDoPush)) {
  bloquear("Push forçado é bloqueado pelo fluxo desenvolvemais. Peça ao dev para fazer manualmente, se for mesmo necessário.");
}
if (ehPush && new RegExp(`(^|\\s|:)(${nomes})(\\s|$)`).test(depoisDoPush)) {
  bloquear(`Push direto na branch de produção (${[...protegidas].join("/")}) é bloqueado. Crie uma branch (feature/<ID>-...) e abra um Pull Request.`);
}
if ((ehCommit || ehPush) && protegidas.has(branchAtual)) {
  bloquear(`Você está na ${branchAtual} (produção). Crie uma branch (git switch -c feature/<ID>-descricao) antes de commitar ou dar push.`);
}
