# desenvolvemais — Roadmap

Kit de desenvolvimento assistido por Claude Code: um **plugin** instalável em qualquer projeto que
entende o ambiente do dev, aplica um fluxo profissional (plano TDD → implementação → revisões → QA →
gates → PR → deploy por branch com rollback) e é **configurável por projeto**.

Origem: palestra "Desenvolvimento com Agentes / Os Dois Sistemas" (resumo em `resumo_prints.md`, fora do repo).

---

## 1. Princípios (extraídos da palestra)

| Princípio | Como vira regra no kit |
|---|---|
| "Pronto" é escrito no repo e conferido por agente **e** ferramenta | `AGENTS.md` + gates na CI |
| Onde dá, a regra vira código; o resto vai pro prompt; o que dá pra medir vira eval | hooks e CI > instruções de skill |
| Uma tarefa por vez, subagente novo com só o contexto dela | orquestrador + worktree por tarefa |
| Revisão em ordem: spec ("fez só o pedido?") → qualidade ("está bem feito?") | dois agentes revisores separados |
| QA independente tenta quebrar; achado vira teste vermelho antes da correção | agente QA + loop red/green |
| Testes são o contrato: alterar teste exige confirmação do dev e PR marcado | hook que bloqueia edição de teste |
| CI bloqueia sozinha; deploy automático até staging; prod com aprovação | GitHub Actions + Environments |
| Decisão sobre achado CRITICAL/HIGH é humana: corrige (teste primeiro) ou aceita o risco por escrito | seção obrigatória no template de PR |
| Modelo por tarefa: barato p/ mecânico, capaz p/ design e revisão | `model:` por agente na config |
| Rastreabilidade por chave: tarefa → commit → PR → deploy → evento | ID da tarefa no branch, commit e tag |
| Fail-closed: na dúvida, não executa | deploy aborta se health check falhar → rollback |

## 2. Arquitetura do repositório

```
desenvolvemais/
├── .claude-plugin/marketplace.json      # permite: /plugin marketplace add MarquinhoCoelho/desenvolvemais
└── plugins/devmais/
    ├── .claude-plugin/plugin.json
    ├── skills/
    │   ├── setup-projeto/        # detecta stack/infra, gera .devmais/config.yml, AGENTS.md, CI, proteção de branch
    │   ├── tarefa/               # fluxo completo de uma tarefa (orquestrador)
    │   ├── testes-unitarios/     # cobertura, técnicas (BVA, partição, decisão/condição), mutação opcional
    │   ├── testes-carga/         # k6: smoke/load/stress/spike/soak com travas de segurança
    │   ├── seguranca/            # OWASP Top 10 + Cheat Sheets, por stack
    │   ├── revisao-ux/           # heurísticas de Nielsen + aderência ao design system
    │   ├── cicd-deploy/          # pipelines, ambientes, deploy por branch, tags
    │   ├── rollback/
    │   ├── explicar/             # explica o que foi feito / arquitetura, no nível pedido
    │   └── guias/                # passo a passo p/ o dev obter tokens, chaves, secrets etc.
    ├── agents/                   # planejador, implementador, revisor-spec, revisor-qualidade,
    │                             # qa-adversarial, revisor-ux, revisor-seguranca
    ├── commands/                 # /devmais:setup, :tarefa, :deploy, :rollback, :explicar, :status
    ├── hooks/                    # proteger testes, bloquear segredos, checar branch
    └── templates/                # AGENTS.md, PR template, workflows, k6, config
```

Cada projeto recebe só arquivos pequenos: `AGENTS.md`, `.devmais/config.yml`, `.github/workflows/*`,
`.github/pull_request_template.md`. O conhecimento fica no plugin (atualiza uma vez, vale pra todos).

## 3. Configuração por projeto (`.devmais/config.yml`)

```yaml
projeto: vivit_pay
stack: { linguagem: typescript, runtime: node20, framework: nestjs }
comandos:
  instalar: npm ci
  lint: npm run lint
  typecheck: npx tsc --noEmit
  testes: npm test -- --coverage
  build: docker compose build
gates:
  cobertura_minima: 85
  complexidade_maxima: 10
  auditoria: high          # bloqueia vulnerabilidade >= high
agentes:                   # liga/desliga e escolhe modelo por agente
  planejador:        { ativo: true,  modelo: opus }
  implementador:     { ativo: true,  modelo: sonnet }
  revisor_spec:      { ativo: true,  modelo: sonnet }
  revisor_qualidade: { ativo: true,  modelo: sonnet }
  qa_adversarial:    { ativo: true,  modelo: opus }
  revisor_ux:        { ativo: auto,  modelo: sonnet, design_system: docs/design-system.md }
  revisor_seguranca: { ativo: true,  modelo: opus }
ambientes:
  staging: { branch: develop, deploy: auto,  host: vps, url: https://staging-pay.exemplo.com }
  prod:    { branch: main,    deploy: auto_apos_pr, aprovacao: true, url: https://pay.exemplo.com }
deploy: { metodo: ssh-compose, caminho: /opt/vivit_pay, healthcheck: /health }
carga:
  alvo_padrao: staging
  limites_container: { cpus: "0.5", memoria: 512m }
  abortar_se: { p95_ms: 1500, erro_pct: 5, load_host: 1.5 }
resposta:
  estilo: objetivo         # objetivo | didatico
```

