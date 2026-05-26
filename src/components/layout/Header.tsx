import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  matches: 'Partidas',
  suggestions: 'Sugestões',
  odds: 'Odds',
  backtesting: 'Backtesting',
  reports: 'Relatórios',
  admin: 'Admin',
  sync: 'Sincronização',
  new: 'Nova sugestão',
};

export function Header() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  const crumbs = [{ label: 'OddWise', path: '/' }];
  let currentPath = '';

  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = routeLabels[segment] ?? segment;
    crumbs.push({ label, path: currentPath });
  });

  return (
    <header className="flex h-14 items-center border-b border-border bg-card/50 px-6 backdrop-blur">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        {crumbs.map((crumb, index) => (
          <span key={crumb.path} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-3 w-3" />}
            {index === crumbs.length - 1 ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className="hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </header>
  );
}
