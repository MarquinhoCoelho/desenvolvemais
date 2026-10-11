// Teste de carga com k6 (https://k6.io).
// Uso:  k6 run -e ALVO=https://meusite.com/api/health -e PERFIL=smoke carga.js
// Perfis: smoke | carga | estresse | pico | resistencia
// VIZINHOS (opcional): outras URLs no mesmo servidor, separadas por vírgula.
//   Se algum vizinho ficar lento ou falhar, o teste PARA sozinho (abortOnFail).
import http from "k6/http";
import { check, sleep } from "k6";

const ALVO = __ENV.ALVO;
const PERFIL = __ENV.PERFIL || "smoke";
const VIZINHOS = (__ENV.VIZINHOS || "").split(",").map((u) => u.trim()).filter(Boolean);
const P95_MAX = Number(__ENV.P95_MS || 1500);
const ERRO_MAX = Number(__ENV.ERRO_PCT || 5) / 100;
const VIZINHO_P95_MAX = Number(__ENV.VIZINHO_P95_MS || 2000);

if (!ALVO) throw new Error("Informe a URL: -e ALVO=https://...");

// Fases de cada perfil (duração, usuários simultâneos no fim da fase)
const PERFIS = {
  smoke:       [{ duration: "1m", target: 2 }],
  carga:       [{ duration: "2m", target: 20 }, { duration: "5m", target: 20 }, { duration: "1m", target: 0 }],
  estresse:    [{ duration: "2m", target: 20 }, { duration: "3m", target: 50 }, { duration: "3m", target: 100 }, { duration: "2m", target: 0 }],
  pico:        [{ duration: "30s", target: 5 }, { duration: "20s", target: 150 }, { duration: "1m", target: 150 }, { duration: "20s", target: 5 }, { duration: "1m", target: 5 }],
  resistencia: [{ duration: "2m", target: 15 }, { duration: "30m", target: 15 }, { duration: "2m", target: 0 }],
};
if (!PERFIS[PERFIL]) throw new Error(`Perfil desconhecido: ${PERFIL}`);

const emSegundos = (d) => {
  const [, n, unidade] = d.match(/^(\d+)(s|m|h)$/);
  return Number(n) * { s: 1, m: 60, h: 3600 }[unidade];
};
const DURACAO_TOTAL = PERFIS[PERFIL].reduce((total, fase) => total + emSegundos(fase.duration), 0);

const parar = (limite) => ({ threshold: limite, abortOnFail: true, delayAbortEval: "20s" });

export const options = {
  scenarios: {
    principal: { executor: "ramping-vus", startVUs: 0, stages: PERFIS[PERFIL], exec: "principal" },
    ...(VIZINHOS.length && {
      vizinhos: { executor: "constant-vus", vus: 1, duration: `${DURACAO_TOTAL}s`, exec: "vigiarVizinhos" },
    }),
  },
  thresholds: {
    "http_req_duration{cenario:principal}": [parar(`p(95)<${P95_MAX}`)],
    "http_req_failed{cenario:principal}": [parar(`rate<${ERRO_MAX}`)],
    ...(VIZINHOS.length && {
      "http_req_duration{cenario:vizinhos}": [parar(`p(95)<${VIZINHO_P95_MAX}`)],
      "http_req_failed{cenario:vizinhos}": [parar("rate<0.01")],
    }),
  },
};

export function principal() {
  const res = http.get(ALVO, { tags: { cenario: "principal" } });
  check(res, { "status 2xx": (r) => r.status >= 200 && r.status < 300 });
  sleep(1);
}

export function vigiarVizinhos() {
  for (const url of VIZINHOS) {
    http.get(url, { tags: { cenario: "vizinhos" } });
  }
  sleep(5);
}
