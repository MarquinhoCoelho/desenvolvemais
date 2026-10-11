# INSTALAR — roteiro para o Claude

> Este arquivo é instrução para o Claude Code. O dev pediu para configurar o fluxo `desenvolvemais`
> no projeto aberto. Siga as etapas na ordem. Não pule a etapa 3 (mostrar o plano antes de criar).

`<KIT>` = pasta onde este repositório está. `<PROJETO>` = raiz do projeto aberto.

## Etapa 1 — Entender o projeto (só leitura)

Descubra e anote, sem perguntar o que dá para descobrir sozinho:

- Linguagem, framework, gerenciador de pacotes, versão do runtime.
- Comandos que já existem: instalar, lint, formatação, typecheck, testes, cobertura, build.
  Procure em `package.json`, `pyproject.toml`, `Makefile`, `composer.json`, `pom.xml`, etc.
- Testes: existem? Qual framework? Qual a cobertura hoje? (rode o comando de cobertura se for rápido e seguro)
- Front-end: existe? Existe design system (tokens, `tailwind.config`, pasta de componentes, Storybook, doc)?
- Git: remoto, branch principal, branches existentes, se já há `.github/workflows`.
- Deploy: Dockerfile / docker-compose? Vercel/Netlify/Render? VPS? Como é feito hoje?
- Se o projeto já tem `AGENTS.md`, `CLAUDE.md` ou `.claude/`, leia antes — **não sobrescreva**, mescle.

## Etapa 2 — Perguntar só o que faltou

Faça no máximo 5 perguntas, curtas, com uma opção recomendada. Exemplos:

- Onde roda produção? (VPS com Docker / plataforma gerenciada / ainda não tem)
- Quer deploy automático ao fazer merge na `main`? (recomendado: sim)
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
| `.devmais/config.yml` | `templates/devmais.config.yml` |
| `.claude/agents/*.md` | `agentes/*.md` — só os agentes ligados na config |
| `.claude/settings.json` + `.claude/hooks/*.mjs` (proteger-testes, proteger-main) | `templates/claude/` (precisa de Node instalado) |
| `.github/pull_request_template.md` | `templates/github/pull_request_template.md` |
| `.github/workflows/ci.yml` | `templates/github/workflows/ci-<stack>.yml` |
| `.github/workflows/deploy.yml` + `rollback.yml` | `templates/github/workflows/` (se tiver deploy) |
| `scripts/deploy.sh` | `templates/deploy/deploy.sh` (se o deploy for por SSH/Docker) |
| `.gitattributes` | `templates/gitattributes` — mescle se já existir (garante `.sh` com quebra de linha Linux) |
| módulos opcionais | conforme cada arquivo em `modulos-opcionais/` |

Regras:
- Nunca coloque segredo em arquivo. Segredo vai em GitHub Secrets ou `.env` fora do git.
- Se o projeto não tem script de lint/test/coverage, crie o mínimo necessário e avise.
- Em servidor de produção: só leitura sem pedir. Qualquer alteração no servidor precisa de OK explícito.

## Etapa 5 — Validar

- Rode localmente os comandos que a CI vai rodar. Se algo falha, conserte ou ajuste o gate (com OK do dev).
- Crie uma branch `chore/devmais-setup`, faça commit e abra PR (se `gh` estiver logado).
  Se `gh` não estiver logado, mande o dev seguir [guias/github-login.md](guias/github-login.md).
- Se tiver deploy: liste os secrets que faltam e mande o dev para [guias/secrets-deploy.md](guias/secrets-deploy.md).

## Etapa 6 — Entregar

Resposta final curta: o que foi criado, o que o dev precisa fazer (com link para o guia), e como pedir a primeira tarefa.
