import { createFileRoute } from '@tanstack/react-router';
import { AppProvider } from '@/yaawp/context/AppContext';
import { TemporaryGamesProvider } from '@/yaawp/context/TemporaryGamesContext';
import { PreviewPage } from '@/yaawp/pages';

export const Route = createFileRoute('/_y/')({
  head: () => ({
    meta: [
      { title: 'YAAWP — Pure social expression' },
      { name: 'description', content: 'Real moments, genuine connections. Join YAAWP.' },
      { property: 'og:title', content: 'YAAWP — Pure social expression' },
      { property: 'og:description', content: 'Real moments, genuine connections. Join YAAWP.' },
    ],
  }),
  component: () => (
    <AppProvider>
      <TemporaryGamesProvider>
        <PreviewPage />
      </TemporaryGamesProvider>
    </AppProvider>
  ),
});
