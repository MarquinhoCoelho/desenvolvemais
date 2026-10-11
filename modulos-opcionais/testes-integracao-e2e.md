# Testes de integração e E2E

## Pirâmide

```
        /  E2E  \        poucos: fluxos críticos (login, compra, cadastro)
       /integração\      médios: API + banco real, filas, serviços
      /  unitários  \    muitos: regras de negócio
```

## Integração (API + banco)

- Banco **real e descartável** na CI: `services:` do GitHub Actions (Postgres, Redis) ou Testcontainers.
  Nunca aponte teste para banco de produção.
- Cada teste prepara e limpa os próprios dados (transação com rollback ou truncate entre testes).
- Teste o contrato da API: status, formato da resposta, erros (400, 401, 403, 404, 422).
- Serviço externo (pagamento, e-mail, WhatsApp): use um **falso previsível** (mock server / nock / respx / WireMock)
  e teste também a falha dele (timeout, 500).
- Entre dois sistemas seus (ex.: front e API em repositórios separados): considere **teste de contrato** (Pact).

Exemplo de serviço Postgres no job da CI:
```yaml
    services:
      postgres:
        image: postgres:16-alpine
        env: { POSTGRES_PASSWORD: teste, POSTGRES_DB: app_teste }
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready" --health-interval 5s --health-timeout 5s --health-retries 10
```

## E2E (navegador)

- **Playwright** (recomendado) ou Cypress. Rodar em 2 navegadores (Chromium + Firefox/WebKit).
- Só fluxos críticos; E2E é lento e frágil se exagerar.
- Selecionar elementos por papel/texto/`data-testid`, nunca por classe CSS.
- Na CI: sobe a aplicação (docker compose ou `npm run start`), espera ficar pronta, roda, guarda vídeo/trace quando falha.

## Para o Claude
Ao ligar este módulo: crie a estrutura, **um** teste de integração e **um** E2E do fluxo mais importante,
adicione os jobs na CI e mostre ao dev como rodar local. Não tente cobrir tudo de uma vez.
