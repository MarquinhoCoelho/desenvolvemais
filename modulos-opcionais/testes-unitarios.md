# Testes unitários e cobertura

## Para o Claude: como subir a cobertura de um projeto

1. Rode a cobertura e liste os arquivos com **menor cobertura e maior risco** (regra de negócio, cálculo, permissão, dinheiro).
   Não comece por arquivo de configuração ou código gerado.
2. Para cada arquivo, escreva testes usando as técnicas abaixo, não "um teste por função".
3. Teste o **comportamento** (entrada → saída/efeito), não detalhes internos. Teste que quebra a cada refatoração atrapalha.
4. Exclua da cobertura o que não faz sentido medir (arquivos gerados, migrations, `main`/bootstrap) — e diga quais excluiu.
5. Suba o gate de cobertura junto com o progresso real.

## Técnicas (caixa-preta: pela especificação)

- **Partição de equivalência:** divida as entradas em grupos que se comportam igual e teste um de cada.
  Ex.: desconto → negativo | 0 | 1–50 | acima de 50 | não informado.
- **Análise de valor-limite (BVA):** erros moram nas bordas. Teste o limite, um abaixo e um acima.
  Ex.: teto 50% → 49, 50, 51.
- **Tabela de decisão:** quando várias condições se combinam (perfil × status × plano), uma linha por combinação relevante.
- **Entradas inválidas:** `null`, `undefined`, string vazia, tipo errado, texto enorme, caracteres especiais.

## Técnicas (caixa-branca: pelo código)

| Critério | Garante |
|---|---|
| Comando (statement) | toda linha executou ao menos uma vez |
| Decisão (branch) | todo `if` foi verdadeiro e falso |
| Condição | cada parte de `a && b` foi verdadeira e falsa |
| Caminho | combinações de caminhos importantes |

Cobertura de linhas alta com cobertura de branch baixa = teste fraco. Configure o gate para **branches** também.

## Teste que prova de verdade

- Todo teste tem asserção específica (`toBe(100)`, não `toBeDefined()`).
- Pergunta-chave: **se eu colocar um bug aqui, esse teste falha?**
- Opcional, para quem quer ir além: **teste de mutação** (Stryker para JS/TS, mutmut para Python) cria bugs
  de propósito e mede quantos os testes pegam.

## BDD (opcional)

Para regras de negócio que o cliente/PO precisa ler, escreva cenários em Gherkin (`Dado / Quando / Então`)
com Cucumber (JS/Java) ou pytest-bdd (Python).

Referência com exemplos práticos de todas essas técnicas: https://github.com/fabriciosantana/stsw
