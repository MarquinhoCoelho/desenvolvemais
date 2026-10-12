// Testes das travas (hooks) e do checar-ui do kit. Rodar: node --test testes/
// Cada caso que já deu falso positivo em projeto real vira um teste aqui.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const KIT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOOKS = join(KIT, "templates", "claude", "hooks");
const CHECAR_UI = join(KIT, "templates", "ux", "checar-ui.mjs");

function git(cwd, ...args) {
  return execFileSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], { cwd, encoding: "utf8" });
}

function repoTemporario() {
  const pasta = mkdtempSync(join(tmpdir(), "devmais-"));
  git(pasta, "init", "-q", "-b", "main");
  git(pasta, "commit", "-q", "--allow-empty", "-m", "inicio");
  return pasta;
}

function rodarHook(hook, entrada, cwd) {
  const r = spawnSync("node", [join(HOOKS, hook)], {
    cwd,
    input: JSON.stringify(entrada),
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PROJECT_DIR: cwd },
  });
  if (!r.stdout.trim()) return "libera";
  return JSON.parse(r.stdout).hookSpecificOutput.permissionDecision;
}

// ---------- proteger-main ----------
test("proteger-main: numa branch de feature", async (t) => {
  const repo = repoTemporario();
  git(repo, "switch", "-q", "-c", "feature/x");
  const casos = [
    ["libera", 'git commit -m "fix: push main mais seguro"'],
    ["libera", 'git commit -m "docs: push --force nunca"'],
    ["libera", 'git commit -m "explica git push origin main"'],
    ["libera", "git commit -F - <<'EOF'\nfix: push main\nEOF"],
    ["libera", 'echo "git push origin main" > notas.txt'],
    ["libera", "git push -u origin feature/x"],
    ["libera", 'git -c user.name=x commit -m "a"'],
    ["libera", "git status"],
    ["deny", "git push origin main"],
    ["deny", "git push origin HEAD:main"],
    ["deny", "git push origin master"],
    ["deny", "git push --force origin feature/x"],
    ["deny", "git push -f"],
    ["deny", "git push --force-with-lease"],
    ["deny", 'git add . && git commit -m "x" && git push origin main'],
    ["deny", "git -C . push origin main"],
  ];
  for (const [esperado, command] of casos) {
    await t.test(`${esperado}: ${command.split("\n")[0]}`, () => {
      assert.equal(rodarHook("proteger-main.mjs", { cwd: repo, tool_input: { command } }, repo), esperado);
    });
  }
  rmSync(repo, { recursive: true, force: true });
});

test("proteger-main: estando na main", async (t) => {
  const repo = repoTemporario();
  const casos = [
    ["deny", 'git commit -m "x"'],
    ["deny", 'git -c user.name=x commit -m "a"'],
    ["libera", "git status"],
    ["libera", "git log --oneline -3"],
    ["libera", "git switch -c feature/nova"],
  ];
  for (const [esperado, command] of casos) {
    await t.test(`${esperado}: ${command}`, () => {
      assert.equal(rodarHook("proteger-main.mjs", { cwd: repo, tool_input: { command } }, repo), esperado);
    });
  }
  rmSync(repo, { recursive: true, force: true });
});

test("proteger-main: branch de produção com outro nome (.devmais/config.yml)", () => {
  const repo = repoTemporario();
  mkdirSync(join(repo, ".devmais"));
  writeFileSync(join(repo, ".devmais", "config.yml"), "deploy:\n  branch: producao\n");
  git(repo, "switch", "-q", "-c", "feature/x");
  const decidir = (command) => rodarHook("proteger-main.mjs", { cwd: repo, tool_input: { command } }, repo);
  assert.equal(decidir("git push origin producao"), "deny");
  assert.equal(decidir("git push origin feature/x"), "libera");
  rmSync(repo, { recursive: true, force: true });
});

// ---------- proteger-testes ----------
test("proteger-testes: só pede confirmação para teste que já existe na main", () => {
  const repo = repoTemporario();
  mkdirSync(join(repo, "test"));
  mkdirSync(join(repo, "src"));
  writeFileSync(join(repo, "test", "a.test.js"), "x");
  writeFileSync(join(repo, "src", "a.js"), "y");
  git(repo, "add", ".");
  git(repo, "commit", "-q", "-m", "base");
  const decidir = (arquivo) => rodarHook("proteger-testes.mjs", { tool_input: { file_path: join(repo, arquivo) } }, repo);
  assert.equal(decidir("test/a.test.js"), "ask");
  assert.equal(decidir("test/novo.test.js"), "libera");
  assert.equal(decidir("tests/pasta-nova/b.test.js"), "libera");
  assert.equal(decidir("src/a.js"), "libera");
  rmSync(repo, { recursive: true, force: true });
});

// ---------- sincronizar-workspace ----------
test("sincronizar-workspace: copia agentes/atalhos novos e remove os apagados", () => {
  const ws = mkdtempSync(join(tmpdir(), "devmais-ws-"));
  const agentesRepo = join(ws, "api", ".claude", "agents");
  mkdirSync(agentesRepo, { recursive: true });
  writeFileSync(join(agentesRepo, "revisor-geral.md"), "v2");
  mkdirSync(join(ws, ".claude", "agents"), { recursive: true });
  writeFileSync(join(ws, ".claude", "agents", "revisor-geral.md"), "v1");
  writeFileSync(join(ws, ".claude", "agents", "antigo.md"), "x");
  const script = join(KIT, "templates", "claude", "sincronizar-workspace.mjs");
  const r = spawnSync("node", [script, "api", ws], { encoding: "utf8" });
  assert.equal(r.status, 0);
  assert.equal(readFileSync(join(ws, ".claude", "agents", "revisor-geral.md"), "utf8"), "v2");
  assert.equal(existsSync(join(ws, ".claude", "agents", "antigo.md")), false);
  const deNovo = spawnSync("node", [script, "api", ws], { encoding: "utf8" });
  assert.equal(deNovo.stdout, ""); // nada mudou → silêncio
  rmSync(ws, { recursive: true, force: true });
});

// ---------- checar-ui ----------
test("checar-ui: acha os problemas nas linhas novas e ignora comentários e ©", () => {
  const repo = repoTemporario();
  git(repo, "switch", "-q", "-c", "feature/ui");
  writeFileSync(
    join(repo, "Tela.tsx"),
    [
      "export function Tela() {",
      "  // comentário com travessão — não conta",
      '  const ok = () => alert("salvo");',
      '  return <div title="dica">Salvo — tudo certo ✨<button onClick={ok}>Ok</button></div>;',
      "}",
      "export const Rodape = () => <footer>© 2026 Vivit®</footer>;",
    ].join("\n")
  );
  git(repo, "add", ".");
  git(repo, "commit", "-q", "-m", "ui");
  const r = spawnSync("node", [CHECAR_UI, "main"], { cwd: repo, encoding: "utf8" });
  assert.equal(r.status, 1);
  for (const regra of ["dialogo_nativo", "travessao", "title_nativo", "emoji_icone"]) assert.match(r.stdout, new RegExp(`\\[${regra}\\]`));
  assert.match(r.stdout, /4 problema/);
  assert.doesNotMatch(r.stdout, /Tela\.tsx:2 /);
  assert.doesNotMatch(r.stdout, /Tela\.tsx:6 /);
  rmSync(repo, { recursive: true, force: true });
});
