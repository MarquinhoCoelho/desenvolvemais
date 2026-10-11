# Princípios

Base de todo o fluxo. Vêm da palestra "Desenvolvimento com Agentes / Os Dois Sistemas".

1. **LLM não é determinístico.** A mesma pergunta pode dar respostas diferentes. Por isso o que precisa sair
   sempre igual é conferido por **código** (teste, lint, CI), não pela palavra do agente.
2. **Onde dá, a regra vira código.** O que não dá vira instrução no prompt/AGENTS.md. O que dá para medir vira teste ou eval.
   Ordem de força: código > teste > instrução.
3. **"Pronto" está escrito no repositório** (`AGENTS.md`) e é conferido por agente **e** por ferramenta.
4. **Uma tarefa por vez, com contexto limpo.** Cada passo é feito por um subagente novo que recebe só o que precisa.
5. **Revisão em duas etapas e nessa ordem:** primeiro "fez só o que pediram?" (spec), depois "está bem feito?" (qualidade).
   Não adianta polir código que nem devia existir.
6. **QA independente tenta quebrar.** Quem escreveu não testa o próprio trabalho.
7. **Achado vira teste vermelho antes da correção.** Corrigir no escuro não prova nada.
8. **Testes são o contrato.** Mudar teste para ficar verde (ex.: `toBe(90)` → `toBeDefined()`) é proibido.
   Alterar teste exige OK do dev e aviso no PR.
9. **A decisão sobre achado grave é humana.** O dev corrige (teste primeiro) ou aceita o risco **por escrito** no PR.
10. **CI bloqueia sozinha.** Deploy só acontece se tudo passar.
11. **Fail-closed: na dúvida, não executa.** Deploy que não responde no health check volta para a versão anterior.
12. **Modelo certo para cada tarefa.** Barato e rápido para tarefa mecânica; mais capaz para planejar e revisar.
13. **Rastreabilidade.** O ID da tarefa aparece na branch, nos commits, no PR e na tag do deploy.
    Um problema em produção leva até o commit e a tarefa de origem.
14. **PR pequeno.** PR de 10 linhas recebe 14 comentários; PR de 500 linhas recebe "LGTM". Divida.
