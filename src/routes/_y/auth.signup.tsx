import { createFileRoute } from '@tanstack/react-router';
import { SignupPage } from '@/yaawp/pages';

export const Route = createFileRoute('/_y/auth/signup')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'Sign up — YAAWP' },
      { name: 'description', content: 'Create your YAAWP account.' },
      { property: 'og:title', content: 'Sign up — YAAWP' },
      { property: 'og:description', content: 'Create your YAAWP account.' },
    ],
  }),
  component: SignupPage,
});
