# Preparar deploy automático por SSH (VPS)

Resultado: o GitHub Actions entra no servidor com um usuário próprio (`deploy`), sem senha e sem root,
e só consegue o que esse usuário pode.

> O Claude pode fazer os passos 1 a 3 por você **se você autorizar** mexer no servidor.
> Ele mostra cada comando antes de rodar.

## 1. Criar o usuário de deploy no servidor
Entre no servidor (como root ou com sudo) e rode:
```bash
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy                       # para rodar docker compose
chown -R deploy:deploy /opt/MEU_PROJETO         # a pasta do projeto passa a ser do deploy
```
> Estar no grupo `docker` dá muito poder no servidor. Por isso essa chave fica só no GitHub Secrets.

## 2. Criar a chave SSH que o GitHub vai usar
No seu computador (PowerShell ou terminal):
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f deploy_key -N ""
```
Gera dois arquivos: `deploy_key` (privada) e `deploy_key.pub` (pública).

Coloque a **pública** no servidor:
```bash
# no servidor
mkdir -p /home/deploy/.ssh
nano /home/deploy/.ssh/authorized_keys     # cole o conteúdo de deploy_key.pub, salve
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
```
Teste do seu computador: `ssh -i deploy_key deploy@IP_DO_SERVIDOR` → tem que entrar sem pedir senha.

## 3. Deixar o servidor baixar o código do GitHub
O usuário `deploy` precisa ler o repositório (repositório privado):
```bash
# no servidor, como deploy
sudo -u deploy ssh-keygen -t ed25519 -f /home/deploy/.ssh/github -N ""
cat /home/deploy/.ssh/github.pub
```
No GitHub: repositório → **Settings** → **Deploy keys** → **Add deploy key** → cole → **não** marque "Allow write access".

Ainda no servidor:
```bash
sudo -u deploy tee /home/deploy/.ssh/config <<'EOF'
Host github.com
  IdentityFile ~/.ssh/github
  IdentitiesOnly yes
EOF
cd /opt/MEU_PROJETO
sudo -u deploy git remote set-url origin git@github.com:CONTA/REPO.git
sudo -u deploy git fetch      # na primeira vez pergunta "yes" para confiar no github.com
```

## 4. Pegar a "impressão digital" do servidor
No seu computador:
```bash
ssh-keyscan -t ed25519 IP_DO_SERVIDOR
```
Copie a linha que aparece (começa com o IP). Ela evita que o GitHub conecte num servidor falso.

## 5. Cadastrar no GitHub
Repositório → **Settings** → **Secrets and variables** → **Actions**.

Aba **Secrets** → **New repository secret**:
| Nome | Valor |
|---|---|
| `DEPLOY_HOST` | IP do servidor |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_SSH_KEY` | conteúdo **inteiro** do arquivo `deploy_key` (privada), incluindo as linhas BEGIN/END |
| `DEPLOY_KNOWN_HOSTS` | a linha do passo 4 |

Aba **Variables** → **New repository variable**:
| Nome | Exemplo |
|---|---|
| `DEPLOY_PATH` | `/opt/MEU_PROJETO` |
| `HEALTHCHECK_URL` | `http://127.0.0.1:3000/health` (endereço que responde 200 quando a app está ok) |
| `DEPLOY_COMANDO_SUBIR` | (opcional) padrão `docker compose up -d --build` |

Com o `gh` logado, o Claude cadastra tudo isso por você (`gh secret set` / `gh variable set`).

## 6. Apagar a chave privada do seu computador
Depois de cadastrar, apague `deploy_key` do seu computador. Se precisar de novo, gere outra.

## Pronto
Faça um merge na `main` e acompanhe em **Actions**. Se der erro, mande o link do run para o Claude.
