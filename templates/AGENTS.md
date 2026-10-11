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
- [ ] Revisões (spec → qualidade) aprovadas; QA rodado; achados graves decididos pelo dev.
- [ ] PR aberto com o modelo do projeto.

## Fluxo de trabalho
- Tarefa não trivial: use o agente `planejador` antes de codar e espere o dev aprovar o plano.
- Implemente **um passo por vez** com o agente `implementador` (TDD: teste vermelho → código → verde → commit).
- Depois de cada passo: `revisor-spec`, depois `revisor-qualidade`.
- No fim: `qa-adversarial` (+ `revisor-seguranca` e `revisor-ux` quando ligados e relevantes).
- Achado CRITICAL/HIGH: o dev decide — corrigir (teste primeiro) ou aceitar o risco por escrito no PR.

## Git
- Nunca commitar nem dar push direto na `main`. Sempre branch + PR.
- Branch: `feature/<ID>-descricao`, `fix/<ID>-descricao`.
- Commit: `tipo(escopo): descrição [<ID>]` (Conventional Commits).
- PR pequeno; merge com squash.

## Testes são o contrato
- Proibido alterar teste existente para fazê-lo passar.
- Mudar um teste existente exige OK explícito do dev e aviso na seção "Testes alterados" do PR.

## Segurança
- Nunca colocar senha, token ou chave em arquivo versionado. Use `.env` (fora do git) ou GitHub Secrets.
- Nunca logar senha, token ou dado pessoal.
- Servidor de produção: só comandos de leitura sem pedir. Qualquer alteração precisa de OK do dev.

## Como responder ao dev
- Português, curto e objetivo: o que foi feito, o que falhou, o que precisa da decisão dele.
- Não enrolar, não repetir o que ele já sabe, não afirmar sem ter verificado.
- Pergunta só o que não dá para descobrir sozinho, sempre com a opção recomendada.
- Se precisar de algo que só o dev tem (token, URL, acesso): parar e dar o passo a passo numerado.
- Se o dev pedir explicação do que foi feito ou da arquitetura: usar o agente `explicador`.
