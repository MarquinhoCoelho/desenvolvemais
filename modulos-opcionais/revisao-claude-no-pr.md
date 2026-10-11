# Revisão do Claude dentro do PR

O Claude comenta no próprio Pull Request no GitHub, usando a action oficial `anthropics/claude-code-action`.
Útil quando outras pessoas abrem PR, ou para ter uma segunda opinião automática.

## Instalar (forma mais fácil)

No Claude Code, dentro do projeto, rode:
```
/install-github-app
```
Ele instala o app do Claude no repositório, cria o secret e o workflow. Siga as telas.

## Instalar na mão

1. Gere a credencial:
   - Assinatura Claude (Pro/Max): no terminal, `claude setup-token` → copie o token →
     secret `CLAUDE_CODE_OAUTH_TOKEN`.
   - Ou chave de API (console.anthropic.com) → secret `ANTHROPIC_API_KEY`.
2. Crie `.github/workflows/claude-review.yml`:

```yaml
name: Revisão Claude
on:
  pull_request:
    types: [opened, synchronize]
permissions:
  contents: read
  pull-requests: write
  id-token: write
jobs:
  revisar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          prompt: |
            Revise este PR seguindo o AGENTS.md do repositório.
            Primeiro escopo (fez só o pedido?), depois qualidade, depois segurança (OWASP).
            Formato: [SEVERIDADE] título / Onde / Como falha / Como corrigir.
            Português, objetivo. Não comente estilo que o lint já cobre.
```

## Custos
Cada PR consome uso da assinatura ou da API. Em projeto solo, a revisão local do fluxo já cobre isso;
ligue este módulo quando houver PRs de outras pessoas.
