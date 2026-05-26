import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Providers } from './app/providers';
import { router } from './app/router';
import { useThemeStore } from './stores/themeStore';
import './index.css';

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <ThemeInitializer>
        <RouterProvider router={router} />
      </ThemeInitializer>
    </Providers>
  </StrictMode>,
);
