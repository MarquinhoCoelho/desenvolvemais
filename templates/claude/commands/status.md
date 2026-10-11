---
description: Mostra a situação do projeto (produção, deploys, falhas abertas, PRs) em poucas linhas
---
Levante e mostre ao dev, em no máximo 8 linhas:

1. Versão em produção: última tag `prod-*` (`git fetch --tags -q && git tag -l 'prod-*' --sort=-creatordate | head -1`) e o commit.
2. Últimos 3 deploys: `gh run list --workflow Deploy --limit 3` (status e quando).
3. Falhas abertas: `gh issue list --label deploy-falhou --state open`. Se houver, resuma a causa (leia o log com `gh run view <id> --log-failed`).
4. PRs abertos e se a CI deles passou: `gh pr list` + `gh pr checks <n>` para cada um (no máximo 5).
5. Branch atual e se há mudança não commitada.

Termine com **uma** sugestão de próximo passo, se houver algo pendente. Sem enrolação.
