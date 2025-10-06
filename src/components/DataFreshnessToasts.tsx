import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApiStore } from '../state/apiStore';

const TTL_COLORS: Record<'fresh' | 'warning' | 'stale', string> = {
  fresh: 'text-emerald-300',
  warning: 'text-amber-300',
  stale: 'text-rose-300'
};

export function DataFreshnessToasts(): JSX.Element {
  const freshness = useApiStore((state) => state.freshness);
  const errors = useApiStore((state) => state.errors);

  const items = useMemo(() => {
    return Object.entries(freshness)
      .map(([key, meta]) => {
        if (!meta) return null;
        const delta = Date.now() - meta.updatedAt;
        const status = delta < meta.ttl ? 'fresh' : delta < meta.ttl * 4 ? 'warning' : 'stale';
        return {
          key,
          delta,
          status,
          meta
        };
      })
      .filter(Boolean) as Array<{ key: string; delta: number; status: keyof typeof TTL_COLORS; meta: { updatedAt: number; ttl: number } }>;
  }, [freshness]);

  const errorEntries = useMemo(
    () =>
      Object.entries(errors)
        .filter(([, value]) => value)
        .map(([key, message]) => ({ key, message: message as string })),
    [errors]
  );

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 flex flex-col gap-3">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 0.9, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            className="pointer-events-auto rounded-lg border border-slate-800 bg-slate-900/90 px-4 py-3 text-sm shadow-xl"
          >
            <p className="font-semibold capitalize text-slate-200">{item.key}</p>
            <p className={TTL_COLORS[item.status]}>Updated {formatRelative(item.delta)} ago</p>
          </motion.div>
        ))}
      </AnimatePresence>
      <AnimatePresence>
        {errorEntries.map((error) => (
          <motion.div
            key={`error-${error.key}`}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 0.95, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            className="pointer-events-auto rounded-lg border border-rose-500/40 bg-rose-950/70 px-4 py-3 text-sm text-rose-100 shadow-xl"
          >
            <p className="font-semibold">{error.key} failed</p>
            <p className="text-xs">{error.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function formatRelative(delta: number): string {
  if (delta < 60_000) return 'moments';
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)} minutes`;
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)} hours`;
  return `${Math.floor(delta / 86_400_000)} days`;
}
