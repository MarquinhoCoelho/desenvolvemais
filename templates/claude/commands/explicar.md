---
description: Explica o que foi feito, uma parte do código ou a arquitetura do projeto
argument-hint: [o que explicar — vazio = o que mudou na branch atual]
---
Use o agente `explicador` para explicar: $ARGUMENTS

Se vazio: explique o que mudou na branch atual em relação à `main` (`git diff main...HEAD`) — por objetivo, não por arquivo.
Se pedir "arquitetura": visão geral do projeto com diagrama em texto e uma linha por componente.
Baseie tudo no código real e cite `arquivo:linha`.
