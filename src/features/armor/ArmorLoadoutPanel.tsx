import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { ArmorPiece } from '../../types/api';
import { ArmorSlot } from '../../types/config';
import { useUserConfig } from '../../state/UserConfigContext';
import { fetchArmor } from '../../api/armor';

const armorSlots: ArmorSlot[] = ['head', 'body', 'legs', 'hands', 'feet', 'cape', 'ring', 'amulet', 'pocket'];

const tierFilters = [70, 75, 80, 85, 90, 92, 95];

export function ArmorLoadoutPanel(): JSX.Element {
  const {
    configuration: { armor, combatStyle },
    updateConfig
  } = useUserConfig();
  const [tier, setTier] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['armor', combatStyle],
    queryFn: () => fetchArmor(combatStyle),
    staleTime: 30 * 60 * 1000
  });

  const filteredArmor = useMemo(() => {
    if (!data) return [];
    return data.filter((piece) => {
      if (tier && piece.tier !== tier) return false;
      if (query && !piece.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [data, tier, query]);

  return (
    <div className="space-y-4 rounded-xl border border-slate-900/70 bg-slate-900/60 p-6 shadow-inner">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Armor & Equipment</h3>
          <p className="text-sm text-slate-400">Select gear pieces to automatically project life point bonuses.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search gear"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <select
            value={tier ?? ''}
            onChange={(event) => setTier(event.target.value ? Number(event.target.value) : null)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All tiers</option>
            {tierFilters.map((value) => (
              <option key={value} value={value}>
                Tier {value}
              </option>
            ))}
          </select>
        </div>
      </header>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-3">
          {armorSlots.map((slot) => (
            <ArmorSlotCard
              key={slot}
              slot={slot}
              selected={armor?.[slot] ?? null}
              onClear={() => updateConfig('armor', { ...armor, [slot]: null })}
            />
          ))}
        </div>
        <div className="rounded-lg border border-slate-900/70 bg-slate-950/60">
          <div className="flex items-center justify-between border-b border-slate-900/60 px-4 py-2 text-xs uppercase tracking-wide text-slate-400">
            <span>Available Gear</span>
            <span>{filteredArmor.length} pieces</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-sm text-slate-400">Loading gear from the wiki...</div>
            ) : (
              <ul className="divide-y divide-slate-900/60 text-sm">
                {filteredArmor.map((piece) => (
                  <li key={piece.id}>
                    <button
                      type="button"
                      onClick={() => updateConfig('armor', { ...armor, [piece.equipSlot as ArmorSlot]: piece })}
                      className={clsx(
                        'flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-900/60',
                        armor?.[piece.equipSlot as ArmorSlot]?.id === piece.id && 'bg-emerald-500/10 text-emerald-200'
                      )}
                    >
                      <div>
                        <p className="font-medium">{piece.name}</p>
                        <p className="text-xs text-slate-400">Tier {piece.tier} · {piece.armorType}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>LP +{piece.lifepointsBonus}</span>
                        <span>Armor {piece.armorValue}</span>
                      </div>
                    </button>
                  </li>
                ))}
                {!filteredArmor.length && (
                  <li className="px-4 py-3 text-xs text-slate-500">No gear matches your filters.</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type ArmorSlotCardProps = {
  slot: ArmorSlot;
  selected: ArmorPiece | null | undefined;
  onClear: () => void;
};

function ArmorSlotCard({ slot, selected, onClear }: ArmorSlotCardProps) {
  return (
    <motion.div
      layout
      className="flex items-center justify-between rounded-lg border border-slate-900/70 bg-slate-950/40 px-4 py-3"
    >
      <div>
        <p className="text-sm font-semibold capitalize">{slot}</p>
        <p className="text-xs text-slate-400">{selected ? selected.name : 'Nothing equipped'}</p>
      </div>
      {selected ? (
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-emerald-300 hover:text-emerald-200"
        >
          Clear
        </button>
      ) : null}
    </motion.div>
  );
}
