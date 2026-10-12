# UX: heurísticas de Nielsen + design system

O agente [revisor-ux](../agentes/revisor-ux.md) roda quando o diff mexe no front.

## Para funcionar bem, o projeto precisa de um design system escrito

Se não existir, o Claude cria um `docs/design-system.md` **a partir do que o projeto já usa** (não inventa um novo):

```markdown
# Design system
## Tokens
- Cores: primária, secundária, sucesso, erro, aviso, texto, fundo (com valores e nome da variável)
- Espaçamentos: escala (4, 8, 12, 16, 24, 32...)
- Tipografia: fontes, tamanhos, pesos
- Raios e sombras
## Componentes (onde ficam e quando usar)
- Botão (primário, secundário, perigo) — `src/components/Button.tsx`
- Input, Select, Modal, Toast, Tabela, Card, Estado vazio, Loading
## Padrões
- Formulário: validação ao sair do campo, mensagem embaixo do campo
- Ação destrutiva: sempre com confirmação
- Textos: tom, uso de "você", sem jargão técnico
```

Se o projeto usa Figma, o Claude pode ler tokens e componentes pelo MCP do Figma, quando disponível.

## O que o revisor confere
- Regras de acabamento (fixas): sem travessão em texto de interface, ícones com significado de uma biblioteca só,
  tooltip do projeto em vez de `title` nativo, nada de controle cru do navegador (`alert`, `select` sem estilo...),
  sempre no padrão visual do projeto (Tailwind: só classes e tokens do projeto).
  O script [`templates/ux/checar-ui.mjs`](../templates/ux/checar-ui.mjs) acha as violações mecânicas no diff;
  instale em `scripts/checar-ui.mjs` e rode na CI (passo "Acabamento da interface").
- Usa componentes e tokens do design system (sem cor/tamanho solto).
- Estados: carregando, vazio, erro, sucesso, desabilitado.
- As 10 heurísticas de Nielsen (lista completa no agente).
- Acessibilidade básica: contraste, labels, teclado, `alt`, área de toque.
- Celular: sem rolagem horizontal, botões alcançáveis.

## Opcional na CI
- **Lighthouse CI** (performance, acessibilidade, boas práticas) em cada PR.
- **axe** (acessibilidade) dentro dos testes E2E do Playwright.
