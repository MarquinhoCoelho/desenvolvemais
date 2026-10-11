# Git e branches

## Modelo padrão (simples)

```
main ─────────●───────────●──────────●────►   = produção (cada merge publica)
               \         /            \
feature/T-042   ●──●──●─┘              ...
```

- `main` é sempre o que está em produção.
- Todo trabalho nasce numa branch a partir da `main` e volta por **Pull Request**.
- PR é mesclado com **squash** (1 commit por PR = histórico legível).
- Merge na `main` dispara o deploy ([05-deploy-e-rollback.md](05-deploy-e-rollback.md)).

## Modelo com homologação (opcional)

Só se o projeto tiver ambiente de homologação ([../modulos-opcionais/homologacao.md](../modulos-opcionais/homologacao.md)):

```
feature/* ──PR──► develop ──(deploy homologação)
                    └──PR──► main ──(deploy produção)
```

## Worktree por tarefa

Para tarefas em paralelo, cada uma ganha uma pasta própria sem precisar clonar de novo:

```
git worktree add ../projeto-T-042 -b feature/T-042-limita-desconto
# ... trabalho ...
git worktree remove ../projeto-T-042    # depois do merge
```

O Claude Code também cria worktree sozinho para subagentes (`isolation: worktree`).

## Commits

Padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/): `tipo(escopo): descrição [ID]`.
Tipos: `feat`, `fix`, `test`, `refactor`, `docs`, `chore`, `ci`, `perf`.
Teste e correção podem ir em commits separados (mostra que o teste falhou antes).

## Sem GitHub Pro

No plano grátis, repositório **privado** não tem proteção de branch (dá para dar push direto na `main`).
Combinado do fluxo:
- O Claude **nunca** dá push direto na `main`; sempre PR. Isso está no `AGENTS.md`.
- O deploy roda os testes de novo antes de publicar. Push direto com erro não chega em produção.
- Repositório **público** tem proteção de branch grátis: se o projeto for público, ative
  (Settings → Branches → Add rule → `main` → "Require status checks to pass").
