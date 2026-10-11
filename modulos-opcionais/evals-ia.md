# Evals — para produtos que usam LLM/agente

Se o **produto** usa IA (chatbot, assistente, classificação, extração), teste unitário não basta:
a mesma entrada pode gerar respostas diferentes. Evals medem se o comportamento continua certo.

## Regras de arquitetura (da palestra)
- **O modelo entende o pedido e escolhe a ação. Permissão, ordem dos passos e dados ficam com o código.**
- Onde dá, a regra vira código; o que não dá vai para o prompt; o que dá para medir vira eval.
- **Fail-closed:** na dúvida, não executa. Sem dado confiável, bloqueia.
- Erro para o usuário é decidido pelo código (mensagem pronta e útil), detalhe técnico só no log.
- Nada interno na tela: sem ID de banco, nome de serviço ou stack trace na resposta.
- Uma skill/ferramenta por tarefa; cada uma com sua política de risco.

## Os 6 casos mínimos por skill/funcionalidade de IA
| Caso | Confere |
|---|---|
| Caminho feliz | do pedido à conclusão, sem desvio |
| Sem permissão | recusa quando o usuário/cliente não tem acesso |
| Sistema externo simulado | funciona com o serviço falso previsível, e falha bem quando ele cai |
| Ferramentas chamadas | **quais** tools e em **qual ordem** (verificação por código, determinística) |
| Feature flag | funciona ligada e desligada |
| Fim da conversa | encerra pelo motivo certo |

## Tipos de avaliador
- **Por código:** ordem das tool calls, formato da resposta, termos proibidos, tamanho máximo. Preferir sempre que possível.
- **LLM como juiz:** tom, clareza, se respondeu a pergunta. Use com rubrica escrita e um modelo diferente do testado.
- **Usuário simulado:** outro LLM faz o papel do cliente com um roteiro, para testar conversas inteiras.

## Baseline
Guarde os resultados de referência no repositório. Se um resultado mudar, atualizar o baseline é
**aceitar a mudança por escrito** (fica no PR).

## Rastreabilidade
Tarefa → manifesto da skill (risco por ação) → ID do cenário de eval → nome do evento no log → sintoma em produção.
Use o mesmo nome de evento no código e no monitoramento.
