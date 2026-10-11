# Deploy e rollback

## Ideia

```
merge na main
  └► GitHub Actions: roda a CI inteira de novo
       └► passou? ─► conecta no servidor por SSH ─► publica o commit exato
                         └► health check interno (no servidor)
                              └─ falhou ─► servidor volta sozinho para o commit anterior
                         └► teste de produção de fora (.devmais/smoke.txt: páginas, status, tempo de resposta)
                              └─ falhou ─► volta para a última versão boa (tag prod-*)
                         └► tudo OK ─► tag prod-AAAA.MM.DD-N + fecha avisos de falha antigos
  └► qualquer falha ─► issue "deploy-falhou" com diagnóstico ─► o Claude avisa o dev na próxima conversa
```

O que fazer quando falha: [06-quando-algo-falha.md](06-quando-algo-falha.md).

## O teste de produção (`.devmais/smoke.txt`)

Uma linha por página/endpoint importante: URL, status esperado, tempo máximo e (opcional) um texto que precisa aparecer.
Roda de fora do servidor, como um usuário. Só URLs de **leitura** — nada que crie ou apague dado.
Sempre que uma tarefa mexer numa página importante, a linha dela entra (ou é ajustada) no `smoke.txt`.

Isso protege produção mesmo **sem GitHub Pro**: o deploy depende da CI dentro do mesmo workflow.

## Tipos de deploy

| Onde roda | Como publicar | Modelo |
|---|---|---|
| VPS com Docker Compose | SSH + `scripts/deploy.sh` | [deploy-vps.yml](../templates/github/workflows/deploy-vps.yml) + [deploy.sh](../templates/deploy/deploy.sh) |
| VPS sem Docker (systemd/pm2) | SSH + script adaptado (troca o `docker compose` pelo restart do serviço) | mesmo, adaptado |
| Vercel / Netlify / Render / Railway | integração nativa da plataforma com o GitHub | só a CI; a plataforma publica |

## O que o `deploy.sh` faz no servidor

1. Guarda o commit atual (para poder voltar).
2. `git fetch` e vai para o commit novo (exato, não "o último da branch").
3. Sobe a aplicação (`docker compose up -d --build`).
4. Testa a URL de health check por até 60 s.
5. Se falhar: volta para o commit anterior, sobe de novo e termina com erro (o GitHub mostra vermelho).

Arquivos fora do git (`.env`, uploads, volumes do banco) não são tocados.

## Rollback manual

GitHub → aba **Actions** → **Rollback** → **Run workflow** → informe a tag (ex.: `prod-2026.10.10-2`).
Ou peça ao Claude: "faz rollback para a versão de ontem". Ele lista as tags e dispara.

> Rollback de **código** é instantâneo. Rollback de **banco** não: migração que apaga coluna/dado não volta.
> Regra: migrações devem ser compatíveis com a versão anterior (primeiro adiciona, só depois remove em outro deploy).

## Segurança do acesso ao servidor

- Usuário próprio de deploy (ex.: `deploy`), **não** root, com chave SSH própria.
- A chave privada fica só no GitHub Secrets. Passo a passo: [../guias/secrets-deploy.md](../guias/secrets-deploy.md).
- Ninguém usa senha no deploy.

## Primeira vez num servidor que já está em produção

Projetos que hoje são atualizados na mão (`git pull` no servidor):
1. Conferir se a pasta no servidor está limpa (`git status`) — mudança feita direto no servidor se perde.
2. Conferir em qual branch a produção está. Se não for `main`, primeiro mesclar essa branch na `main`.
3. Fazer o primeiro deploy num horário tranquilo, com o dev acompanhando.
