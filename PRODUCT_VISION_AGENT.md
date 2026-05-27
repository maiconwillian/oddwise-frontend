# OddWise — Visão: Agente de recomendação multi-mercado

**Status:** Phase 1.8 ✅ (Sprint 13) · próximo 1.76 ou calibração  
**Roadmap:** [ROADMAP_STATUS.md](ROADMAP_STATUS.md)  
**Charter canônico (backend):** [../backend/PRODUCT_VISION_AGENT.md](../backend/PRODUCT_VISION_AGENT.md)

---

## Resumo

O **alvo do produto** é um **agente** (LLM + MCP + backend) que, por rodada:

1. Indica **em qual jogo** das 6 ligas a probabilidade modelada de acerto é maior;
2. Indica **em qual mercado** apostar (Over 2.5, BTTS, vitória, empate, etc.) — não só gols;
3. Entrega **parecer** estilo preparador, com **você aceitando** antes de registrar a aposta.

**Hoje:** Over 2.5 operacional; EV+ + picks + **propostas semanais** (gerar → aceitar/rejeitar); sugestões `PENDING` após aceite.

---

## Roadmap (ordem obrigatória)

| Fase | Entrega |
|------|---------|
| ~~**1.75**~~ ✅ | Match Intelligence — enrich, card Análise |
| ~~**Sprint 11**~~ ✅ | EV+ hub — oportunidades + análise da rodada |
| ~~**1.77**~~ ✅ | Pick engine Over 2.5 — `/picks` |
| ~~**1.8**~~ ✅ | Propostas semanais — `/suggestions/proposed` |
| **1.76** | Multi-market BTTS / 1X2 + backtest |
| **1.85** | Analyst Agent + MCP |
| **2.0** | n8n semanal |

Tabela completa e ordem de entrega: [ROADMAP_STATUS.md](ROADMAP_STATUS.md).

---

## UI planejada (futuro)

| Rota | Função |
|------|--------|
| `/matches/:id` | Painel inteligência (forma, médias, tabela) |
| `/picks` | ✅ Melhor pick da rodada + ranking |
| `/suggestions/proposed` | ✅ Fila accept/reject |

`/matches/:id` — card **Análise**. `/value-bets` — EV+ + radar. `/picks` — pick #1 e ranking (independente do limiar EV+ automático).

---

## Documentos

- [PROJECT_CHARTER.md](PROJECT_CHARTER.md) — roadmap UI  
- [DECISIONS.md](DECISIONS.md) — ADR-013  
- [OPERATIONS.md](OPERATIONS.md) — rotina operador  

Detalhes, contrato JSON e MCP tools: **backend** `PRODUCT_VISION_AGENT.md`.
