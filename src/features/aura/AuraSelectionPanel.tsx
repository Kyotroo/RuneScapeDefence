import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchAuras } from '../../api/supportingData';
import { useUserConfig } from '../../state/UserConfigContext';
import { Aura } from '../../types/api';

export function AuraSelectionPanel(): JSX.Element {
  const {
    configuration: { activeAura },
    updateConfig
  } = useUserConfig();

  const { data: auras = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['auras'],
    queryFn: fetchAuras,
    staleTime: 24 * 60 * 60 * 1000
  });

  const grouped = useMemo(() => groupAuras(auras), [auras]);
  const selected = activeAura ? auras.find((aura) => aura.id === activeAura.id) ?? null : null;

  return (
    <div className="space-y-4 rounded-xl border border-slate-900/70 bg-slate-900/60 p-6 shadow-inner">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Aura Management</h3>
          <p className="text-sm text-slate-400">Choose an aura to factor accuracy, defensive, or damage taken modifiers.</p>
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
              onClick={() => updateConfig('activeAura', null)}
              className="rounded border border-slate-800 bg-slate-950/60 px-3 py-1 text-rose-200 hover:border-rose-500/60 hover:text-rose-100"
            >
              Clear aura
            </button>
          ) : null}
        </div>
      </header>
      {isLoading ? (
        <p className="text-sm text-slate-400">Fetching aura catalogue…</p>
      ) : (
        <div className="space-y-5">
          {grouped.map((group) => (
            <div key={group.name}>
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                <span>{group.name}</span>
                <span>{group.auras.length} auras</span>
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {group.auras.map((aura) => (
                  <button
                    key={aura.id}
                    type="button"
                    onClick={() => updateConfig('activeAura', aura)}
                    className={clsx(
                      'flex flex-col items-start gap-1 rounded-lg border bg-slate-950/60 p-4 text-left transition hover:border-slate-700/80',
                      selected?.id === aura.id && 'border-emerald-400/70 bg-emerald-500/10 text-emerald-100 shadow shadow-emerald-500/10'
                    )}
                  >
                    <span className="text-sm font-semibold">{aura.name}</span>
                    <span className="text-xs text-slate-400">{describeAuraSummary(aura)}</span>
                    <ul className="mt-2 space-y-1 text-xs text-slate-300">
                      {aura.modifiers.map((modifier, index) => (
                        <li key={index} className="rounded border border-slate-900/60 bg-slate-950/40 px-2 py-1">
                          {describeModifier(modifier)}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <AnimatePresence>
        {selected?.modifiers.some((modifier) => modifier.type === 'damageTaken' && modifier.value > 0) ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-lg border border-amber-500/60 bg-amber-500/10 p-3 text-xs text-amber-100"
          >
            ⚠️ Offensive aura detected — incoming damage is increased by{' '}
            {Math.round(
              selected.modifiers
                .filter((modifier) => modifier.type === 'damageTaken')
                .reduce((sum, modifier) => sum + modifier.value, 0) * 100
            )}
            %.
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type AuraGroup = { name: string; auras: Aura[] };

function groupAuras(auras: Aura[]): AuraGroup[] {
  const buckets: Record<string, Aura[]> = {};
  for (const aura of auras) {
    const category = deriveCategory(aura);
    if (!buckets[category]) {
      buckets[category] = [];
    }
    buckets[category].push(aura);
  }
  return Object.entries(buckets)
    .map(([name, list]) => ({ name, auras: list.sort((a, b) => a.name.localeCompare(b.name)) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function deriveCategory(aura: Aura): string {
  if (aura.modifiers.some((modifier) => modifier.type === 'damageTaken')) {
    return 'Offensive Auras';
  }
  if (aura.modifiers.some((modifier) => modifier.type === 'defence')) {
    return 'Defensive Auras';
  }
  if (aura.modifiers.some((modifier) => modifier.type === 'accuracy')) {
    return 'Accuracy & Consistency';
  }
  if (aura.modifiers.some((modifier) => modifier.type === 'healing')) {
    return 'Sustain';
  }
  return 'Specialist';
}

function describeModifier(modifier: Aura['modifiers'][number]): string {
  if (modifier.type === 'damageTaken') {
    const percentage = Math.round(modifier.value * 100);
    return percentage >= 0 ? `Take +${percentage}% damage` : `Take ${percentage}% less damage`;
  }
  if (modifier.type === 'defence') {
    return `Defensive bonus ${formatBonus(modifier.value)}.`;
  }
  if (modifier.type === 'accuracy') {
    return `Accuracy +${formatBonus(modifier.value)}.`;
  }
  if (modifier.type === 'healing') {
    return `Heal ${formatBonus(modifier.value)} of damage dealt.`;
  }
  return 'Unique effect';
}

function describeAuraSummary(aura: Aura): string {
  if (aura.modifiers.some((modifier) => modifier.type === 'damageTaken' && modifier.value > 0)) {
    return 'High-risk offensive aura';
  }
  if (aura.modifiers.some((modifier) => modifier.type === 'defence')) {
    return 'Defensive and durability focused';
  }
  if (aura.modifiers.some((modifier) => modifier.type === 'healing')) {
    return 'Sustain focused';
  }
  if (aura.modifiers.some((modifier) => modifier.type === 'accuracy')) {
    return 'Accuracy booster';
  }
  return 'Special utility aura';
}

function formatBonus(value: number): string {
  if (Math.abs(value) <= 1) {
    return `${Math.round(value * 100)}%`;
  }
  return `${Math.round(value)}`;
}
