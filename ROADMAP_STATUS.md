# OddWise — Status do roadmap (fonte única)

**Atualizado:** 2026-05-26 (Sprint 13b — consolidação docs)  
**Repos:** `oddwise-frontend` · `sports-bet-analyzer` (backend)

Use este arquivo para saber o que está **entregue** vs **próximo**. Sprints históricos: `SPRINT_10.md` … `SPRINT_13.md`.

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Implementado e usável localmente |
| 🔄 | Parcial / depende do operador (ex.: volume no backtest) |
| ⬜ | Planejado, não iniciado |
| — | Fora de escopo Phase 1 |

---

## Fases de produto

| ID | Nome | Status | Sprint / nota |
|----|------|--------|----------------|
| — | Phase 1 UI + sync + sugestões manuais | ✅ | Sprint 9 |
| 1.5c | Value bets + Kelly | ✅ | Sprint 9 |
| 1.7 | Backtest + `lowSample` | ✅ | 🔄 amostra mínima 30 apostas |
| **1.75** | Match Intelligence (enrich, análise) | ✅ | Sprint 10 |
| **Sprint 11** | EV+ hub + `match-insights` | ✅ | Radar da rodada |
| **1.77** | Pick engine Over 2.5 | ✅ | Sprint 12 — `round-picks`, `/picks` |
| **1.8** | Propostas semanais PROPOSED | ✅ | Sprint 13 — `generate-weekly` |
| **1.76** | Multi-market BTTS / 1X2 + backtest | ⬜ | Próximo sprint de código (candidato) |
| Calibração | Limiares / fórmula Over 2.5 com histórico | ⬜ | Sprint opcional antes ou após 1.76 |
| **1.85** | Analyst Agent + MCP | ⬜ | Após motor multi-mercado estável |
| **1.9** | Sync inteligente / scheduler | ⬜ | Paralelo quando fizer sentido |
| **2.0** | n8n semanal | ⬜ | Phase 2 |

---

## Ordem de implementação vs numeração

A **numeração** no `PRODUCT_VISION_AGENT` (1.76 antes de 1.77 na visão original) descreve **dependência conceitual** (multi-mercado no alvo).

A **ordem entregue** foi pragmática para operar Over 2.5:

```text
1.75 → Sprint 11 → 1.77 (Sprint 12) → 1.8 (Sprint 13) → [próximo: 1.76 ou calibração]
```

Isso não invalida o roadmap; evita confundir “1.76 ainda não feito” com “produto incompleto para o dia a dia”.

---

## Fluxo operacional hoje (✅)

```text
Admin sync → enrich → capturar odds
  → /value-bets (EV+ + radar) + /picks (melhor do dia)
  → /suggestions/proposed (gerar até 5) → aceitar → /suggestions (PENDING)
  → liquidar (sync ou manual) → /reports + /backtesting
```

---

## Próximo passo recomendado

1. **Operar 2–4 semanas** — acumular sugestões liquidadas (validar propostas na prática).
2. Escolher **um** eixo de desenvolvimento:
   - **Calibração** — limiares EV+, UX ROI pendente, backtest por liga.
   - **1.76** — BTTS / 1X2, liquidação por mercado, `bestPick` multi-mercado.

Ver [PROJECT_CHARTER.md](PROJECT_CHARTER.md) · [PRODUCT_VISION_AGENT.md](PRODUCT_VISION_AGENT.md) · [OPERATIONS.md](OPERATIONS.md).

---

## APIs principais (referência rápida)

| Área | Endpoints |
|------|-----------|
| Análise | `match-insights`, `value-bets`, `round-picks`, `match/{id}/picks`, `match/{id}/analysis` |
| Propostas | `generate-weekly`, `suggestions/proposed`, `proposed/{id}/accept|reject` |
| Operação | `suggestions`, `settle-pending`, admin sync/enrich |

---

*Atualizar este arquivo ao fechar cada sprint. Não duplicar status em outros MDs — linkar aqui.*
