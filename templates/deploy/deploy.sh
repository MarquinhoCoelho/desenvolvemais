#!/usr/bin/env bash
# Roda NO SERVIDOR (enviado pelo GitHub Actions via SSH).
# Uso: deploy.sh <pasta_da_app> <commit> <url_health> [comando_para_subir]
# Publica o commit exato; se o health check falhar, volta para o commit anterior.
set -euo pipefail

APP_DIR="$1"
ALVO="$2"
HEALTH_URL="$3"
SUBIR="${4:-docker compose up -d --build}"
ESPERA_MAX=60   # segundos esperando a app responder

cd "$APP_DIR"

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "ERRO: existem alterações não commitadas em $APP_DIR (feitas direto no servidor)."
  echo "Deploy cancelado para não perder essas mudanças. Arquivos:"
  git status --short --untracked-files=no
  exit 1
fi

ANTERIOR="$(git rev-parse HEAD)"
echo "Versão atual:  $ANTERIOR"
echo "Versão nova:   $ALVO"

git fetch --quiet --tags origin
git checkout --quiet "$ALVO"

saudavel() {
  local tentativas=$((ESPERA_MAX / 3))
  for _ in $(seq 1 "$tentativas"); do
    if curl -fsS -o /dev/null --max-time 5 "$HEALTH_URL"; then
      return 0
    fi
    sleep 3
  done
  return 1
}

bash -c "$SUBIR"

if saudavel; then
  echo "OK: $HEALTH_URL respondeu. Deploy concluído."
  exit 0
fi

echo "FALHOU: $HEALTH_URL não respondeu em ${ESPERA_MAX}s. Voltando para $ANTERIOR..."
git checkout --quiet "$ANTERIOR"
bash -c "$SUBIR"

if saudavel; then
  echo "Rollback automático OK: versão anterior no ar."
else
  echo "ATENÇÃO: a versão anterior também não respondeu. Verifique o servidor."
fi
exit 1
