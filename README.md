# OddWise — Sports Bet Analyzer

Front-end da plataforma **OddWise**, ferramenta profissional de análise quantitativa de apostas esportivas focada no mercado **Over 2.5 Goals**.

## Documentação do projeto

| Documento | Conteúdo |
|-----------|----------|
| [PROJECT_CHARTER.md](PROJECT_CHARTER.md) | Visão, roadmap, rotas, fluxos validados |
| [DECISIONS.md](DECISIONS.md) | Decisões de produto relevantes à UI |
| [OPERATIONS.md](OPERATIONS.md) | Rotina operacional semanal na UI |
| [PHASE_1_8_DRAFT.md](PHASE_1_8_DRAFT.md) | Rascunho automação 3–5 picks/semana |
| [Backend charter](https://github.com/maiconwillian/sports-bet-analyzer/blob/main/SportsBetAnalysisPlatform.md) | Charter canônico (repo backend) |

## Stack

- React 18 + TypeScript
- Vite
- React Router
- TanStack Query + TanStack Table
- Axios
- Tailwind CSS
- React Hook Form + Zod
- Recharts
- Lucide React
- Sonner (toasts)
- Zustand (tema)

## Pré-requisitos

- Node.js 18+
- Backend Spring Boot rodando em `http://localhost:8080`

## Instalação

```bash
npm install
```

Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

Variáveis:

| Variável | Dev | Produção |
|----------|-----|----------|
| `VITE_API_BASE_URL` | vazio (usa proxy) | URL do backend |
| `VITE_BACKEND_URL` | `http://localhost:8080` | — |

Para build de produção, use `.env.production` com `VITE_API_BASE_URL` apontando para o backend.

## Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Estrutura

```
src/
├── app/           # Router e providers
├── components/    # UI, layout, charts, badges, states
├── features/      # Páginas por domínio
├── services/      # Clientes HTTP
├── types/         # Tipos TypeScript
├── utils/         # Formatadores e helpers
└── stores/        # Zustand (tema)
```

## Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Dashboard |
| `/matches` | Partidas |
| `/matches/:id` | Detalhe da partida |
| `/suggestions` | Sugestões |
| `/suggestions/new` | Nova sugestão |
| `/suggestions/proposed` | Propostas da semana |
| `/value-bets` | Oportunidades EV+ + análise da rodada (Sprint 11) |
| `/picks` | Picks da rodada — melhor Over 2.5 do dia (Sprint 12) |
| `/odds` | Odds e CLV |
| `/backtesting` | Simulação histórica |
| `/reports` | Relatórios de performance |
| `/admin/sync` | Sincronização |

## API

Todas as chamadas usam a base configurada em `VITE_API_BASE_URL`. O Vite proxy redireciona `/api` para o backend durante o desenvolvimento.

## Ligas suportadas

- Champions League
- Premier League
- La Liga
- Bundesliga
- Serie A (Itália)
- Brasileirão (Serie A — Brazil)
