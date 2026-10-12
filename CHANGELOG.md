# Mudanças do kit

O `ATUALIZAR.md` usa este arquivo para saber o que trazer para um projeto já instalado.

## v1.1.0 — modos de trabalho e controle de custo

Motivo: feedback do primeiro uso real — fluxo completo em toda tarefa gastava muitos tokens (um plano simples
passou de 40 mil) e pedia aprovação demais; travas deram falsos positivos; Dependabot abriu 8 PRs no 1º dia.

- **Modos `automatico` e `manual`** (`fluxo/00-modos.md`). Config nova: `modo`, `merge_automatico`.
  O Claude classifica cada pedido: conversa (responde direto), trivial, normal ou arriscada.
  No automático: implementa direto, uma revisão no fim, merge com CI verde, resumo de regra de negócio.
- **Agente novo `revisor-geral`**: escopo + 7 perguntas numa passada só (modo automático).
- **Controle de custo por agente**: config `esforco` e `max_turnos` → cabeçalho `effort` e `maxTurns`
  de cada `.claude/agents/*.md`. QA passou de opus para sonnet (high).
- Descrições dos agentes dizem em qual modo cada um roda.
- `AGENTS.md` e `/tarefa`: seção "Fluxo de trabalho" reescrita por tipo de pedido e modo.
- **Dependabot silencioso**: mensal, minor+patch num PR só, versão major não vira PR automático.
- **`sincronizar-workspace.mjs`**: copia agentes e atalhos do repositório para o workspace (hook SessionStart).
- **Testes do kit** (`testes/`, 27 casos) para as travas, o checar-ui e a sincronização; rodam em todo PR do kit.

## v1.0.0 — primeira versão usada em projeto real

Fluxo TDD com agentes revisores, CI, deploy com teste de produção e volta automática, aviso de falha
(`status-deploy`), travas (`proteger-main`, `proteger-testes`), módulos opcionais, `checar-ui`,
workspace com vários repositórios, branch de produção com outro nome.
