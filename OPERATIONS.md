# OddWise — Operações (UI)

Rotina do operador usando o frontend local. **Roadmap:** [ROADMAP_STATUS.md](ROADMAP_STATUS.md).

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
- O sync **persiste apenas** as 6 ligas de `SupportedLeague` quando **nome + país** batem (ex.: Premier League só com England/UK; Egito e outras homônimas são ignoradas).
- O card de resultado mostra **Ignoradas (liga)** e **Ignoradas (qualidade)**.
- O backend **liquida automaticamente** sugestões PENDING de Over 2.5 em partidas finalizadas (FT/AET com placar).
- A UI atualiza partidas e sugestões no cache após o sync.

**Dados legados (opcional):** partidas importadas antes deste filtro podem ainda existir no banco; `GET /matches/date/{date}` já não as devolve. Para limpar o banco, rodar novo sync nas datas relevantes ou apagar manualmente ligas/partidas cuja combinação nome+país não passa em `SupportedLeague.findByLeague`.

### 1b. Enriquecer análise (Phase 1.75)

- Na mesma tela: **Enriquecer análise desta data** ou **Enriquecer intervalo** (range).
- Ou no detalhe da partida: **Atualizar análise**.
- API: `POST /api/admin/enrich/fixtures?date=` · `POST /api/admin/enrich/fixtures/range?from=&to=` · `POST /api/matches/{id}/enrich`
- Sem enrich, `match_stats` ficam 0/TBD e EV+ retorna banner **stats incompletas**.

### 2. Partidas (`/matches`)

- Filtrar por **data**: colunas Confiança, Stats, Odds, EV, Sinal (batch `match-insights`, sem N+1).
- Abrir detalhe: card **Análise** (forma, médias, posição) e captura de odds

### 3. Capturar odds (`/matches/:id`)

- Botão capturar só habilitado para jogos **não finalizados** (`NS`, `TBD` ou ao vivo).
- Jogos `FT` / cancelados: o backend recusa a captura (evita quota e odds inúteis).
- Conferir em `/odds` ou no detalhe da partida.

### 4. Oportunidades EV+ (`/value-bets`) — hub da rodada

Rotina: **enrich → odds → EV+ → picks** (duas tabelas EV+ + link para picks).

1. **Oportunidades EV+** — só jogos que passam confiança ≥ 65% e EV ≥ 5% com odd Over 2.5 capturada.
2. **Análise da rodada** — todos os jogos elegíveis do dia, ordenados por confiança (inclui “Quase” ~55–64%).

- Escolher data (e opcionalmente liga).
- Banner **stats incompletas** (amarelo): enrich na data em Admin; link para `/admin/sync`.
- Stats OK e oportunidades vazias: mensagem explícita com limiares — **não é bug**; use a tabela de análise abaixo.
- **Criar sugestão** / **Ver partida** nas linhas do radar.
- Ver [SPRINT_11.md](SPRINT_11.md) para teste `2026-05-30` (PSG x Arsenal ~61%, sem linha EV+).

### 4b. Picks da rodada (`/picks`) — Phase 1.77

- Mesmos filtros data/liga.
- **Pick da rodada** (#1): melhor jogo com EV positivo (pode ser “Quase”, ex. 61% conf.).
- Ranking completo; badge “Também é oportunidade EV+” quando passa 65%/5%.
- Dashboard: widget “Melhor pick hoje”.
- API: `GET /api/analysis/round-picks` · `GET /api/analysis/match/{id}/picks`
- Ver [SPRINT_12.md](SPRINT_12.md).

### 4c. Propostas da semana (`/suggestions/proposed`) — Phase 1.8

1. Definir intervalo (seg–dom) ou usar padrão da tela.
2. **Gerar propostas da semana** — até 5 rascunhos a partir de picks com EV+ (pode incluir ~61% conf.).
3. **Aceitar** → vira sugestão `PENDING` em `/suggestions`.
4. **Rejeitar** → descartada; não liquida automaticamente.
5. Dashboard: widget N/5.

Ver [SPRINT_13.md](SPRINT_13.md).

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

- [ ] Partida com stats enriquecidas (card Análise)
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
| Value bets vazios | Enrich na data? Banner stats? Odds Over 2.5? Limiares `app.value-bet` |
| Backtest ROI estranho | Banner lowSample? Estratégia `OVER_25_QUANT`? |
