# Sprint 13 — Phase 1.8 Propostas semanais

**Data:** 2026-05-26  
**Repos:** `oddwise-frontend` · `sports-bet-analyzer` (backend)

## Objetivo

Fila de **propostas semanais** (status `PROPOSED`): motor gera até 5 rascunhos a partir de picks; operador aceita → `PENDING` ou rejeita → `REJECTED`.

## Entregas

### Backend

| Item | Detalhe |
|------|---------|
| Status | `PROPOSED`, `REJECTED` em `SuggestionStatus` |
| Migration V12 | `proposal_reason` em `bet_suggestions` |
| `WeeklyProposalService` | Geração, fila, accept, reject |
| `POST /api/suggestions/generate-weekly` | `?from=&to=` (default: seg–dom da semana) |
| `GET /api/suggestions/proposed` | Lista `PROPOSED` no intervalo |
| `POST .../proposed/{id}/accept` | → `PENDING` + snapshot |
| `POST .../proposed/{id}/reject` | → `REJECTED` |
| Config | `app.proposals.max-per-week: 5` |
| Integração | Listagem operacional exclui `PROPOSED`/`REJECTED`; ROI idem; settlement só `PENDING` |
| Testes | `WeeklyProposalServiceTest` |

### Frontend

| Item | Detalhe |
|------|---------|
| `/suggestions/proposed` | Fila + gerar semana + aceitar/rejeitar |
| Nav | **Propostas** na sidebar |
| Dashboard | Widget N/5 propostas |
| Sugestões | Link “Propostas da semana” |

## Endpoints

```http
POST /api/suggestions/generate-weekly?from=2026-05-26&to=2026-06-01
GET  /api/suggestions/proposed?from=&to=
POST /api/suggestions/proposed/{id}/accept
POST /api/suggestions/proposed/{id}/reject
```

## Rotina semanal

1. Sync + enrich + odds na semana  
2. **Gerar propostas** em `/suggestions/proposed`  
3. Revisar — aceitar vira aposta pendente  
4. Acompanhar em `/suggestions` e liquidar após jogos  

## Teste manual

- Semana com pick PSG (30/05): generate → 1 proposta; accept → aparece em Sugestões como Pendente.  
- Rodar generate de novo: não duplica (dedup match+mercado).  
- Reject: some da fila, não liquida no FT.

## Próximo

Ver [ROADMAP_STATUS.md](ROADMAP_STATUS.md) — **1.76** ou **calibração** (escolher um eixo por sprint).

**Testes backend:** `mvn test -Dtest=WeeklyProposalServiceTest`
