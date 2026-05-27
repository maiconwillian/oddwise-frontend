import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { MatchesPage } from '@/features/matches/MatchesPage';
import { MatchDetailPage } from '@/features/match-detail/MatchDetailPage';
import { SuggestionsPage } from '@/features/suggestions/SuggestionsPage';
import { ProposedSuggestionsPage } from '@/features/suggestions/ProposedSuggestionsPage';
import { NewSuggestionPage } from '@/features/suggestions/NewSuggestionPage';
import { OddsPage } from '@/features/odds/OddsPage';
import { BacktestingPage } from '@/features/backtesting/BacktestingPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { AdminSyncPage } from '@/features/admin-sync/AdminSyncPage';
import { ValueBetsPage } from '@/features/value-bets/ValueBetsPage';
import { PicksPage } from '@/features/picks/PicksPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'matches', element: <MatchesPage /> },
      { path: 'matches/:id', element: <MatchDetailPage /> },
      { path: 'suggestions', element: <SuggestionsPage /> },
      { path: 'suggestions/proposed', element: <ProposedSuggestionsPage /> },
      { path: 'suggestions/new', element: <NewSuggestionPage /> },
      { path: 'value-bets', element: <ValueBetsPage /> },
      { path: 'picks', element: <PicksPage /> },
      { path: 'odds', element: <OddsPage /> },
      { path: 'backtesting', element: <BacktestingPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'admin/sync', element: <AdminSyncPage /> },
    ],
  },
]);
