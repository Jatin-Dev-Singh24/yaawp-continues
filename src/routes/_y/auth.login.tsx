import { createFileRoute } from '@tanstack/react-router';
import { AppProvider } from '@/yaawp/context/AppContext';
import { TemporaryGamesProvider } from '@/yaawp/context/TemporaryGamesContext';
import { LoginPage } from '@/yaawp/pages';

export const Route = createFileRoute('/legacy/auth/login')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Log in — YAAWP' },
      { name: 'description', content: 'Log in to your YAAWP account.' },
      { property: 'og:title', content: 'Log in — YAAWP' },
      { property: 'og:description', content: 'Log in to your YAAWP account.' },
    ],
  }),
  component: () => (
    <AppProvider>
      <TemporaryGamesProvider>
        <LoginPage />
      </TemporaryGamesProvider>
    </AppProvider>
  ),
});
