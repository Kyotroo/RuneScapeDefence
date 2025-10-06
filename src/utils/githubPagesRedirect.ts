function decodeParam(value: string | null): string {
  if (!value) return '';
  return decodeURIComponent(value).replace(/~and~/g, '&');
}

export function restoreSpaRouteFromGithubPages(): void {
  if (typeof window === 'undefined') return;
  const search = window.location.search;
  if (!search.includes('?p=')) return;

  const params = new URLSearchParams(search);
  const path = decodeParam(params.get('p'));
  if (!path) return;

  const query = decodeParam(params.get('q'));
  const hash = window.location.hash ?? '';

  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const newUrl = `${base}${normalizedPath}${query ? `?${query}` : ''}${hash}` || '/';

  window.history.replaceState(null, '', newUrl);
}
