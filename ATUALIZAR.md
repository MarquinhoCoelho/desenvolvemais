# ATUALIZAR — roteiro para o Claude

> O kit desenvolvemais evoluiu e o dev quer trazer as melhorias para um projeto que **já foi configurado** com o INSTALAR.md.
> Projeto que ainda não tem `.devmais/config.yml` → use o [INSTALAR.md](INSTALAR.md), não este arquivo.

`<KIT>` = pasta do kit no computador do dev.

## 1. Descobrir de qual versão o projeto partiu
- Leia `kit_versao` em `.devmais/config.yml` (tag `vX.Y.Z` ou commit do kit usado na instalação).
- Atualize o kit: `git -C <KIT> pull`.
- Se `kit_versao` não existir ou não for encontrado no kit (`git -C <KIT> cat-file -e <kit_versao>` falha):
  não há base para comparar. Compare cada arquivo do projeto com o template atual e trate **toda** diferença
  como possível adaptação do projeto — pergunte ao dev em caso de dúvida.

## 2. Ver o que mudou no kit
```
git -C <KIT> log --oneline <kit_versao>..HEAD
git -C <KIT> diff --stat <kit_versao>..HEAD -- templates agentes modulos-opcionais
```
Separe em três grupos:
- **Arquivos que o projeto tem e o kit melhorou** (ex.: workflow de deploy, um agente).
- **Novidades** que o projeto ainda não tem (template, atalho, hook ou módulo opcional novo) — oferecer, não instalar direto.
- **Mudanças só de documentação** do kit — não afetam o projeto; não mexa.

## 3. Aplicar sem perder as adaptações do projeto
Para cada arquivo do primeiro grupo:
- veja **o que mudou no kit** (`git -C <KIT> diff <kit_versao>..HEAD -- <arquivo>`), não o arquivo inteiro;
- aplique essa mudança no arquivo do projeto, preservando o que o projeto adaptou (comandos, nomes, URLs, limites);
- se a mudança do kit conflita com uma adaptação do projeto, pergunte ao dev.

Nunca sobrescreva um arquivo do projeto inteiro com o template.

**Configuração nova:** se a versão nova do kit tem campos que o `.devmais/config.yml` do projeto não tem
(veja o [CHANGELOG.md](CHANGELOG.md)), acrescente com os valores padrão do template. Se o campo é uma escolha do dev
(ex.: `modo`), faça a pergunta do INSTALAR.md correspondente em vez de escolher por ele.

## 4. Mostrar e esperar o OK
Lista curta: uma linha por item, dizendo o que muda e o benefício. Novidades opcionais à parte, com recomendação.

## 5. Entregar
Branch `chore/devmais-atualizacao` → aplica → atualiza `kit_versao` para a versão atual do kit
(`git -C <KIT> describe --tags --always`) → roda os comandos da CI → abre PR listando o que mudou.
