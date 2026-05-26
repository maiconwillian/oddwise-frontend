# Phase 1.8 — Automação de sugestões (rascunho)

**Status:** planejado · Sprint 10+  
**Backend:** [../backend/PHASE_1_8_DRAFT.md](../backend/PHASE_1_8_DRAFT.md)  
**Visão agente:** [PRODUCT_VISION_AGENT.md](PRODUCT_VISION_AGENT.md)

## Pré-requisitos

- Phase 1.5c ✅ · backtest 1.7 com amostra OK onde for operar
- **Phase 1.75** (stats reais) ✅ — Sprint 10; ver [SPRINT_10.md](SPRINT_10.md)
- **Phase 1.77** (pick ranking) ⬜

**Não implementar fila de propostas antes de 1.75 + 1.77.**

## Meta

3–5 sugestões/semana · revisão humana · accept/reject na UI.

## Endpoints planejados (backend)

- `POST /api/suggestions/generate-weekly`
- `GET /api/suggestions/proposed`
- `POST /api/suggestions/proposed/{id}/accept` · `reject`

## UI planejada

- `/suggestions/proposed` ou aba em Sugestões
- Dashboard: `Propostas esta semana (N/5)`
