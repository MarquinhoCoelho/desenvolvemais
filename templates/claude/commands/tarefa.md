---
description: Executa uma tarefa pelo fluxo completo (plano TDD, implementação, revisões, QA, PR)
argument-hint: [ID opcional] descrição da tarefa
---
Tarefa: $ARGUMENTS

Siga o fluxo do AGENTS.md:
1. Agente `planejador` → mostre o plano ao dev e espere aprovação.
2. Para cada passo, um de cada vez: `implementador` → `revisor-spec` → `revisor-qualidade` (corrigindo o que pedirem).
3. No fim: `qa-adversarial`. Para `revisor-seguranca` e `revisor-ux`: se `ativo: true`, rode; se `ativo: auto`, rode
   só se algum arquivo de `git diff --name-only main...HEAD` bater com os `caminhos` do agente na config
   — e diga ao dev quais rodaram e quais não (e por quê).
4. Revisão final do conjunto: diff completo da branch coerente, sem sobra de debug, sem arquivo esquecido.
5. Achados CRITICAL/HIGH → dev decide (corrigir com teste primeiro ou aceitar risco por escrito).
6. Rode os mesmos comandos da CI localmente. Tudo verde → PR com o modelo do projeto.

Entre as etapas, atualize o dev em uma linha. No fim: link do PR, achados e decisões, e o que falta (se algo).
