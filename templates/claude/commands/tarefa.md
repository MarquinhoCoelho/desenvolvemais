---
description: Executa uma tarefa no modo do projeto (automático ou manual), com o processo que ela merece
argument-hint: [ID opcional] descrição da tarefa
---
Tarefa: $ARGUMENTS

1. Leia `modo` em `.devmais/config.yml` (o dev pode ter pedido outro nesta conversa; vale o pedido dele).
2. Classifique: trivial, normal ou arriscada (tabela "Fluxo de trabalho" do AGENTS.md). Diga o tipo em uma linha.
3. Siga o processo do AGENTS.md para esse tipo e modo:
   - **Trivial:** faz direto → gates locais → branch + PR.
   - **Normal + automático:** implementa você mesmo em TDD → `revisor-geral` no fim → UX/segurança se
     `git diff --name-only main...HEAD` bater com os `caminhos` → PR → merge com CI verde se `merge_automatico: true`.
   - **Normal + manual, ou arriscada:** `planejador` → dev aprova → `implementador` passo a passo → `revisor-spec` →
     `revisor-qualidade` → `qa-adversarial` (+ UX/segurança por caminhos) → PR → dev aprova o merge.
4. Achados CRITICAL/HIGH, regra ambígua, dado de produção ou teste existente → pare e pergunte ao dev.
5. Termine com o resumo de regra de negócio (Feito / Testado / Publicado / Decisão sua). No modo manual, inclua
   também a lista de achados e decisões.
