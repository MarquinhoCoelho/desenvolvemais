# Quando algo falha

O objetivo: o dev fica sabendo **sem procurar**, entende **em poucas frases**, e pode dizer
"resolve" para o Claude corrigir pelo fluxo normal — sem pular teste nem revisão.

## 1. Falha no deploy (automático, sem chave de API)

```
merge na main
  └► CI falhou ............................ nada publicado, produção intocada
  └► publicou, health check falhou ......... servidor volta sozinho para a versão anterior
  └► publicou, teste de produção falhou .... GitHub volta para a última versão boa (tag prod-*)
        └► em qualquer falha: issue "deploy-falhou" com o diagnóstico e o link do log
              └► próxima vez que o dev abre o Claude no projeto, o hook status-deploy avisa
```

O Claude, ao ser avisado:
1. Lê a issue (`gh issue view <n>`) e o log (`gh run view <id> --log-failed`).
2. Fala com o dev em **até 4 frases**:
   > O deploy de hoje 14h falhou no teste de produção: `/api/produtos` respondeu 500.
   > A produção já voltou para a versão de ontem (`prod-2026.10.10-12`), está tudo no ar.
   > Provável causa: a migração nova renomeou a coluna `preco` e a query antiga ainda usa o nome velho.
   > Quer que eu corrija?
3. Se o dev disser que sim → passo 3 abaixo.

## 2. Bug relatado em produção (usuário, cliente, log)

Mesmo caminho: o dev descreve ou cola o erro; o Claude investiga e explica antes de mexer.

## 3. Corrigir ("pode resolver")

1. Branch `fix/<ID>-descricao` a partir da `main`.
2. **Reproduzir com um teste que falha** (unitário, integração ou uma linha nova no `smoke.txt`).
   Se não conseguir reproduzir, **não chuta**: diz ao dev o que tentou e o que precisa (log, passo a passo, dado de exemplo).
3. Corrigir o mínimo → teste verde → revisores → QA (o mesmo fluxo de tarefa).
4. PR com a seção "Achados" contando a falha e o teste que agora a cobre.
5. Merge → deploy → se passar, a issue `deploy-falhou` fecha sozinha.

A falha vira teste permanente: aquele erro não volta sem a CI pegar.

## 4. Quando o Claude NÃO deve resolver sozinho

Ele para e pede decisão do dev quando:
- a correção mexe em dado de produção (migração destrutiva, script no banco);
- o rollback automático também falhou (produção pode estar fora do ar) — prioridade é **restaurar**, não corrigir;
- a causa é fora do código (servidor sem disco, certificado vencido, serviço externo fora) — ele explica e dá o passo a passo;
- precisa alterar teste existente (contrato).

## 5. Comandos úteis (o Claude usa; o dev também pode)

| Para quê | Comando |
|---|---|
| Últimos deploys | `gh run list --workflow Deploy --limit 5` |
| Erro de um deploy | `gh run view <id> --log-failed` |
| Falhas abertas | `gh issue list --label deploy-falhou` |
| Versões publicadas | `git tag -l 'prod-*' --sort=-creatordate \| head` |
| Voltar para uma versão | `gh workflow run Rollback -f tag=prod-AAAA.MM.DD-N` |
