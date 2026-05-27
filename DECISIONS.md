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
| ADR-012 | Sync só 6 ligas + país | Admin sync ignora homônimos; `leagueFromApiNameAndCountry` exige `leagueCountry`; listagem filtra no back |
| ADR-013 | Roadmap agente multi-mercado | 1.75→1.77 antes de 1.8; MCP/n8n em 1.85/2.0; ver [PRODUCT_VISION_AGENT.md](PRODUCT_VISION_AGENT.md) |
| ADR-014 | Enrich endpoint separado (1.75) | Admin **Enriquecer análise**; `app.enrich.auto-after-sync=false`; ver [SPRINT_10.md](SPRINT_10.md) |
| ADR-015 | EV+ page = oportunidades + ranking do dia (Sprint 11) | `/value-bets` duas tabelas; `GET /api/analysis/match-insights`; `/matches` com colunas batch; ver [SPRINT_11.md](SPRINT_11.md) |
| ADR-016 | Pick engine v1 = Over 2.5 only (Sprint 12 / 1.77) | `round-picks` + `bestPick`; pick pode ter EV+ sem passar 65% conf.; ver [SPRINT_12.md](SPRINT_12.md) |
| ADR-017 | Propostas semanais PROPOSED (Sprint 13 / 1.8) | Até 5/semana; accept→PENDING; reject→REJECTED; settlement ignora PROPOSED; ver [SPRINT_13.md](SPRINT_13.md) |

---

## Ritual

Após mudanças de produto ou contrato API, atualizar esta tabela, [ROADMAP_STATUS.md](ROADMAP_STATUS.md) e o PROJECT_CHARTER.
