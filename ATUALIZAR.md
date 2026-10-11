# ATUALIZAR — roteiro para o Claude

> O kit desenvolvemais evoluiu e o dev quer trazer as melhorias para um projeto que já foi configurado.

1. Leia `kit_versao` em `.devmais/config.yml` do projeto (commit do kit usado na instalação).
2. No kit: `git -C <KIT> pull` e depois `git -C <KIT> log --oneline <kit_versao>..HEAD` e
   `git -C <KIT> diff --stat <kit_versao>..HEAD -- templates agentes`.
3. Para cada arquivo do kit que mudou e existe no projeto:
   - compare com a versão do projeto, que **foi adaptada** (comandos, nomes, limites);
   - aplique só a melhoria do kit, preservando as adaptações do projeto.
4. Mostre ao dev a lista do que vai mudar, uma linha por item, e espere o OK.
5. Aplique numa branch `chore/devmais-atualizacao`, atualize `kit_versao` com o commit atual do kit, rode os comandos da CI e abra PR.

Nunca sobrescreva arquivo do projeto inteiro com o template: o projeto pode ter ajustes que o kit não conhece.
