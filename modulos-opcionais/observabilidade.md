# Observabilidade — saber o que acontece em produção

O deploy testa a produção na hora em que publica. Este módulo cuida do **resto do tempo**:
o site caiu às 3h, um erro só acontece com certos usuários, ficou lento aos poucos.

Na palestra, é o lado "Operação" dos dois sistemas: cada problema em produção precisa ser **visto**
(em vez de passar calado) e virar teste no desenvolvimento.

## Nível 1 — o mínimo (grátis, 15 minutos)

- **Monitor de disponibilidade:** UptimeRobot, Better Stack ou similar, plano grátis.
  Cadastre as mesmas URLs do `.devmais/smoke.txt`, checagem a cada 5 min, alerta por e-mail/Telegram.
- **Health check de verdade:** `/health` que confere banco e dependências (não só "estou vivo"), responde rápido
  e não expõe detalhe interno.

## Nível 2 — erros com contexto

- **Rastreamento de erros:** Sentry (plano grátis) ou GlitchTip (open source, auto-hospedado).
  Cada exceção chega com stack trace, versão (use a tag `prod-*` como `release`) e quantos usuários afetou.
- **Logs estruturados (JSON)** com um `id` por requisição, para seguir um pedido de ponta a ponta.
- **Nome de evento igual** no código e no painel (ex.: `pagamento.recusado`) — é a "chave" que liga o sintoma
  em produção ao código.

## Nível 3 — funil e negócio

- Eventos das etapas importantes (cadastro iniciado → concluído; carrinho → pagamento → confirmado).
  Queda no funil mostra abandono silencioso que nenhum erro técnico mostra.
- Job periódico que fecha sessões/processos parados e **registra o motivo** (a palestra chama de *sweeper*).

## Regras

- **Telemetria nunca bloqueia** a resposta ao usuário (envio assíncrono; se o serviço de log cair, a app continua).
- **LGPD:** log sem senha, token, documento, cartão, dado de saúde. Use ID do usuário, não nome/e-mail.
- **Erro para o usuário é genérico e útil** ("Não conseguimos salvar agora, tente de novo"); o detalhe vai pro log.
- **Feature flag como botão de emergência:** função nova e arriscada fica atrás de uma flag (variável de ambiente
  ou serviço como Unleash/Flagsmith) para desligar sem novo deploy.

## O ciclo
```
alerta / erro no Sentry / reclamação
  └► dev cola o erro no Claude (ou /corrigir <link>)
       └► teste que reproduz (vermelho) → correção → PR → deploy
            └► o erro vira teste permanente
```

## Para o Claude
Ao ligar o módulo: implemente o nível que o dev escolher, começando pelo 1. Para o nível 2, adicione o SDK do Sentry
com `release` = versão do deploy e filtro de dados pessoais (`beforeSend` / `send_default_pii=False`).
A chave do Sentry (DSN) vai em variável de ambiente; mande o dev para o site criar o projeto e copiar o DSN.
