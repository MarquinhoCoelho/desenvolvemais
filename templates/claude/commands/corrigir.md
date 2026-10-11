---
description: Investiga uma falha (deploy, CI ou bug relatado) e corrige pelo fluxo com teste primeiro
argument-hint: [número da issue, link do run ou descrição do erro]
---
Falha a corrigir: $ARGUMENTS

Se não foi informada, use a issue `deploy-falhou` aberta mais recente (`gh issue list --label deploy-falhou`).

Siga `fluxo/06-quando-algo-falha.md` (está resumido no AGENTS.md):
1. Leia a issue/log (`gh run view <id> --log-failed`) e o código envolvido.
2. Explique ao dev em até 4 frases: onde falhou, causa provável, se a produção está segura.
3. Se for um dos casos em que não deve corrigir sozinho (dado de produção, produção fora do ar, causa fora do código,
   teste existente), pare e peça a decisão.
4. Senão: branch `fix/...`, **teste que reproduz e falha**, correção mínima, revisores, QA, PR.
5. No fim: link do PR e o que acontece depois do merge (deploy automático; a issue fecha sozinha se passar).
