/**
 * Compatibility layer: exposes the react-router-dom API surface the Yaawp
 * codebase uses, backed by TanStack Router. New code should import from
 * @tanstack/react-router directly.
 */
import React from 'react';
import {
  Link as TanLink,
  Outlet as TanOutlet,
  Navigate as TanNavigate,
  useNavigate as useTanNavigate,
  useLocation as useTanLocation,
  useRouter,
} from '@tanstack/react-router';

export const Link = TanLink as unknown as React.FC<
  React.ComponentProps<'a'> & { to: string; replace?: boolean; state?: unknown }
>;
export const Outlet = TanOutlet;
export const Navigate = TanNavigate as unknown as React.FC<{ to: string; replace?: boolean }>;

type NavigateFn = {
  (to: string, opts?: { replace?: boolean; state?: unknown }): void;
  (delta: number): void;
};

export function useNavigate(): NavigateFn {
  const navigate = useTanNavigate();
  const router = useRouter();
  return React.useCallback(
    (to: string | number, opts?: { replace?: boolean; state?: unknown }) => {
      if (typeof to === 'number') {
        router.history.go(to);
        return;
      }
      // Support search strings like "/legal?doc=terms"
      const [path, search] = to.split('?');
      navigate({
        to: path as never,
        search: search ? (Object.fromEntries(new URLSearchParams(search)) as never) : undefined,
        replace: opts?.replace,
      });
    },
    [navigate, router],
  ) as NavigateFn;
}

export function useLocation() {
  const loc = useTanLocation();
  return React.useMemo(
    () => ({
      pathname: loc.pathname,
      search: loc.searchStr ?? '',
      hash: loc.hash ?? '',
      state: loc.state,
      key: 'default',
    }),
    [loc],
  );
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams | Record<string, string>) => void] {
  const loc = useTanLocation();
  const navigate = useNavigate();
  const params = React.useMemo(() => new URLSearchParams(loc.searchStr ?? ''), [loc.searchStr]);
  const setParams = React.useCallback(
    (next: URLSearchParams | Record<string, string>) => {
      const sp = next instanceof URLSearchParams ? next : new URLSearchParams(next);
      navigate(`${loc.pathname}?${sp.toString()}`, { replace: true });
    },
    [loc.pathname, navigate],
  );
  return [params, setParams];
}
