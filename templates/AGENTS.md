# AGENTS.md — regras deste projeto

> Gerado a partir do kit desenvolvemais. Adapte os comandos e números a este projeto.
> Todo agente (Claude Code, Kiro, Cursor...) lê este arquivo antes de trabalhar.

## Projeto
- Stack: <ex.: Node 20 + NestJS + PostgreSQL>
- Como rodar local: `<comando>`
- Configuração do fluxo: `.devmais/config.yml`

## Comandos
| Para quê | Comando |
|---|---|
| Instalar | `<npm ci>` |
| Lint | `<npm run lint>` |
| Tipos | `<npx tsc --noEmit>` |
| Testes + cobertura | `<npm test -- --coverage>` |
| Tudo que a CI roda | `<npm run verificar>` |

## O que conta como pronto
- [ ] Critérios de aceite atendidos e cada um provado por teste.
- [ ] Testes passam. Cobertura ≥ <85>%.
- [ ] Lint sem erro; complexidade ≤ <10> por função.
- [ ] Tipos sem erro.
- [ ] Auditoria sem vulnerabilidade alta conhecida.
- [ ] Revisão do modo aprovada (automático: `revisor-geral`; manual: spec → qualidade + QA); achados graves decididos pelo dev.
- [ ] As 7 perguntas de qualidade respondidas: utilidade, reutilização, simplicidade, testabilidade,
      legibilidade, segurança/performance, documentação (README/`.env.example` atualizados se mudou como usar).
- [ ] Revisão final do diff inteiro: sem debug, TODO solto ou arquivo esquecido.
- [ ] Página/endpoint importante alterado está no `.devmais/smoke.txt`.
- [ ] PR aberto com o modelo do projeto.

## Fluxo de trabalho
Modo do projeto: `.devmais/config.yml` → `modo` (`automatico` ou `manual`). O dev pode trocar na conversa.

**Primeiro classifique o pedido** e use só o processo que ele merece:
| Tipo | Processo |
|---|---|
| Conversa (dúvida, explicação, opinião) | Responde direto. Nenhum agente, nenhuma branch. |
| Trivial (texto, typo, config, ≤ ~20 linhas sem regra de negócio) | Faz direto → gates locais → branch + PR. Sem agentes. |
| Normal | Conforme o modo (abaixo). |
| Arriscada (login, permissão, pagamento, dado pessoal, migração, infra, apagar dados; ou caminhos de `revisor_seguranca`) | Fluxo completo em qualquer modo: plano aprovado, QA + segurança, dev aprova o merge. |
Na dúvida, escolha o tipo de mais cuidado e diga qual em uma linha.

**Modo automático:** planeje internamente (mostre o plano só se pedirem, se for arriscada ou ambígua) → implemente
você mesmo em TDD → no fim, **uma** revisão com `revisor-geral` (+ `revisor-ux`/`revisor-seguranca` se os caminhos
baterem) → PR → com CI verde e `merge_automatico: true`, faça o merge → responda com o **resumo de regra de negócio**:
```
Feito: <o que mudou para o usuário / na regra, em 1-2 frases>
Testado: <quantos casos, quais bordas>. CI verde.
Publicado: <tag ou PR>. Produção conferida.
Decisão sua: <nenhuma | a pergunta, com a opção recomendada>
```
Detalhe técnico só se o dev perguntar.

**Modo manual:** `planejador` → dev aprova → um passo por vez com `implementador` → `revisor-spec` → `revisor-qualidade`
→ no fim `qa-adversarial` (+ UX/segurança por caminhos) → PR → o dev faz o merge. Uma linha de atualização por etapa.

**Teste completo sob pedido:** se o dev pedir "teste completo", "revisão completa" ou "capricha nos testes", faça
**essa** tarefa com o fluxo completo (plano, QA adversarial, segurança e UX pelos caminhos), sem trocar o `modo`.
Na tarefa seguinte, volta ao modo da config.

**Em qualquer modo, decisão é do dev:** regra de negócio ambígua, achado CRITICAL/HIGH (corrigir com teste primeiro
ou aceitar o risco por escrito no PR), dado de produção, alterar teste existente.

## Git
- Nunca commitar nem dar push direto na `main`. Sempre branch + PR.
- Branch: `feature/<ID>-descricao`, `fix/<ID>-descricao`.
- Commit: `tipo(escopo): descrição [<ID>]` (Conventional Commits).
- PR pequeno; merge com squash.

## Testes são o contrato
- Proibido alterar teste existente para fazê-lo passar.
- Mudar um teste existente exige OK explícito do dev e aviso na seção "Testes alterados" do PR.

## Quando algo falha
- Deploy com falha volta sozinho para a versão anterior e abre uma issue `deploy-falhou`.
  Ao abrir a conversa, o hook `status-deploy` avisa — explique ao dev em até 4 frases (onde, causa provável,
  produção está segura?) e pergunte se ele quer que você corrija.
- Corrigir = branch `fix/...` → **teste que reproduz e falha** → correção mínima → revisores → PR.
  Não conseguiu reproduzir? Não chute: diga o que tentou e o que precisa.
- Não corrija sozinho (peça decisão) se envolver: dado de produção, produção fora do ar, causa fora do código,
  ou alterar teste existente.
- Comandos: `gh run list --workflow Deploy`, `gh run view <id> --log-failed`, `gh issue list --label deploy-falhou`.

## Atalhos para o dev
`/tarefa <descrição>` · `/status` · `/corrigir [issue ou erro]` · `/explicar [o quê]` · `/rollback [tag]`

## Segurança
- Nunca colocar senha, token ou chave em arquivo versionado. Use `.env` (fora do git) ou GitHub Secrets.
- Nunca logar senha, token ou dado pessoal.
- Servidor de produção: só comandos de leitura sem pedir. Qualquer alteração precisa de OK do dev.

## Como responder ao dev
- Português, curto e objetivo: o que foi feito, o que falhou, o que precisa da decisão dele.
- **Linguagem simples, sem jargão.** Escreva como para alguém que não programa. Termo técnico só se for
  indispensável, e explicado em poucas palavras. Nome de arquivo, comando e número de linha só se o dev pedir.
- **Quando precisar de uma decisão**, use sempre este formato, no máximo 4 linhas:
  ```
  Preciso do seu OK: <o que você quer fazer, em palavras simples>
  É seguro? <sim/não e por quê, em 1 frase>
  Recomendo: <sim/não>
  Para autorizar, responda: "<frase pronta para copiar>"
  ```
- Não enrolar, não repetir o que ele já sabe, não afirmar sem ter verificado.
- Pergunta só o que não dá para descobrir sozinho, sempre com a opção recomendada.
- Se precisar de algo que só o dev tem (token, URL, acesso): parar e dar o passo a passo numerado.
- Se o dev pedir explicação do que foi feito ou da arquitetura: usar o agente `explicador`.
