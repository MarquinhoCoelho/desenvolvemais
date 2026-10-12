# Fluxo de uma tarefa (modo manual e tarefas arriscadas)

> Este é o fluxo **completo**. Dúvidas, tarefas triviais e o modo automático usam versões mais leves —
> veja [00-modos.md](00-modos.md). As regras de rastreabilidade e formato de achados abaixo valem para todos.

O Claude principal da conversa é o **orquestrador**: ele não escreve a feature sozinho, ele distribui
o trabalho para os agentes de [agentes/](../agentes/) e junta os resultados.

```
1. Dev pede a tarefa (ex.: "T-042: limitar o desconto a 50%")
2. planejador ─► plano em passos TDD ─► dev aprova (ou ajusta)
3. para cada passo, um de cada vez:
     implementador (contexto só daquele passo)
       ├─ escreve o teste ─► roda ─► tem que FALHAR (vermelho)
       ├─ escreve o mínimo de código ─► roda ─► tem que PASSAR (verde)
       └─ commit
     revisor-spec       ─► "fez só o pedido?"      ─► se FIX REQUIRED: volta ao implementador
     revisor-qualidade  ─► "está bem feito?"       ─► se FIX REQUIRED: volta ao implementador
4. no fim de todos os passos:
     qa-adversarial      ─► tenta quebrar o conjunto
     revisor-seguranca   ─► se ativo: true, ou auto e algum arquivo alterado bate com os caminhos dele
     revisor-ux          ─► se ativo: true, ou auto e algum arquivo alterado bate com os caminhos dele
5. revisão final do conjunto: o diff inteiro da branch faz sentido junto? sobrou debug, TODO, arquivo esquecido?
6. achados CRITICAL/HIGH ─► dev decide: corrigir (teste vermelho primeiro) ou aceitar risco por escrito
7. gates locais (mesmos da CI) ─► PR com o modelo fixo
8. mudou uma página/endpoint importante? acrescente a linha correspondente em .devmais/smoke.txt
```

## Como o orquestrador decide rodar um agente "auto"

Não é por impressão. Ele roda `git diff --name-only main...HEAD` e compara com os `caminhos` do agente em
`.devmais/config.yml`. Bateu pelo menos um arquivo → roda. Não bateu → não roda, e ele diz ao dev:
"UX não rodou: nenhum arquivo de front alterado". O dev pode sempre pedir para rodar mesmo assim.

## Quando pular etapas

Tarefa pequena (typo, texto, config de 1 linha): o orquestrador pode pular o planejador e o QA,
**mas nunca** pula os gates da CI. Ele diz ao dev que pulou e por quê.

## Formato dos achados (todos os revisores)

```
[SEVERIDADE] título curto
Onde: arquivo:linha
Como falha: entrada/situação → resultado errado
Como corrigir: uma frase
```
Severidades: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.
Recomendação final de cada revisor: `APPROVE`, `FIX REQUIRED` ou `DISCUSS`.

## Como o orquestrador fala com o dev

- **Curto e objetivo.** O que foi feito, o que falhou, o que precisa da decisão dele. Sem enrolação.
- **Só pergunta o que não dá para descobrir sozinho.** Quando pergunta, dá a opção recomendada.
- **Precisa de algo que só o dev tem** (token, URL, acesso): para e entrega o passo a passo numerado.
- **Dev pede explicação** ("explica o que você fez", "como é a arquitetura"): usa o agente `explicador`.

## Rastreabilidade

| Onde | Formato |
|---|---|
| Branch | `feature/T-042-limita-desconto` · `fix/T-051-desconto-nan` |
| Commit | `feat(desconto): limita a 50% [T-042]` (Conventional Commits) |
| PR | título com `[T-042]`, corpo no modelo fixo |
| Deploy | tag `prod-2026.10.11-1` aponta para o commit |

Se o projeto não usa Jira/Issues, o ID pode ser o número da issue do GitHub ou um ID curto inventado.
