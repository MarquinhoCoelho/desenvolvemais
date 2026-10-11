# Homologação (staging)

Um segundo ambiente, igual à produção, onde a versão nova roda antes de ir para o cliente final.

## Vale a pena?

| Sim, se... | Não precisa, se... |
|---|---|
| cliente/PO precisa ver e aprovar antes | só você usa e valida |
| mudanças grandes e arriscadas são frequentes | mudanças pequenas e bem testadas |
| tem integração externa difícil de simular (pagamento, gov) | CI + rollback automático já dão segurança |
| vai rodar teste de carga pesado com frequência | carga pesada é rara (use a cópia limitada, ver testes-carga.md) |

Sem homologação, a segurança vem de: testes + CI no deploy + health check + rollback automático.

## Como montar (VPS com Docker)

- Branch `develop` → deploy automático em `staging.seudominio.com`. `main` → produção.
- Pasta separada no servidor (ex.: `/opt/projeto-staging`), **banco separado**, `.env` separado.
- Limite de recursos no compose para não competir com a produção (`cpus: "0.5"`, `mem_limit: 512m`).
- Copie `deploy-vps.yml` como `deploy-staging.yml`, trocando `branches: [develop]`, o grupo de concorrência,
  e usando variables com sufixo `_STAGING`.
- Dado pessoal de produção **não** vai para homologação sem anonimizar.
