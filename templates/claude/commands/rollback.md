---
description: Volta a produção para uma versão anterior
argument-hint: [tag prod-... opcional]
---
Versão pedida: $ARGUMENTS

1. Liste as 5 últimas versões: `git fetch --tags -q && git tag -l 'prod-*' --sort=-creatordate | head -5`,
   com data e título do commit de cada uma.
2. Se nenhuma tag foi informada, mostre a lista e pergunte para qual voltar (recomende a anterior à atual).
3. Avise o dev: rollback volta o **código**; mudança de banco feita depois daquela versão **não** volta.
   Se houve migração no intervalo (procure pastas de migration no `git diff <tag>..HEAD --stat`), alerte antes.
4. Com o OK: `gh workflow run Rollback -f tag=<tag>` e acompanhe com `gh run watch`.
5. Resultado em 2 frases. Se falhar, mostre o erro (`gh run view --log-failed`).
