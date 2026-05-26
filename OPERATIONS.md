# OddWise — Operações (UI)

Rotina do operador usando o frontend local.

**Pré-requisitos:** Backend `:8080` rodando · `npm run dev` → `:5173`

---

## Subir

```bash
cp .env.example .env
npm install
npm run dev
```

Abrir http://localhost:5173

---

## Rotina semanal (UI)

### 1. Admin / Sync (`/admin/sync`)

- Sincronizar fixtures da semana (data ou intervalo).
- O backend **liquida automaticamente** sugestões PENDING de Over 2.5 em partidas finalizadas (FT/AET com placar).
- A UI atualiza partidas e sugestões no cache após o sync.

### 2. Partidas (`/matches`)

- Filtrar por liga suportada
- Abrir detalhe para stats e captura de odds

### 3. Capturar odds (`/matches/:id`)

- Botão capturar → conferir em `/odds` ou no detalhe

### 4. Oportunidades EV+ (`/value-bets`) — Phase 1.5c

- Escolher data (e opcionalmente liga)
- Revisar tabela: EV+, confiança, stake Kelly sugerida
- **Criar sugestão** → pré-preenche partida em `/suggestions/new?matchId=`

### 5. Nova sugestão (`/suggestions/new`)

1. Liga → partida → odd → EV, confiança, stake
2. Salvar → `/suggestions`

### 6. Fechar resultado (`/suggestions`)

- **Liquidar pendentes** — mesmo critério do sync (Over 2.5 + placar final)
- Manual: **Ganho / Perdido / Void** quando necessário (ex.: regras de casa, void especial)

Payload: `{ "actualResult": "WON" | "LOST" | "VOID" }`

### 7. Backtest (`/backtesting`) — Validação 1.7

**Bootstrap histórico (recomendado antes de confiar no ROI):**

1. Em `/admin/sync`, sincronizar intervalo **últimos ~90 dias** (6 ligas vêm da API).
2. Capturar odds em amostra de partidas finalizadas (detalhe da partida).
3. Rodar backtest por liga com estratégia **`OVER_25_QUANT`**, stake fixo, confiança mín. 65%.
4. Se aparecer banner **amostra insuficiente** (`betsPlaced` < 30): sincronizar mais datas — não escalar stake.

**Decisão operacional (exemplo):**

| Liga | Apostas simuladas | ROI | Operar? |
|------|-------------------|-----|---------|
| BRASILEIRAO | (preencher) | | só se amostra OK + ROI aceitável |
| PREMIER_LEAGUE | | | |
| … | | | |

### 8. Relatórios (`/reports`)

ROI diário/mensal após sugestões fechadas.

---

## Checklist UX pré-aposta

- [ ] Partida tem odds capturadas
- [ ] EV+ conferido em `/value-bets` ou calculado manualmente
- [ ] Badge de liga correto (BR vs IT)
- [ ] Stake dentro do bankroll

---

## Troubleshooting

| Sintoma | Verificar |
|---------|-----------|
| API 404/502 | Backend rodando em `:8080` |
| Sugestão continua pendente | Sync da data do jogo? Placar FT? Mercado Over 2.5? |
| Value bets vazios | Partidas NS do dia + odds capturadas + limiares `app.value-bet` no backend |
| Backtest ROI estranho | Banner lowSample? Estratégia `OVER_25_QUANT`? |
