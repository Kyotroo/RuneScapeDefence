import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { fetchPrayers } from '../../api/supportingData';
import { useUserConfig } from '../../state/UserConfigContext';
import { Prayer } from '../../types/api';

const PRAYER_BOOKS: Array<{ id: 'standard' | 'ancient'; label: string; description: string }> = [
  { id: 'standard', label: 'Standard Prayers', description: 'Protection and T99 offensive prayers.' },
  { id: 'ancient', label: 'Ancient Curses', description: 'Deflects, Soul Split, and Fortitude.' }
];

export function PrayerSelectionPanel(): JSX.Element {
  const {
    configuration: { activePrayer, prayerBook },
    updateConfig
  } = useUserConfig();

  const { data: prayers = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['prayers'],
    queryFn: fetchPrayers,
    staleTime: 24 * 60 * 60 * 1000
  });

  const filtered = useMemo(
    () => prayers.filter((prayer) => prayer.category === prayerBook).sort((a, b) => a.name.localeCompare(b.name)),
    [prayerBook, prayers]
  );

  const selected = activePrayer && filtered.find((prayer) => prayer.id === activePrayer.id) ? activePrayer : null;

  return (
    <div className="space-y-5 rounded-xl border border-slate-900/70 bg-slate-900/60 p-6 shadow-inner">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Prayer Library</h3>
          <p className="text-sm text-slate-400">Toggle between prayer books and pick a single active defensive prayer.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded border border-slate-800 bg-slate-950/80 px-3 py-1 text-slate-300 transition hover:border-emerald-400/60 hover:text-emerald-200"
          >
            {isFetching ? 'Refreshing…' : 'Refresh data'}
          </button>
          {selected ? (
            <button
              type="button"
              onClick={() => updateConfig('activePrayer', null)}
              className="rounded border border-slate-800 bg-slate-950/60 px-3 py-1 text-rose-200 hover:border-rose-500/60 hover:text-rose-100"
            >
              Clear selection
            </button>
          ) : null}
        </div>
      </header>
      <div className="flex flex-wrap gap-3">
        {PRAYER_BOOKS.map((book) => (
          <button
            key={book.id}
            type="button"
            onClick={() => {
              updateConfig('prayerBook', book.id);
              if (activePrayer && activePrayer.category !== book.id) {
                updateConfig('activePrayer', null);
              }
            }}
            className={clsx(
              'flex min-w-[12rem] flex-1 flex-col rounded-lg border bg-slate-950/60 px-4 py-3 text-left transition',
              prayerBook === book.id
                ? 'border-emerald-400/70 text-emerald-200 shadow-lg shadow-emerald-500/10'
                : 'border-slate-900/60 hover:border-slate-700/80'
            )}
          >
            <span className="text-sm font-semibold">{book.label}</span>
            <span className="mt-1 text-xs text-slate-400">{book.description}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-lg border border-slate-900/70 bg-slate-950/60">
          <div className="flex items-center justify-between border-b border-slate-900/60 px-4 py-2 text-xs uppercase tracking-wide text-slate-400">
            <span>{prayerBook === 'standard' ? 'Standard Prayers' : 'Ancient Curses'}</span>
            <span>{filtered.length} options</span>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {isLoading ? (
              <p className="p-4 text-sm text-slate-400">Loading prayer data…</p>
            ) : (
              <ul className="divide-y divide-slate-900/60">
                {filtered.map((prayer) => (
                  <li key={prayer.id}>
                    <button
                      type="button"
                      onClick={() => updateConfig('activePrayer', prayer)}
                      className={clsx(
                        'flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-slate-900/60',
                        selected?.id === prayer.id && 'bg-emerald-500/10 text-emerald-100'
                      )}
                    >
                      <span className="text-sm font-semibold">{prayer.name}</span>
                      <span className="text-xs text-slate-400">Drain {prayer.drainRate.toFixed(1)}% · {summarisePrayer(prayer)}</span>
                    </button>
                  </li>
                ))}
                {!filtered.length && !isLoading ? (
                  <li className="px-4 py-3 text-xs text-slate-500">No prayers available for this book.</li>
                ) : null}
              </ul>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <motion.div layout className="rounded-lg border border-slate-900/70 bg-slate-950/60 p-4 text-sm text-slate-300">
            {selected ? <PrayerDetails prayer={selected} /> : <p>Select a prayer to review its defensive impact.</p>}
          </motion.div>
          <AnimatePresence>
            {selected?.effects.some((effect) => effect.type === 'damageReduction') ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-100"
              >
                Matching prayer reduces {formatStyles(selected)} hits by{' '}
                {Math.round(
                  (selected.effects.find((effect) => effect.type === 'damageReduction') as { value: number } | undefined)?.value ??
                    0
                ) * 100}
                %.
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

type PrayerDetailsProps = { prayer: Prayer };

function PrayerDetails({ prayer }: PrayerDetailsProps): JSX.Element {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-base font-semibold text-emerald-200">{prayer.name}</h4>
        <p className="text-xs uppercase tracking-wide text-slate-400">Drain rate {prayer.drainRate.toFixed(1)}%</p>
      </div>
      <p className="text-sm text-slate-300">{prayer.description}</p>
      <ul className="space-y-2 text-sm">
        {prayer.effects.map((effect) => (
          <li key={`${effect.type}-${'style' in effect ? effect.style : effect.value}`} className="rounded border border-slate-900/60 bg-slate-950/40 px-3 py-2">
            {describeEffect(effect)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function describeEffect(effect: Prayer['effects'][number]): string {
  if (effect.type === 'damageReduction') {
    const amount = Math.round(effect.value * 100);
    const style = effect.style === 'all' ? 'all attacks' : `${effect.style} damage`;
    return `Reduces incoming ${style} by ${amount}%.`;
  }
  if (effect.type === 'lifepointBonus') {
    return `Grants +${effect.value.toLocaleString()} maximum life points.`;
  }
  if (effect.type === 'defenceModifier') {
    return `Increases defensive rolls by ${Math.round(effect.value * 100)}%.`;
  }
  return 'Provides a unique effect.';
}

function summarisePrayer(prayer: Prayer): string {
  const reductions = prayer.effects.filter((effect) => effect.type === 'damageReduction');
  if (reductions.length) {
    return reductions
      .map((effect) => `${Math.round(effect.value * 100)}% ${effect.style === 'all' ? 'universal' : effect.style}`)
      .join(', ');
  }
  const lifepointBonus = prayer.effects.find((effect) => effect.type === 'lifepointBonus');
  if (lifepointBonus) {
    return `+${lifepointBonus.value.toLocaleString()} LP`;
  }
  return 'Utility prayer';
}

function formatStyles(prayer: Prayer): string {
  const reduction = prayer.effects.find((effect) => effect.type === 'damageReduction');
  if (!reduction) return 'incoming';
  if (reduction.style === 'all') return 'all incoming';
  return reduction.style;
}
