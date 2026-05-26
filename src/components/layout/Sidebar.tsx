import {
  BarChart3,
  Calendar,
  FlaskConical,
  LayoutDashboard,
  LineChart,
  Moon,
  RefreshCw,
  Sun,
  Target,
  TrendingUp,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/themeStore';
import { Button } from '@/components/ui/button';
import { DEFAULT_MARKET } from '@/types/api';
import { formatMarket } from '@/utils/formatters';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/matches', label: 'Partidas', icon: Calendar },
  { to: '/suggestions', label: 'Sugestões', icon: Target },
  { to: '/odds', label: 'Odds', icon: TrendingUp },
  { to: '/backtesting', label: 'Backtesting', icon: FlaskConical },
  { to: '/reports', label: 'Relatórios', icon: BarChart3 },
  { to: '/admin/sync', label: 'Admin / Sync', icon: RefreshCw },
];

export function Sidebar() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-2">
          <LineChart className="h-6 w-6 text-primary" />
          <div>
            <p className="font-bold tracking-tight">OddWise</p>
            <p className="text-xs text-muted-foreground">Sports Bet Analyzer</p>
          </div>
        </div>
        <p className="mt-3 rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
          Mercado: {formatMarket(DEFAULT_MARKET)}
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={toggleTheme}>
          {theme === 'dark' ? (
            <>
              <Sun className="mr-2 h-4 w-4" /> Tema claro
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" /> Tema escuro
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
