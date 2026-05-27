# Sprint 12 — Phase 1.77 Pick engine Over 2.5

> **Histórico.** Status atual: [ROADMAP_STATUS.md](ROADMAP_STATUS.md).

**Data:** 2026-05-26  
**Repos:** `oddwise-frontend` · `sports-bet-analyzer` (backend)

## Objetivo

Responder **qual o melhor pick do dia** e **melhor mercado por jogo** (v1: só Over 2.5), reutilizando `match-insights` sem duplicar fórmulas.

## Entregas

### Backend

| Item | Detalhe |
|------|---------|
| `PickRankingService` | Delega `MatchInsightsService`; `bestPick`, `pickScore`, ranking |
| `GET /api/analysis/round-picks` | `?date=&league=` — `topPick` + `rankedPicks` com `rank` |
| `GET /api/analysis/match/{matchId}/picks` | Pick por partida |
| Regra `bestPick` | EV &gt; 0 + stats OK + odd; `eligibleForAutoOpportunity` = `passesEvFilters` |
| Score rodada | `confidence × (1 + EV)` quando EV &gt; 0 |
| Testes | `PickRankingServiceTest` (PSG ~61%, EV+, não auto) |

### Frontend

| Item | Detalhe |
|------|---------|
| `/picks` | Card pick #1 + ranking; filtros data/liga |
| Nav | Sidebar **Picks da rodada** |
| `/value-bets` | Link “Ver picks da rodada” |
| Dashboard | Widget “Melhor pick hoje” |
| `pickService` · `types/pick.ts` | Cache `round-picks`, `match-picks` |

## Endpoints

```http
GET /api/analysis/round-picks?date=2026-05-30&league=
GET /api/analysis/match/{matchId}/picks
```

## Diferença operador

| Conceito | Critério |
|----------|----------|
| **Oportunidade EV+** | Conf ≥ 65%, EV ≥ 5%, odd Over 2.5 |
| **Pick recomendado** | Melhor do jogo com EV &gt; 0 (pode ser 61% conf.) |

## Teste manual (2026-05-30)

1. Sync + enrich + odds (PSG).
2. `round-picks` → #1 PSG, `bestPick` Over 2.5, `eligibleForAutoOpportunity: false`.
3. `/picks` — card + tabela; criar sugestão.
4. `/value-bets` — link para picks; seções Sprint 11 intactas.
5. Dashboard — widget se houver top pick.

## Próximo

**Phase 1.8** — propostas semanais accept/reject ([PHASE_1_8_DRAFT.md](PHASE_1_8_DRAFT.md)).

**Testes backend:** IntelliJ ou `mvn test -Dtest=PickRankingServiceTest` (se `mvn` no PATH).
