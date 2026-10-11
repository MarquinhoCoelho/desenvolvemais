# Testes de carga, estresse e pico

Ferramenta: **k6**. Modelos: [templates/k6/carga.js](../templates/k6/carga.js) e
[templates/github/workflows/carga.yml](../templates/github/workflows/carga.yml).

## Perfis

| Perfil | Pergunta que responde | Duração |
|---|---|---|
| smoke | "funciona sob carga mínima?" (2 usuários) | 1 min |
| carga | "aguenta o uso normal esperado?" | ~8 min |
| estresse | "onde começa a quebrar?" (sobe até 100) | ~10 min |
| pico | "aguenta uma enxurrada repentina?" (5 → 150 em 20 s) | ~3 min |
| resistência | "degrada com o tempo?" (vazamento de memória, conexões) | ~34 min |

Os números são ponto de partida. O Claude ajusta ao tráfego real do projeto.

## Regra de ouro: não derrubar o servidor dos outros

Muitos devs têm **vários sistemas no mesmo VPS**. Carga pesada num deles deixa todos lentos.

1. **O gerador roda fora do servidor** (máquina do GitHub Actions ou do dev). Nunca rode k6 dentro do VPS.
2. **Em produção, só `smoke`.** Os perfis pesados pedem confirmação no workflow.
3. **Vigia dos vizinhos:** informe as URLs dos outros sites do mesmo servidor (`VIZINHOS`).
   Se algum ficar lento (p95 > 2 s) ou falhar, o k6 **para o teste sozinho**.
4. **Teste pesado sem homologação?** Suba uma cópia da aplicação no servidor com limite de recursos,
   assim o pior caso fica preso naquela cota:
   ```yaml
   # docker-compose.carga.yml
   services:
     app:
       cpus: "0.5"
       mem_limit: 512m
   ```
   Use banco de teste, nunca o de produção. Remova a cópia depois.
5. **Horário de menor uso** (madrugada) e avisando quem precisa saber.
6. Antes de começar, confira a carga do servidor (`uptime`): se já estiver alta, não rode.

## Ler o resultado

- `http_req_duration p(95)`: 95% das requisições foram mais rápidas que isso. É o número principal.
- `http_req_failed`: % de erros. Acima de 1% em carga normal = problema.
- Resultado com recursos limitados mede **regressão** (ficou pior que antes?), não capacidade absoluta.
- Guarde o resultado de referência (baseline). Mudança que piora p95 em mais de ~20% merece investigação.

## Para o Claude
Ao ligar o módulo: copie `carga.js` para `testes/carga/`, o workflow para `.github/workflows/`, escolha um endpoint
representativo (de preferência que leia do banco, não só `/health`), preencha `VIZINHOS` com os outros sites do
servidor e rode **só o smoke** na primeira vez.
