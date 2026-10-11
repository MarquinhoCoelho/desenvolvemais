#!/usr/bin/env bash
# Testa a produção de fora, logo depois do deploy (roda na máquina do GitHub Actions).
# Uso: smoke.sh <arquivo>   (padrão: .devmais/smoke.txt)
# Cada linha do arquivo:  URL  STATUS  [TEMPO_MAX_MS]  [TEXTO QUE DEVE APARECER NA PÁGINA]
# Linhas vazias e começando com # são ignoradas.
set -uo pipefail

ARQUIVO="${1:-.devmais/smoke.txt}"
TENTATIVAS=3
falhas=0

if [ ! -f "$ARQUIVO" ]; then
  echo "Sem $ARQUIVO: nenhuma verificação de produção configurada."
  exit 0
fi

while read -r url status tempo_max texto || [ -n "${url:-}" ]; do
  [[ -z "${url:-}" || "$url" == \#* ]] && continue
  tempo_max="${tempo_max:-3000}"
  ok=0
  for _ in $(seq 1 "$TENTATIVAS"); do
    corpo="$(mktemp)"
    resultado="$(curl -sS -o "$corpo" -w '%{http_code} %{time_total}' --max-time 15 "$url" 2>/dev/null || true)"
    codigo="${resultado%% *}"
    ms="$(awk -v s="${resultado##* }" 'BEGIN { printf "%d", s * 1000 }')"
    if [ "$codigo" = "$status" ] && [ "$ms" -le "$tempo_max" ] \
       && { [ -z "${texto:-}" ] || grep -qF -- "$texto" "$corpo"; }; then
      ok=1
    fi
    rm -f "$corpo"
    [ "$ok" = 1 ] && break
    sleep 5
  done

  [ "${codigo:-000}" = "000" ] && codigo="sem resposta"
  if [ "$ok" = 1 ]; then
    echo "OK    $url ($codigo em ${ms}ms)"
  else
    echo "FALHA $url — esperado $status em até ${tempo_max}ms${texto:+ contendo \"$texto\"}; veio ${codigo:-sem resposta} em ${ms}ms"
    falhas=$((falhas + 1))
  fi
done < "$ARQUIVO"

if [ "$falhas" -gt 0 ]; then
  echo "$falhas verificação(ões) de produção falharam."
  exit 1
fi
echo "Produção respondeu como esperado."
