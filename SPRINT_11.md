# Sprint 11 — EV+ utilizável + análise na rodada

**Data:** 2026-05-26  
**Repos:** `oddwise-frontend` · `sports-bet-analyzer` (backend)

## Objetivo

Tornar **Oportunidades EV+** o hub da rodada mesmo quando nenhum jogo passa limiar EV+: explicar vazio + ranking do dia. Trazer confiança/stats/odds/sinal para listagens sem abrir cada partida.

## Entregas

### Backend

| Item | Detalhe |
|------|---------|
| `GET /api/analysis/match-insights` | `?date=&league=` — batch por rodada (NS/TBD, 6 ligas) |
| `MatchInsightsService` | `statsReady`, `confidence`, `expectedValue` com melhor odd Over 2.5, `passesEvFilters`, `signalTier` |
| `MatchAnalysisService` | EV no insight com odd capturada (`expectedValue` null se sem odd; não sentinel -1) |
| Enrich range (P1) | `POST /api/admin/enrich/fixtures/range?from=&to=` |
| Testes | `MatchInsightsServiceTest` (tiers EV+/NEAR/WEAK/NO_STATS) |

### Frontend

| Item | Detalhe |
|------|---------|
| `/value-bets` | Duas seções: **Oportunidades EV+** + **Análise da rodada** |
| Mensagem vazio | Stats OK e zero oportunidades → texto com limiares conf/EV |
| `/matches` (filtro data) | Colunas confiança, stats, odds, EV, sinal (batch `match-insights`) |
| Admin | **Enriquecer intervalo** no card de range |
| Cache | `match-insights` em `queryInvalidation` |

## Endpoints

```http
GET  /api/analysis/match-insights?date=2026-05-30&league=
GET  /api/analysis/value-bets?date=2026-05-30
POST /api/admin/enrich/fixtures/range?from=2026-05-28&to=2026-05-30
```

## Rotina operador

1. **Sync** — `/admin/sync`
2. **Enrich** — data ou intervalo
3. **Odds** — capturar Over 2.5 no detalhe
4. **EV+** — `/value-bets`: oportunidades (se passar limiar) + radar da rodada
5. **Partidas** — `/matches` com data: colunas de sinal sem N+1

## Teste manual (2026-05-30)

Pré: sync + enrich + ≥1 odd Over 2.5 (ex. PSG x Arsenal).

| Verificação | Esperado |
|-------------|----------|
| Banner amarelo | Só se `statsIncomplete` (não quando 6/6 OK) |
| Análise da rodada | PSG x Arsenal ~61% confiança, EV com odd ~2,08, sinal **Quase** |
| Oportunidades EV+ | Vazia + texto “Nenhum jogo passou confiança ≥ 65% e EV ≥ 5%…” |
| `/matches` data 30/05 | Colunas confiança/stats/odds/sinal na tabela |

Referência confiança (não alterar sem ADR):

- `combinedGoalAverage = (homeGoalsAvg + awayGoalsAvg) / 2`
- `confidence = combinedGoalAverage × 25` (+ bônus over25 > 75%)
- Limiares: `app.value-bet.min-confidence: 65`, `min-ev: 0.05`

## Próximo

Phase **1.77** pick engine (não 1.76/1.8 neste sprint). Ver [PROJECT_CHARTER.md](PROJECT_CHARTER.md).
