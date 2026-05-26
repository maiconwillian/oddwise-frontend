# OddWise — Project Charter (Frontend)

**Última Atualização:** 2026-05-26  
**Status:** Sprint 9 ✅ · Value bets 1.5c · Liquidação automática · Backtest lowSample  
**Repo backend:** https://github.com/maiconwillian/sports-bet-analyzer  
**Charter canônico (backend):** [SportsBetAnalysisPlatform.md](https://github.com/maiconwillian/sports-bet-analyzer/blob/main/SportsBetAnalysisPlatform.md)

**Documentos locais:** [DECISIONS.md](DECISIONS.md) · [OPERATIONS.md](OPERATIONS.md) · [PHASE_1_8_DRAFT.md](PHASE_1_8_DRAFT.md)

---

## Visão

Interface profissional do **OddWise** para operação diária de análise quantitativa de apostas: partidas, odds, sugestões, backtesting e relatórios — foco **Over 2.5 Goals**, decisões baseadas em EV+ e validação histórica.

---

## Objetivo

Permitir que o operador execute o ciclo completo localmente:

**sync → analisar partida → capturar odds → value bets EV+ → registrar sugestão → fechar resultado (auto/manual) → backtest → relatório**

Meta de produto (com backend): **3–5 sugestões/semana automatizadas** — ver [PHASE_1_8_DRAFT.md](PHASE_1_8_DRAFT.md).

---

## Estado atual da UI (maio/2026)

| Área | Status |
|------|--------|
| Dashboard | ✅ Métricas gerais |
| Partidas | ✅ Filtros liga/status/ao vivo, badge `leagueCountry` |
| Detalhe partida | ✅ Stats, captura odds, link para nova sugestão |
| Odds | ✅ Histórico e consulta |
| **Oportunidades EV+** | ✅ `/value-bets` (Phase 1.5c) |
| Sugestões | ✅ Listagem, WON/LOST/VOID, **Liquidar pendentes** |
| Nova sugestão | ✅ Liga → partida → odd (combobox) |
| Backtesting | ✅ Formulário + **aviso amostra baixa** (`lowSample`) |
| Relatórios | ✅ ROI diário/mensal |
| Admin Sync | ✅ Sync + **liquidação pós-sync** + invalidação cache |

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
| `/value-bets` | Oportunidades EV+ |
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

### Próximo

1. **Phase 1.8** — Fila de sugestões propostas (3–5/semana) — [PHASE_1_8_DRAFT.md](PHASE_1_8_DRAFT.md)
2. **Phase 1.9** — Sync só ligas suportadas + scheduler

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