`revisor_ux: auto` = roda só quando o diff toca arquivos de front.

## 4. Fluxo de uma tarefa

```
dev pede ─► planejador (spec → passos TDD) ─► dev aprova o plano
  └► por passo: implementador (worktree próprio, teste vermelho → verde → commit)
       └► revisor-spec ─(fix)─► implementador
       └► revisor-qualidade ─(fix)─► implementador
  └► QA adversarial + segurança + UX (se front) → achados por severidade
  └► dev decide CRITICAL/HIGH: corrige (teste primeiro) ou aceita risco por escrito
  └► gates locais (lint, tipos, cobertura, auditoria) → PR com template fixo
  └► CI repete os gates e bloqueia o merge se falhar
```

Retorno ao dev: curto e objetivo — o que mudou, o que falhou, o que precisa da decisão dele.
Quando falta informação (token, URL, credencial), o agente para e entrega um passo a passo.

## 5. Branches, deploy e rollback

```
feature/T-123-descricao ──PR──► develop ──(merge)──► deploy automático STAGING
                                   │
                                   └──PR "release"──► main ──(merge + aprovação)──► deploy PROD + tag vAAAA.MM.DD-N
```

- Deploy: GitHub Actions → SSH no VPS com usuário `deploy` (sem root, sem senha) → `git fetch && git checkout <sha>` → `docker compose up -d --build` → health check.
- Health check falhou → volta sozinho pro SHA anterior (fail-closed).
- Rollback manual: `/devmais:rollback` → escolhe tag → workflow redeploya aquele SHA.
- Cada deploy grava a tag e o SHA em produção (rastreabilidade).

## 6. Testes de carga sem derrubar o VPS

O VPS atual tem 2 vCPU / 7,8 GB / sem swap e 15 containers em produção. Regras:

1. **Gerador de carga fora do VPS** (runner do GitHub Actions ou máquina do dev) — o k6 não consome CPU do servidor.
2. **Stress / spike / soak só contra staging**, em container com limite (`cpus: 0.5`, `mem_limit: 512m`) — o pior caso fica preso naquela cota.
3. **Produção só recebe smoke** (1–2 VUs, ~1 min).
4. **Pré-checagem**: se `load average` do host > limite, não começa.
5. **Aborto automático**: thresholds do k6 com `abortOnFail` (p95, taxa de erro) + sonda nos health checks dos outros sites; se algum degradar, para.
6. Horário agendado de madrugada; resultado vira baseline e regressão > X% falha a CI.

Os números medem regressão relativa (staging limitado), não capacidade absoluta de produção.

## 7. Fases

| Fase | Entrega | Validação |
|---|---|---|
| 0 | Esqueleto do plugin + marketplace + este roadmap | `/plugin install` funciona |
| 1 | `setup-projeto` + config + AGENTS.md + template de PR | rodar num projeto real (sem tocar produção) |
| 2 | Agentes do fluxo de tarefa + hook de proteção de testes | uma tarefa real ponta a ponta |
| 3 | CI com gates (lint, tipos, cobertura, auditoria) | PR bloqueado quando gate falha |
| 4 | Deploy por branch + rollback (piloto num projeto de baixo risco) | deploy staging, prod, rollback forçado |
| 5 | Segurança (OWASP) + UX (Nielsen + design system) | achados num diff de front e de API |
| 6 | Testes de carga com travas | smoke em prod, stress em staging sem afetar vizinhos |
| 7 | `explicar`, `guias`, documentação p/ outros devs | dev novo instala e usa sem ajuda |

## 8. Referências

- Testes: https://github.com/fabriciosantana/stsw (BVA, partição de equivalência, cobertura de decisão/condição/caminho, BDD, pirâmide, contratos com Pact)
- Segurança: https://github.com/OWASP/Top10 · https://github.com/OWASP/CheatSheetSeries
  (o kit consulta a cheat sheet relevante sob demanda, não copia o conteúdo para o repo)
- Usabilidade: 10 heurísticas de Nielsen (NN/g)
