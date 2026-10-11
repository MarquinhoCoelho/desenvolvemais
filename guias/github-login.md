# Login no GitHub pelo terminal (gh)

Com o `gh` logado, o Claude consegue abrir PR, ver o resultado da CI e cadastrar secrets por você.
Não precisa criar token na mão.

## Windows
1. Instale: abra o PowerShell e rode
   ```
   winget install GitHub.cli
   ```
2. **Feche o terminal e abra de novo** (no VS Code: feche o VS Code inteiro e abra de novo).
   O terminal só enxerga programas novos depois de reaberto.
   - Se ainda der "gh não é reconhecido", use o caminho completo:
     `& "C:\Program Files\GitHub CLI\gh.exe" auth login`
3. Rode:
   ```
   gh auth login
   ```
4. Responda:
   - Where do you use GitHub? → **GitHub.com**
   - Preferred protocol → **HTTPS**
   - Authenticate Git with your GitHub credentials? → **Yes**
   - How would you like to authenticate? → **Login with a web browser**
5. Ele mostra um código de 8 letras (ex.: `ABCD-1234`). Aperte Enter, o navegador abre.
6. No navegador, **confira se está logado na conta certa** (canto superior direito). Cole o código e autorize.
7. Confira:
   ```
   gh auth status
   ```
   Deve aparecer `Logged in to github.com account <sua-conta>`.

## Mac / Linux
`brew install gh` (Mac) ou `sudo apt install gh` (Ubuntu), depois os passos 3 a 7.

## Tem mais de uma conta no GitHub?
- `gh auth login` de novo adiciona a outra conta; `gh auth switch` troca entre elas.
- Para o `git push` não perguntar qual conta usar, dentro do projeto rode:
  ```
  git config --local credential.https://github.com.username SUA_CONTA
  ```
