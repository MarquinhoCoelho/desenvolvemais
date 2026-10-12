# desenvolvemais

Especificação de um fluxo de desenvolvimento profissional com Claude Code: plano em TDD, agentes revisores,
QA que tenta quebrar o código, CI que bloqueia erro, deploy automático que testa a produção, volta sozinho
quando algo dá errado e avisa o dev com a explicação.

Não é um framework para instalar. São documentos e modelos que **o Claude lê e adapta ao seu projeto**.
Funciona com a assinatura do Claude Code e o GitHub grátis. **Não precisa de chave de API.**

## Como usar

1. Clone este repositório em qualquer pasta do seu computador:
   ```
   git clone https://github.com/MarquinhoCoelho/desenvolvemais
   ```
2. Abra o Claude Code **dentro do seu projeto** e peça:
   > Leia `<caminho>/desenvolvemais/INSTALAR.md` e configure esse fluxo no meu projeto.
3. O Claude analisa o projeto, faz algumas perguntas e mostra o que vai criar antes de criar.
4. Quando ele precisar de algo que só você tem (login, chave, URL), ele te passa o passo a passo.

Para trazer melhorias novas do kit para um projeto já configurado:
> Leia `<caminho>/desenvolvemais/ATUALIZAR.md` e atualize meu projeto.

## No dia a dia

Na instalação você escolhe o **modo** ([fluxo/00-modos.md](fluxo/00-modos.md)):
- **Automático (recomendado):** o Claude trabalha do jeito normal dele, revisa no fim, publica quando os testes passam
  e te manda um resumo do que mudou na regra de negócio. Só te chama para decidir.
- **Manual:** você aprova o plano, acompanha cada etapa e faz o merge.

Dúvida e conversa nunca passam pelo fluxo. Tarefa arriscada (pagamento, login, dados, banco) sempre passa pelo fluxo completo.
Cada agente tem teto de turnos, esforço e modelo configuráveis, para o custo não sair do controle.

| Você digita | O que acontece |
|---|---|
| `/tarefa <descrição>` | executa no modo do projeto (automático: direto + revisão + resumo; manual: plano, etapas, você aprova) |
| `/status` | produção, últimos deploys, falhas abertas, PRs |
| `/corrigir` | investiga a última falha, explica e corrige com teste primeiro |
| `/explicar [o quê]` | explica o que foi feito ou a arquitetura |
| `/rollback [versão]` | volta a produção para uma versão anterior |

Sozinho, sem você pedir:
- CI em todo PR; deploy no merge na `main`;
- teste da produção depois de cada deploy; **volta automática** se algo falhar;
- aviso da falha com diagnóstico, que o Claude te explica ao abrir a próxima conversa;
- trava que impede o Claude de alterar teste existente sem sua confirmação ou de mexer direto na `main`.

## O que tem aqui

| Arquivo/pasta | Para quê |
|---|---|
| [INSTALAR.md](INSTALAR.md) · [ATUALIZAR.md](ATUALIZAR.md) | Roteiros que o Claude segue |
| [fluxo/](fluxo/) | Como o trabalho anda: princípios, tarefa, git, CI, deploy, quando algo falha |
| [agentes/](agentes/) | Planejador, implementador, revisores, QA, UX, segurança, explicador |
| [modulos-opcionais/](modulos-opcionais/) | Liga se fizer sentido: carga, integração/E2E, segurança, UX, observabilidade, homologação, evals de IA |
| [templates/](templates/) | Modelos: AGENTS.md, config, PR, workflows, scripts de deploy e teste de produção, hooks, atalhos |
| [guias/](guias/) | Passo a passo para o dev: login no GitHub, token, preparar o servidor |

## O fluxo em uma imagem

```
pedido ─► planejador (passos TDD) ─► você aprova
   └► implementador: teste vermelho → código → teste verde → commit   (um passo por vez)
   └► revisor de spec: "fez só o pedido?"   ─► revisor de qualidade: "está bem feito?"
   └► QA tenta quebrar · segurança · UX (se mexeu no front) · revisão final do conjunto
   └► você decide os achados graves: corrige (teste primeiro) ou aceita o risco por escrito
   └► PR com modelo fixo ─► CI
   └► merge ─► CI de novo ─► deploy ─► testa produção ─► falhou? volta sozinho + te avisa
```

## Funciona sem GitHub Pro

Em repositório privado no plano grátis o GitHub não deixa "travar" o botão de merge.
Por isso a proteção fica **no próprio pipeline de deploy**: ele roda todos os testes de novo e só
publica se passar. Detalhes em [fluxo/05-deploy-e-rollback.md](fluxo/05-deploy-e-rollback.md).

Origem das ideias: palestra "Desenvolvimento com Agentes / Os Dois Sistemas"; testes:
[stsw](https://github.com/fabriciosantana/stsw); segurança: [OWASP Top 10](https://owasp.org/Top10/) e
[Cheat Sheets](https://cheatsheetseries.owasp.org).

## Contribuir com o kit

Achou bug ou melhoria usando o kit num projeto? Abra um PR aqui com o caso de teste em `testes/`.
Antes: `node --test "testes/*.test.mjs"` (a CI do kit roda o mesmo em todo PR). Registre a mudança no [CHANGELOG.md](CHANGELOG.md).
