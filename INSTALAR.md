# INSTALAR — roteiro para o Claude

> Este arquivo é instrução para o Claude Code. O dev pediu para configurar o fluxo `desenvolvemais`
> no projeto aberto. Siga as etapas na ordem. Não pule a etapa 3 (mostrar o plano antes de criar).
> Tudo funciona com a assinatura do Claude Code + GitHub Actions grátis. **Não precisa de chave de API.**

`<KIT>` = pasta onde este repositório está. `<PROJETO>` = raiz do projeto aberto.

## Etapa 0 — Pré-requisitos

Confira e, se faltar, pare e entregue o passo a passo ao dev:
- `git` instalado e o projeto com remoto no GitHub.
- `node` instalado (os hooks usam Node). Se não tiver: https://nodejs.org (versão LTS).
- `gh` logado (`gh auth status`). Se não: [guias/github-login.md](guias/github-login.md).

## Etapa 1 — Entender o projeto (só leitura)

Descubra e anote, sem perguntar o que dá para descobrir sozinho:

- Linguagem, framework, gerenciador de pacotes, versão do runtime.
- Comandos que já existem: instalar, lint, formatação, typecheck, testes, cobertura, build.
  Procure em `package.json`, `pyproject.toml`, `Makefile`, `composer.json`, `pom.xml`, etc.
- Testes: existem? Qual framework? Qual a cobertura hoje? (rode o comando de cobertura se for rápido e seguro)
- Front-end: existe? Existe design system (tokens, `tailwind.config`, pasta de componentes, Storybook, doc)?
- Git: remoto, branch principal, branches existentes, se já há `.github/workflows`.
- Deploy: Dockerfile / docker-compose? Vercel/Netlify/Render? VPS? Como é feito hoje?
  Se for VPS e o dev der acesso: só **leitura** — em qual pasta e branch a produção está, se há mudança local não commitada
  (`git status`), quais outros sistemas rodam no mesmo servidor (vão para `VIZINHOS` do teste de carga).
- Páginas e endpoints mais importantes do sistema (rotas públicas, `/health`, login) — vão para o `smoke.txt`.
- Se o projeto já tem `AGENTS.md`, `CLAUDE.md` ou `.claude/`, leia antes — **não sobrescreva**, mescle.

## Etapa 2 — Perguntar só o que faltou

Faça no máximo 5 perguntas, curtas, com uma opção recomendada. Exemplos:

- Onde roda produção? (VPS com Docker / plataforma gerenciada / ainda não tem)
- Quer deploy automático ao fazer merge na `main`, com teste de produção e volta automática se falhar? (recomendado: sim)
- Quais módulos opcionais ligar? Mostre a lista de [modulos-opcionais/](modulos-opcionais/) com uma linha de cada
  e já marque o que recomenda para este projeto.
- Cobertura mínima: se o projeto tem pouca cobertura hoje, sugira começar no valor atual e subir aos poucos
  (ex.: atual 40% → gate 40%, sobe 5 pontos por mês até 85%). Gate impossível vira gate ignorado.

## Etapa 3 — Mostrar o plano e esperar o OK

Liste os arquivos que vai criar/alterar e o que cada um faz. Espere o dev aprovar.

## Etapa 4 — Criar os arquivos

Copie de `<KIT>/templates/` e **adapte** (comandos reais, nomes reais, sem placeholders sobrando):

| Destino no projeto | Origem |
|---|---|
| `AGENTS.md` | `templates/AGENTS.md` |
| `CLAUDE.md` | `templates/CLAUDE.md` (só aponta para o AGENTS.md) |
| `.devmais/config.yml` | `templates/devmais.config.yml` — preencha `kit_versao` com `git -C <KIT> rev-parse --short HEAD` |
| `.devmais/smoke.txt` | `templates/smoke.txt` — com as URLs reais de produção (só leitura) |
| `.claude/agents/*.md` | `agentes/*.md` — só os agentes ligados na config, com o `model:` da config |
| `.claude/commands/*.md` | `templates/claude/commands/` (atalhos `/tarefa`, `/status`, `/corrigir`, `/explicar`, `/rollback`) |
| `.claude/settings.json` + `.claude/hooks/*.mjs` | `templates/claude/` — mescle com settings existente |
| `.github/pull_request_template.md` | `templates/github/pull_request_template.md` |
| `.github/dependabot.yml` | `templates/github/dependabot.yml` — ecossistema do projeto |
| `.github/workflows/ci.yml` | `templates/github/workflows/ci-<stack>.yml` (o nome `ci.yml` é obrigatório: o deploy chama ele) |
| `.github/workflows/deploy.yml` + `rollback.yml` | `templates/github/workflows/deploy-vps.yml` e `rollback.yml` (se tiver deploy em VPS) |
| `scripts/deploy.sh` + `scripts/smoke.sh` | `templates/deploy/` (se o deploy for por SSH) |
| `.gitattributes` | `templates/gitattributes` — mescle se já existir (garante `.sh` com quebra de linha Linux) |
| módulos opcionais | conforme cada arquivo em `modulos-opcionais/` |

Deploy em plataforma gerenciada (Vercel, Netlify, Render...): use só a CI + `smoke.sh` num workflow que roda após o
deploy da plataforma (evento `deployment_status`); o rollback é o "promote/rollback" da própria plataforma.

Regras:
- Nunca coloque segredo em arquivo. Segredo vai em GitHub Secrets ou `.env` fora do git.
- Se o projeto não tem script de lint/test/coverage, crie o mínimo necessário e avise.
- Em servidor de produção: só leitura sem pedir. Qualquer alteração no servidor precisa de OK explícito.

## Etapa 5 — Validar

- Rode localmente os comandos que a CI vai rodar. Se algo falha, conserte ou ajuste o gate (com OK do dev).
- Rode `bash scripts/smoke.sh .devmais/smoke.txt` contra a produção atual: tudo tem que dar OK **antes** de ligar o deploy
  automático (senão o primeiro deploy volta sozinho por causa de uma URL errada).
- Crie a branch `chore/devmais-setup`, faça commit e abra PR. Confira que a CI rodou e passou (`gh pr checks`).
- Se tiver deploy: cadastre (ou guie o dev a cadastrar) secrets e variables — [guias/secrets-deploy.md](guias/secrets-deploy.md).
  Com `gh` logado, você mesmo pode usar `gh secret set` / `gh variable set` com os valores que o dev passar.
- **Primeiro deploy acompanhado:** com o OK do dev, faça o merge do PR de setup e acompanhe (`gh run watch`).
  Depois, teste o rollback de verdade: `gh workflow run Rollback -f tag=<a tag que acabou de ser criada>`
  (republica a mesma versão — não muda nada para o usuário, mas prova que a volta funciona).

## Etapa 6 — Entregar

Resposta final curta:
- o que foi criado e o que ficou ligado/desligado;
- o que o dev ainda precisa fazer (com link para o guia);
- como usar no dia a dia: `/tarefa <descrição>`, `/status`, `/corrigir`, `/explicar`, `/rollback`;
- o que acontece sozinho: CI em todo PR, deploy no merge, teste de produção, volta automática e aviso de falha
  que aparece na próxima conversa com o Claude.
