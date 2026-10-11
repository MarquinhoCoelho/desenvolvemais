# Token do GitHub (só se não quiser usar o `gh auth login`)

Prefira o [github-login.md](github-login.md). Use token apenas se o `gh` não for possível.

1. Acesse https://github.com/settings/personal-access-tokens/new
   (ou: foto → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**).
2. **Token name:** `claude-<nome-do-projeto>`.
3. **Expiration:** 90 dias.
4. **Resource owner:** a conta dona do repositório.
5. **Repository access:** **Only select repositories** → escolha só os projetos que o Claude vai mexer.
6. **Permissions → Repository permissions:**
   | Permissão | Nível |
   |---|---|
   | Contents | Read and write |
   | Pull requests | Read and write |
   | Actions | Read and write |
   | Workflows | Read and write |
   | Secrets | Read and write |
   | Variables | Read and write |
   | Metadata | Read-only (vem automático) |
7. **Generate token** e copie (aparece uma vez só).
8. Use no terminal:
   ```
   gh auth login --with-token
   ```
   cole o token e aperte Enter, depois `Ctrl+Z` + Enter (Windows) ou `Ctrl+D` (Mac/Linux).

**Nunca** cole o token em arquivo dentro do projeto, nem em mensagem de commit, nem no chat de outra ferramenta.
Se vazou: https://github.com/settings/personal-access-tokens → **Revoke**.
