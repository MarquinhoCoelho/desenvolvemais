# desenvolvemais

Especificação de um fluxo de desenvolvimento profissional com Claude Code: plano em TDD, agentes revisores,
QA que tenta quebrar o código, CI que bloqueia erro, deploy por branch e rollback.

Não é um framework para instalar. São documentos e modelos que **o Claude lê e adapta ao seu projeto**.

## Como usar

1. Clone este repositório em qualquer pasta do seu computador:
   ```
   git clone https://github.com/MarquinhoCoelho/desenvolvemais
   ```
2. Abra o Claude Code **dentro do seu projeto** e peça:
   > Leia `<caminho>/desenvolvemais/INSTALAR.md` e configure esse fluxo no meu projeto.
3. O Claude vai analisar o projeto, fazer algumas perguntas e mostrar o que vai criar antes de criar.
4. Quando ele precisar de algo que só você tem (token, chave, URL), ele te passa o passo a passo.

Depois de configurado, é só pedir as tarefas normalmente. O Claude segue o fluxo sozinho.

## O que tem aqui

| Pasta | Para quê |
|---|---|
| [INSTALAR.md](INSTALAR.md) | Roteiro que o Claude segue para configurar um projeto |
| [fluxo/](fluxo/) | Como o trabalho anda: princípios, tarefa, git, CI, deploy, rollback |
| [agentes/](agentes/) | Agentes prontos (planejador, implementador, revisores, QA, UX, segurança, explicador) |
| [modulos-opcionais/](modulos-opcionais/) | Ligue se fizer sentido: testes de carga, integração/E2E, segurança, UX, homologação, evals de IA |
| [templates/](templates/) | Arquivos-modelo: AGENTS.md, config, template de PR, workflows do GitHub Actions, hooks, k6 |
| [guias/](guias/) | Passo a passo para o dev: login no GitHub, secrets, chave SSH de deploy |

## O fluxo em uma imagem

```
pedido ─► planejador (passos TDD) ─► você aprova
   └► implementador: teste vermelho → código → teste verde → commit   (um passo por vez)
   └► revisor de spec: "fez só o pedido?"   ─► revisor de qualidade: "está bem feito?"
   └► QA tenta quebrar · segurança · UX (se mexeu no front)
   └► você decide os achados graves: corrige (teste primeiro) ou aceita o risco por escrito
   └► PR com modelo fixo ─► CI repete as verificações
   └► merge na main ─► CI de novo ─► deploy ─► health check ─► se falhar, volta sozinho
```

## Funciona sem GitHub Pro

Em repositório privado no plano grátis o GitHub não deixa "travar" o botão de merge.
Por isso a proteção fica **no próprio pipeline de deploy**: ele roda todos os testes de novo e só
publica se passar. Detalhes em [fluxo/05-deploy-e-rollback.md](fluxo/05-deploy-e-rollback.md).
