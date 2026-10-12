# Modos de trabalho — quanto processo cada pedido merece

O fluxo completo (plano, agentes revisores, QA) evita erro caro, mas custa tokens e tempo.
Por isso o Claude **primeiro classifica o pedido** e usa só o processo que ele merece.
O dev escolhe o modo na instalação (`.devmais/config.yml` → `modo`) e pode trocar a qualquer momento
na conversa ("faz no modo manual", "pode seguir no automático").

## 1. Classificar o pedido (sempre, antes de qualquer coisa)

| Tipo | Exemplos | Processo |
|---|---|---|
| **Conversa** | dúvida, "como funciona X?", "por que isso dá erro?", explicar código, opinião | **Nenhum.** Responde direto. Sem agentes, sem branch, sem plano. |
| **Trivial** | texto, typo, cor, config de 1 linha, renomear, até ~20 linhas sem regra de negócio | Faz direto → gates locais → branch + PR. Sem agentes. |
| **Normal** | feature, correção, refatoração com regra de negócio | Conforme o **modo** (abaixo). |
| **Arriscada** | login/permissão, pagamento, dado pessoal, migração de banco, deploy/infra, apagar dados; ou arquivo alterado bate com `agentes.revisor_seguranca.caminhos` | Fluxo completo **em qualquer modo**: plano aprovado pelo dev, QA e segurança, dev aprova o merge. |

Na dúvida entre dois tipos, escolha o de **mais** cuidado e diga ao dev em uma linha ("tratei como arriscada porque mexe em pagamento").

## 2. Modo automático (recomendado)

O Claude trabalha do jeito normal dele — rápido — e só chama o dev quando é decisão de verdade.

| Etapa | Como fica |
|---|---|
| Plano | Feito internamente. Mostrado só se o dev pedir, se a tarefa for arriscada ou se o pedido for ambíguo. |
| Implementação | O próprio Claude implementa em TDD (teste vermelho → código → verde), sem subagente por passo. |
| Revisão | **Uma** passada do agente `revisor-geral` (escopo + 7 perguntas de qualidade) sobre o diff inteiro, no fim. UX e segurança só se os caminhos baterem. QA só em tarefa arriscada. |
| Decisões | **Continuam com o dev:** regra de negócio ambígua, achado CRITICAL/HIGH, dado de produção, alterar teste existente. |
| PR e merge | Abre o PR. Com CI verde e `merge_automatico: true`, faz o merge sozinho (o deploy testa a produção e volta sozinho se falhar). Tarefa arriscada: pede OK antes do merge. |
| Retorno ao dev | **Resumo de regra de negócio**, 3 a 6 linhas (modelo abaixo). Detalhe técnico só se o dev perguntar. |

Modelo do resumo:
```
Feito: agora o desconto nunca passa de 50%; acima disso, aplica 50% e mostra o aviso "desconto máximo".
Testado: 6 casos (incluindo desconto vazio e 100%). CI verde.
Publicado: prod-2026.10.12-3 (PR #42). Produção conferida.
Decisão sua: nenhuma.      ← ou a pergunta, com a opção recomendada
```

## 3. Modo manual

O dev acompanha tudo. É o fluxo completo de [02-fluxo-de-tarefa.md](02-fluxo-de-tarefa.md):
plano aprovado → um passo por vez (`implementador`) → `revisor-spec` e `revisor-qualidade` a cada passo →
QA → dev decide os achados → PR → **dev faz o merge**. Atualização de uma linha a cada etapa.

Bom para: dev aprendendo o projeto, código crítico, ou quando o dev quer entender cada decisão.

## 4. Controle de custo (os dois modos)

O Claude Code não tem limite de tokens por agente, mas tem três controles que somados resolvem —
configurados por agente em `.devmais/config.yml` e gravados no cabeçalho de cada `.claude/agents/*.md`:

| Controle | Campo no agente | Efeito |
|---|---|---|
| Modelo | `model` | `haiku` custa uma fração do `sonnet`, que custa metade do `opus` |
| Esforço | `effort` | `low` pensa menos e gasta menos; `high` só onde o raciocínio paga |
| Teto de turnos | `maxTurns` | o agente para ao chegar no limite e devolve o que tem (marcado como parcial) |

Regras que economizam mais do que qualquer limite:
- **Agente recebe só o necessário:** o diff e os critérios de aceite, não "leia o projeto".
- **Revisor lê só os arquivos alterados** e, se precisar de contexto, só os vizinhos.
- **Não repetir trabalho:** se o revisor aprovou e nada mudou, não roda de novo.
- **Agente que parou no teto** (`maxTurns`): o orquestrador decide se o que veio basta; só retoma se faltar algo importante.
