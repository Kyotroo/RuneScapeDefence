import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApiStore } from '../state/apiStore';

export function TopNav(): JSX.Element {
  const freshness = useApiStore((state) => state.freshness);

  const newest = useMemo(() => {
    if (!freshness) return null;
    const sorted = Object.entries(freshness)
      .filter(([, meta]) => meta)
      .sort(([, a], [, b]) => (b?.updatedAt ?? 0) - (a?.updatedAt ?? 0));
    const newestEntry = sorted[0];
    return newestEntry ? newestEntry[1] ?? null : null;
  }, [freshness]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-900/70 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/30" />
          <div>
            <p className="font-semibold tracking-tight">RuneScape 3 Defensive Lab</p>
            <p className="text-xs text-slate-400">
              {newest ? `Latest data sync ${formatRelative(newest.updatedAt)}` : 'Syncing data sources...'}
            </p>
          </div>
        </motion.div>
      </div>
    </header>
  );
}

function formatRelative(value: number): string {
  const delta = Date.now() - value;
  if (delta < 60_000) return 'just now';
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)} min ago`;
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)} hr ago`;
  return `${Math.floor(delta / 86_400_000)} day${delta / 86_400_000 > 1 ? 's' : ''} ago`;
}
