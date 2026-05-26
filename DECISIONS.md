# OddWise — Decisões (Frontend)

Espelho das decisões relevantes à UI. ADRs completas no backend.

**Charter:** [PROJECT_CHARTER.md](PROJECT_CHARTER.md)  
**Backend:** https://github.com/maiconwillian/sports-bet-analyzer/blob/main/DECISIONS.md

---

| ID | Decisão | Impacto no front |
|----|---------|------------------|
| ADR-001 | Repos separados | Charter local + link para repo back |
| ADR-002 | Local-only Phase 1 | Proxy dev `/api` → `:8080` |
| ADR-003 | Over 2.5 only | UI focada nesse mercado |
| ADR-004 | 6 ligas, subset operacional | Filtros por liga |
| ADR-006 | Liga por nome + país | `LeagueBadge` usa `leagueCountry` |
| ADR-007 | `actualResult` | Ganho/Perdido/Void → WON/LOST/VOID |
| ADR-008 | Sugestões manuais até 1.8 | Fluxo `/suggestions/new` + EV+ em `/value-bets` |
| ADR-009 | Phase 1.5c Value bets | `/value-bets`, `valueBetService`, EV+ e Kelly do backend |
| ADR-010 | Liquidação automática | Sync chama settle; botão em `/suggestions`; cache via `queryInvalidation` |
| ADR-011 | Backtest amostra mínima | Banner `lowSample`; estratégia padrão `OVER_25_QUANT` |

---

## Ritual

Após mudanças de produto ou contrato API, atualizar esta tabela e o PROJECT_CHARTER.
