# OddWise — Visão: Agente de recomendação multi-mercado

**Status:** Phase 1.75 ✅ · Sprint 11 (EV+ hub + radar rodada) · próximo 1.77  
**Charter canônico (backend):** [../backend/PRODUCT_VISION_AGENT.md](../backend/PRODUCT_VISION_AGENT.md)

---

## Resumo

O **alvo do produto** é um **agente** (LLM + MCP + backend) que, por rodada:

1. Indica **em qual jogo** das 6 ligas a probabilidade modelada de acerto é maior;
2. Indica **em qual mercado** apostar (Over 2.5, BTTS, vitória, empate, etc.) — não só gols;
3. Entrega **parecer** estilo preparador, com **você aceitando** antes de registrar a aposta.

**Hoje:** Over 2.5 operacional; após **sync + enrich + odds**, **EV+** = filtro de oportunidades (limiares) **+ radar da rodada** (`match-insights`); card Análise no detalhe; **Nova sugestão** manual ou pré-preenchida do motor.

---

## Roadmap (ordem obrigatória)

| Fase | Entrega |
|------|---------|
| ~~**1.75**~~ ✅ | Match Intelligence — enrich, card Análise |
| ~~**Sprint 11**~~ ✅ | EV+ hub — oportunidades + análise da rodada; colunas em `/matches` |
| **1.76** | Modelos Over 2.5 + BTTS + 1X2 (backtest por mercado) |
| **1.77** | Pick of the day — melhor mercado por jogo |
| **1.8** | Propostas 3–5/semana — [PHASE_1_8_DRAFT.md](PHASE_1_8_DRAFT.md) |
| **1.85** | Analyst Agent + MCP |
| **2.0** | n8n semanal |

**1.8 só depois de 1.75 + 1.77.**

---

## UI planejada (futuro)

| Rota | Função |
|------|--------|
| `/matches/:id` | Painel inteligência (forma, médias, tabela) |
| `/picks` ou dashboard | Melhor pick da rodada |
| `/suggestions/proposed` | Fila accept/reject (1.8) |

`/matches/:id` — card **Análise** + **Atualizar análise**. `/value-bets` — oportunidades EV+ + tabela **Análise da rodada**; banner só se stats incompletas.

---

## Documentos

- [PROJECT_CHARTER.md](PROJECT_CHARTER.md) — roadmap UI  
- [DECISIONS.md](DECISIONS.md) — ADR-013  
- [OPERATIONS.md](OPERATIONS.md) — rotina operador  

Detalhes, contrato JSON e MCP tools: **backend** `PRODUCT_VISION_AGENT.md`.
