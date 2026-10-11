# Segurança

Três camadas: o agente [revisor-seguranca](../agentes/revisor-seguranca.md) no fluxo,
ferramentas automáticas na CI e um checklist do servidor.

## Na CI (gratuito, também em repositório privado)

| Ferramenta | Pega | Job |
|---|---|---|
| `npm audit` / `pip-audit` | dependência com vulnerabilidade conhecida | já está no CI básico |
| **gitleaks** | senha/token commitado por engano | abaixo |
| **Semgrep** (regras OWASP) | injeção, XSS, crypto fraca, etc. no código | abaixo |

```yaml
  seguranca:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - name: Segredos no histórico (gitleaks)
        run: |
          docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:v8.21.2 detect --source /repo --redact --exit-code 1
      - name: Análise de código (Semgrep)
        run: |
          pip install semgrep
          semgrep scan --config p/owasp-top-ten --config p/secrets --error
```
Na primeira execução, o Claude revisa os achados com o dev: o que é real vira tarefa, o que é falso positivo é marcado.

## Checklist rápido da aplicação
- Senha com bcrypt/argon2. Nunca MD5/SHA1/texto puro.
- Toda rota confere **quem é** (autenticação) e **se pode** (autorização) — inclusive se o recurso é do usuário (IDOR).
- Consultas ao banco sempre parametrizadas / ORM.
- Limite de tentativas em login, reset de senha e envio de código.
- Headers de segurança (helmet no Node; CSP, HSTS, X-Content-Type-Options).
- Erro para o usuário é genérico; detalhe vai só para o log. Log sem senha, token ou dado pessoal.
- Upload: valida tipo e tamanho, salva fora da pasta pública, nome gerado pelo servidor.
- Segredos só em `.env` (no `.gitignore`) ou GitHub Secrets.

## Checklist do servidor (VPS)
- Login por chave SSH; senha e root desligados (`PasswordAuthentication no`, `PermitRootLogin prohibit-password`).
- fail2ban instalado.
- **Docker ignora o firewall (UFW).** Porta publicada como `"5432:5432"` fica aberta para a internet mesmo com UFW ativo.
  Banco e serviços internos: publique em `127.0.0.1:5432:5432` ou nem publique (use a rede do docker).
- Só 22, 80 e 443 abertos para fora; o resto atrás do nginx.
- Atualizações de segurança automáticas (`unattended-upgrades`).
- Backup do banco testado (restaurar de verdade pelo menos uma vez).

## Referências
- OWASP Top 10: https://owasp.org/Top10/ (repo: https://github.com/OWASP/Top10)
- OWASP Cheat Sheets: https://cheatsheetseries.owasp.org (repo: https://github.com/OWASP/CheatSheetSeries)
- Exercícios práticos (injeção, SSRF, identificação, criptografia): https://github.com/fabriciosantana/stsw
