# Módulos opcionais

O fluxo básico (planejar → TDD → revisões → QA → CI → deploy) vale para todo projeto.
Estes módulos o dev liga conforme o contexto, em `.devmais/config.yml` → `modulos`.

| Módulo | Ligar quando | Custo |
|---|---|---|
| [testes-unitarios.md](testes-unitarios.md) | sempre (é a base); este arquivo ensina a melhorar a cobertura | baixo |
| [testes-integracao-e2e.md](testes-integracao-e2e.md) | tem API com banco, ou telas com fluxos importantes (login, pagamento) | médio |
| [testes-carga.md](testes-carga.md) | sistema com tráfego real, antes de campanha/lançamento, ou após mudança de performance | médio |
| [seguranca.md](seguranca.md) | sempre que tiver login, dados de usuário ou pagamento | baixo |
| [ux.md](ux.md) | projeto com front-end | baixo |
| [homologacao.md](homologacao.md) | cliente precisa aprovar antes, ou mudanças de alto risco frequentes | alto (mais um ambiente) |
| [revisao-claude-no-pr.md](revisao-claude-no-pr.md) | time com mais de um dev, ou PRs de outras pessoas | uso de API a cada PR |
| [evals-ia.md](evals-ia.md) | o produto usa LLM/agente (chatbot, assistente, classificação) | médio |
