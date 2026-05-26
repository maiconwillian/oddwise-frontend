# Phase 1.8 — Automação de sugestões (rascunho)

**Status:** planejado · Sprint 10  
**Pré-requisitos:** Phase 1.5c ✅ · validação backtest 1.7 com amostra ≥ 30 apostas por liga

Ver também: `../sports-bet-analyzer/PHASE_1_8_DRAFT.md` no monorepo local.

## Meta

3–5 sugestões/semana com revisão humana antes de virar aposta operacional.

## Endpoints planejados (backend)

- `POST /api/suggestions/generate-weekly`
- `GET /api/suggestions/proposed`
- `POST /api/suggestions/proposed/{id}/accept` · `reject`

## UI planejada

- `/suggestions/proposed` ou aba em Sugestões
- Dashboard: `Propostas esta semana (N/5)`
