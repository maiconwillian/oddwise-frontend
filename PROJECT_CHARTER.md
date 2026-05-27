# OddWise — Project Charter (Frontend)

**Última Atualização:** 2026-05-26  
**Status:** Sprint 13 ✅ · Phase 1.8 Propostas semanais · Pick engine · EV+ hub  
**Repo backend:** https://github.com/maiconwillian/sports-bet-analyzer  
**Charter canônico (backend):** [SportsBetAnalysisPlatform.md](https://github.com/maiconwillian/sports-bet-analyzer/blob/main/SportsBetAnalysisPlatform.md)

**Documentos locais:** [ROADMAP_STATUS.md](ROADMAP_STATUS.md) · [DECISIONS.md](DECISIONS.md) · [OPERATIONS.md](OPERATIONS.md) · [SPRINT_13.md](SPRINT_13.md) · [PRODUCT_VISION_AGENT.md](PRODUCT_VISION_AGENT.md)

---

## Visão

Interface profissional do **OddWise** para operação diária de análise quantitativa de apostas: partidas, odds, sugestões, backtesting e relatórios — foco **Over 2.5 Goals**, decisões baseadas em EV+ e validação histórica.

---

## Objetivo

Permitir que o operador execute o ciclo completo localmente:

**sync → enrich → odds → EV+ / picks → gerar propostas → aceitar → sugestão → resultado → backtest → relatório**

Meta de produto (com backend): **3–5 sugestões/semana** com revisão humana — fluxo **propostas semanais** ✅ (Sprint 13). Roadmap: [ROADMAP_STATUS.md](ROADMAP_STATUS.md).

---

## Estado atual da UI (maio/2026)

| Área | Status |
|------|--------|
| Dashboard | ✅ Métricas gerais |
| Partidas | ✅ Filtros liga/status/ao vivo, badge `leagueCountry` |
| Detalhe partida | ✅ Card **Análise** (forma, médias, posição), enrich, odds, nova sugestão |
| Odds | ✅ Histórico e consulta |
| **Oportunidades EV+** | ✅ `/value-bets` — oportunidades + análise da rodada (Sprint 11) |
| **Picks da rodada** | ✅ `/picks` — pick #1 + ranking Over 2.5 (Sprint 12 / 1.77) |
| Partidas (data) | ✅ Colunas confiança / stats / odds / sinal via `match-insights` |
| Sugestões | ✅ Listagem, WON/LOST/VOID, **Liquidar pendentes** |
| **Propostas** | ✅ `/suggestions/proposed` — gerar semana, aceitar/rejeitar (Sprint 13 / 1.8) |
| Nova sugestão | ✅ Liga → partida → odd (combobox) |
| Backtesting | ✅ Formulário + **aviso amostra baixa** (`lowSample`) |
| Relatórios | ✅ ROI diário/mensal |
| Admin Sync | ✅ Sync + **Enriquecer análise** + liquidação pós-sync |

### Integração com backend

- Dev: Vite proxy `/api` → `http://localhost:8080`
- Produção: `VITE_API_BASE_URL` apontando para o backend
- TanStack Query para todo server state

---

## Rotas

| Rota | Página |
|------|--------|
| `/` | Dashboard |
| `/matches` | Partidas |
| `/matches/:id` | Detalhe |
| `/suggestions` | Sugestões |
| `/suggestions/new?matchId=` | Nova sugestão |
| `/suggestions/proposed` | Propostas da semana |
| `/value-bets` | Oportunidades EV+ |
| `/picks` | Picks da rodada |
| `/odds` | Odds |
| `/backtesting` | Backtesting |
| `/reports` | Relatórios |
| `/admin/sync` | Admin Sync |

---

## Roadmap (alinhado ao backend)

### Concluído (Sprint 9)

- Phase 1 UI completa + liquidação automática Over 2.5
- Phase 1.5c — value bets + Kelly na UI
- Phase 1.7 — flag `lowSample` no backtest + guia operacional
- Sync invalida cache de partidas/sugestões/relatórios

### Concluído (Sprint 10–13)

- **1.75** — Match Intelligence
- **Sprint 11–12** — EV+ hub, `match-insights`, `/picks`
- **1.8 / Sprint 13** — propostas semanais `PROPOSED` → accept/reject

### Próximo (ver [ROADMAP_STATUS.md](ROADMAP_STATUS.md))

1. **1.76** — Multi-market (BTTS, 1X2 + backtest por mercado)
2. **Calibração** (opcional) — limiares EV+ / fórmula Over 2.5 com histórico local
3. **1.85** — Analyst Agent + MCP
4. **2.0** — n8n orquestração semanal
5. **1.9** — Sync / scheduler (paralelo quando fizer sentido)

### Non-goals (Phase 1)

- Deploy cloud, Winner, mobile, i18n

---

## Fluxos validados

1. **Partidas** — filtrar liga suportada; badge usa `leagueCountry`
2. **Odds** — capturar na partida; listar histórico
3. **Value bets** — `GET /api/analysis/value-bets?date=&league=`
4. **Sugestão** — selecionar odd real; criar manual ou a partir de EV+
5. **Resultado** — `PUT` com `actualResult` (WON/LOST/VOID) ou liquidação automática após sync
6. **Backtest** — estratégia `OVER_25_QUANT`; respeitar banner se `lowSample`
7. **Reports** — ROI após fechar sugestões

---

## Convenções técnicas

- `src/features/` — uma pasta por domínio/página
- `src/services/` — clientes HTTP (Axios)
- `src/types/` — tipos alinhados aos DTOs do backend
- `src/lib/queryInvalidation.ts` — invalidação pós-sync/settle
- Server state: TanStack Query · Forms: RHF + Zod · Tabelas: TanStack Table

---

*Atualizar a cada sprint. Espelhar decisões em DECISIONS.md.*
