import { Outlet, NavLink } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  FlaskConical,
  LayoutDashboard,
  RefreshCw,
  Target,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const mobileNav = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/matches', label: 'Partidas', icon: Calendar },
  { to: '/suggestions', label: 'Sugestões', icon: Target },
  { to: '/odds', label: 'Odds', icon: TrendingUp },
  { to: '/backtesting', label: 'Test', icon: FlaskConical },
  { to: '/reports', label: 'Relat.', icon: BarChart3 },
  { to: '/admin/sync', label: 'Sync', icon: RefreshCw },
];

export function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
          <Outlet />
        </main>
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-card md:hidden">
          {mobileNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
