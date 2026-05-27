# Sprint 10 — Phase 1.75 Match Intelligence

> **Histórico.** Status atual do produto: [ROADMAP_STATUS.md](ROADMAP_STATUS.md).

**Data:** 2026-05-26  
**Repos:** `oddwise-frontend` · `sports-bet-analyzer` (backend)

## Objetivo

Preencher `match_stats` com dados reais (API-Football PRO), alinhar motor de confiança/EV+ (`Over25Strategy` única fonte) e expor inteligência na UI.

## Entregas

### Backend

| Item | Detalhe |
|------|---------|
| Migration V11 | `stats_enriched`, médias sofridos, over25%, posição liga |
| `ApiFootballEnrichmentClient` | `/teams/statistics`, `/standings`, últimos N fixtures |
| `EnrichMatchAnalysisService` | `enrichMatch`, `enrichMatchesForDate` |
| REST | `POST /api/admin/enrich/fixtures?date=` · `POST /api/matches/{id}/enrich` · `GET /api/matches/{id}/analysis` |
| EV+ meta | `GET /api/analysis/value-bets` → `ValueBetsScanResponse` (`statsIncomplete`, `hint`) |
| Features | `Over25FeatureExtractor` usa stats enriquecidos; confiança só via `Over25Strategy` |
| Config | `app.enrich.auto-after-sync=false` (enrich manual por quota) |
| Testes | `EnrichMatchAnalysisServiceTest`, `ValueBetDetectionServiceTest` |

### Frontend

| Item | Detalhe |
|------|---------|
| Detalhe partida | Card **Análise** + botão **Atualizar análise** |
| Admin sync | **Enriquecer análise desta data** |
| `/value-bets` | Banner stats incompletas + lista `opportunities` |
| Nova sugestão | Pré-preenche confiança/EV/stake de `GET /api/analysis/value-bets/match/{id}` |

## Rotina operador

1. **Sync** — `/admin/sync` (data ex.: `2026-05-30`)
2. **Enrich** — botão na mesma tela ou `POST /api/admin/enrich/fixtures?date=2026-05-30`
3. **Odds** — capturar no detalhe da partida
4. **EV+** — `/value-bets` na data; conferir banner (X/Y enriquecidas)
5. **Sugestão** — manual ou via linha EV+

## Teste manual (piloto 30/05)

```http
POST /api/admin/sync/fixtures?date=2026-05-30
POST /api/admin/enrich/fixtures?date=2026-05-30
GET  /api/matches/{ucl-match-id}/analysis
GET  /api/analysis/value-bets?date=2026-05-30
```

Validar: PSG x Arsenal (UCL) e jogo Brasileirão — stats ≠ 0/TBD, `modelInsight.confidence` > 0 quando enrich OK.

## Próximo sprint

**1.77** — Pick of the day (não implementar 1.76/1.8 neste ciclo).

**Backend:** [../backend/SPRINT_10.md](../backend/SPRINT_10.md)
