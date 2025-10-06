import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { fetchFamiliars } from '../../api/supportingData';
import { useUserConfig } from '../../state/UserConfigContext';
import { Familiar } from '../../types/api';

export function FamiliarSelectionPanel(): JSX.Element {
  const {
    configuration: { familiar },
    updateConfig
  } = useUserConfig();

  const { data: familiars = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['familiars'],
    queryFn: fetchFamiliars,
    staleTime: 24 * 60 * 60 * 1000
  });

  const grouped = useMemo(() => groupFamiliars(familiars), [familiars]);
  const selected = familiar ? familiars.find((entry) => entry.id === familiar.id) ?? null : null;

  return (
    <div className="space-y-5 rounded-xl border border-slate-900/70 bg-slate-900/60 p-6 shadow-inner">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Summoning Familiar</h3>
          <p className="text-sm text-slate-400">Every familiar adds mitigation, utility, or sustain. Select the pet you plan to bring.</p>
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
              onClick={() => updateConfig('familiar', null)}
              className="rounded border border-slate-800 bg-slate-950/60 px-3 py-1 text-rose-200 hover:border-rose-500/60 hover:text-rose-100"
            >
              Clear familiar
            </button>
          ) : null}
        </div>
      </header>
      {isLoading ? (
        <p className="text-sm text-slate-400">Pulling summoning compendium…</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-4">
            {grouped.map((group) => (
              <div key={group.name} className="rounded-lg border border-slate-900/70 bg-slate-950/60">
                <div className="flex items-center justify-between border-b border-slate-900/60 px-4 py-2 text-xs uppercase tracking-wide text-slate-400">
                  <span>{group.name}</span>
                  <span>{group.familiars.length} familiars</span>
                </div>
                <ul className="divide-y divide-slate-900/60">
                  {group.familiars.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => updateConfig('familiar', entry)}
                        className={clsx(
                          'flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-slate-900/60',
                          selected?.id === entry.id && 'bg-emerald-500/10 text-emerald-100'
                        )}
                      >
                        <span className="text-sm font-semibold">{entry.name}</span>
                        <span className="text-xs text-slate-400">{entry.description}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <motion.div layout className="rounded-lg border border-slate-900/70 bg-slate-950/60 p-4 text-sm text-slate-300">
            {selected ? <FamiliarDetails familiar={selected} /> : <p>Select a familiar to inspect its defensive effects.</p>}
          </motion.div>
        </div>
      )}
    </div>
  );
}

type FamiliarGroup = { name: string; familiars: Familiar[] };

function groupFamiliars(familiars: Familiar[]): FamiliarGroup[] {
  const categories: Record<string, Familiar[]> = {};
  for (const entry of familiars) {
    const category = mapCategory(entry.category);
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(entry);
  }
  return Object.entries(categories)
    .map(([name, list]) => ({ name, familiars: list.sort((a, b) => a.name.localeCompare(b.name)) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function mapCategory(category: Familiar['category']): string {
  switch (category) {
    case 'dps':
      return 'Damage & Pressure';
    case 'healing':
      return 'Healing & Sustain';
    case 'utility':
      return 'Utility & Logistics';
    case 'tank':
      return 'Damage Absorption';
    default:
      return 'Other';
  }
}

type FamiliarDetailsProps = { familiar: Familiar };

function FamiliarDetails({ familiar }: FamiliarDetailsProps): JSX.Element {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-base font-semibold text-emerald-200">{familiar.name}</h4>
        <p className="text-xs uppercase tracking-wide text-slate-400">{mapCategory(familiar.category)}</p>
      </div>
      <p>{familiar.description}</p>
      <ul className="space-y-2 text-sm text-slate-300">
        {familiar.effects.map((effect, index) => (
          <li key={index} className="rounded border border-slate-900/60 bg-slate-950/40 px-3 py-2">
            {describeEffect(effect)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function describeEffect(effect: Familiar['effects'][number]): string {
  if (effect.type === 'damageTakenMultiplier') {
    return `Reduces incoming damage by ${formatEffectValue(effect.value)}.`;
  }
  if (effect.type === 'healing') {
    return `${effect.source === 'special' ? 'Special move' : 'Passive'} healing for ${formatEffectValue(effect.value)} of dealt damage.`;
  }
  return 'Unique effect';
}

function formatEffectValue(value: number): string {
  if (Math.abs(value) <= 1) {
    return `${Math.round(value * 100)}%`;
  }
  return `${Math.round(value).toLocaleString()}`;
}
