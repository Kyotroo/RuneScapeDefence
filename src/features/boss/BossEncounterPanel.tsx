import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { BossEncounter } from '../../types/api';
import { useUserConfig } from '../../state/UserConfigContext';
import { fetchBosses } from '../../api/supportingData';

const enrageMilestones = [0, 100, 500, 1000, 1500, 2000, 3000, 4000];

export function BossEncounterPanel(): JSX.Element {
  const {
    configuration: { boss, bossModeId, enrage },
    updateConfig
  } = useUserConfig();

  const { data: bosses = [], isLoading } = useQuery({
    queryKey: ['bosses'],
    queryFn: fetchBosses,
    staleTime: 2 * 60 * 60 * 1000
  });

  return (
    <div className="space-y-5 rounded-xl border border-slate-900/70 bg-slate-900/60 p-6 shadow-inner">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Encounter Selection</h3>
          <p className="text-sm text-slate-400">Choose a boss and configure enrage & mode. Mechanics load directly from community data.</p>
        </div>
        <button
          type="button"
          className="text-xs text-emerald-300 hover:text-emerald-200"
          onClick={() => updateConfig('boss', null)}
        >
          Reset encounter
        </button>
      </header>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="rounded-lg border border-slate-900/70 bg-slate-950/60">
          <div className="border-b border-slate-900/60 px-4 py-2 text-xs uppercase tracking-wide text-slate-400">
            Boss Library
          </div>
          <div className="max-h-72 overflow-y-auto">
            {isLoading ? (
              <p className="p-4 text-sm text-slate-400">Loading bosses and mechanics...</p>
            ) : (
              <ul className="divide-y divide-slate-900/60">
                {bosses.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => {
                        updateConfig('boss', entry);
                        updateConfig('bossModeId', entry.modes.at(0)?.id ?? null);
                      }}
                      className={clsx(
                        'flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-slate-900/60',
                        boss?.id === entry.id && 'bg-emerald-500/10 text-emerald-200'
                      )}
                    >
                      <span className="text-sm font-semibold">{entry.name}</span>
                      <span className="text-xs text-slate-400">
                        {entry.mechanics.length} mechanics · {entry.enrageCap ? `Enrage up to ${entry.enrageCap}%` : 'Static difficulty'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-900/70 bg-slate-950/60 p-4">
            <h4 className="text-sm font-semibold text-slate-200">Mode & Enrage</h4>
            {boss ? (
              <div className="mt-3 space-y-3">
                <select
                  value={bossModeId ?? boss.modes.at(0)?.id ?? ''}
                  onChange={(event) => updateConfig('bossModeId', event.target.value)}
                  className="w-full rounded border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  {boss.modes.map((mode) => (
                    <option key={mode.id} value={mode.id}>
                      {mode.name}
                    </option>
                  ))}
                </select>
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wide text-slate-400">Enrage</label>
                  <input
                    type="range"
                    min={0}
                    max={boss.enrageCap ?? 4000}
                    value={enrage}
                    onChange={(event) => updateConfig('enrage', Number(event.target.value))}
                    className="mt-2 w-full"
                  />
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] sm:items-center">
                    <input
                      type="number"
                      min={0}
                      max={boss.enrageCap ?? 4000}
                      value={enrage}
                      onChange={(event) => updateConfig('enrage', Number(event.target.value))}
                      className="w-full rounded border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                    <EnragePresets
                      max={boss.enrageCap ?? 4000}
                      onSelect={(value) => updateConfig('enrage', value)}
                    />
                  </div>
                  <EnrageMilestones value={enrage} />
                  <EnrageInsights boss={boss} value={enrage} />
                </div>
                <MechanicSummary boss={boss} enrage={enrage} />
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">Select a boss to configure encounter details.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type MechanicSummaryProps = {
  boss: BossEncounter;
  enrage: number;
};

function MechanicSummary({ boss, enrage }: MechanicSummaryProps): JSX.Element {
  const featured = boss.mechanics.slice(0, 3);
  return (
    <div className="rounded border border-slate-900/60 bg-slate-950/40 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">Featured mechanics</p>
      <ul className="mt-2 space-y-2 text-sm">
        {featured.map((mechanic) => (
          <li key={mechanic.id} className="text-slate-300">
            <span className="font-semibold text-emerald-300">{mechanic.name}</span>
            <span className="ml-2 text-xs text-slate-400">{mechanic.description}</span>
            <EnrageCallout mechanic={mechanic} enrage={enrage} />
          </li>
        ))}
      </ul>
    </div>
  );
}

type EnrageMilestonesProps = {
  value: number;
};

function EnrageMilestones({ value }: EnrageMilestonesProps): JSX.Element {
  return (
    <div className="mt-4 flex flex-wrap gap-2 text-xs">
      {enrageMilestones.map((milestone) => (
        <span
          key={milestone}
          className={clsx(
            'rounded-full border border-slate-800 px-3 py-1 text-slate-400',
            value >= milestone && 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200'
          )}
        >
          {milestone}%
        </span>
      ))}
    </div>
  );
}

type EnragePresetsProps = {
  max: number;
  onSelect: (value: number) => void;
};

const presets = [0, 100, 500, 1000, 1500, 2000, 3000];

function EnragePresets({ max, onSelect }: EnragePresetsProps): JSX.Element {
  return (
    <div className="flex flex-wrap gap-2 text-xs text-slate-400">
      {presets
        .filter((value) => value <= max)
        .map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => onSelect(value)}
            className="rounded border border-slate-800 px-2 py-1 transition hover:border-emerald-400/60 hover:text-emerald-200"
          >
            {value}%
          </button>
        ))}
    </div>
  );
}

type EnrageInsightsProps = {
  boss: BossEncounter;
  value: number;
};

function EnrageInsights({ boss, value }: EnrageInsightsProps): JSX.Element {
  const multiplier = 1 + value / 1000;
  const color = getEnrageIntensityColor(value);
  const upcoming = useMemo(() => {
    return boss.mechanics
      .flatMap((mechanic) =>
        (mechanic.enrageChanges ?? [])
          .filter((change) => change.threshold >= value)
          .map((change) => ({
            mechanic: mechanic.name,
            threshold: change.threshold,
            description: change.description
          }))
      )
      .sort((a, b) => a.threshold - b.threshold)
      .slice(0, 2);
  }, [boss.mechanics, value]);

  return (
    <div className="space-y-2 text-xs text-slate-300">
      <p>
        <span className="font-semibold text-slate-200">Damage multiplier:</span>{' '}
        <span className={color}>{multiplier.toFixed(2)}×</span>
      </p>
      {upcoming.length ? (
        <ul className="space-y-1 text-slate-400">
          {upcoming.map((item) => (
            <li key={`${item.mechanic}-${item.threshold}`}>
              <span className="text-emerald-200">{item.threshold}%</span> · {item.mechanic} — {item.description}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-500">No additional mechanic escalations from current enrage.</p>
      )}
    </div>
  );
}

type EnrageCalloutProps = {
  mechanic: BossEncounter['mechanics'][number];
  enrage: number;
};

function EnrageCallout({ mechanic, enrage }: EnrageCalloutProps): JSX.Element | null {
  const trigger = mechanic.enrageChanges?.find((change) => change.threshold <= enrage);
  if (!trigger) return null;
  return (
    <span className="mt-1 block text-[11px] text-amber-300">
      ⚠️ {trigger.description}
    </span>
  );
}

function getEnrageIntensityColor(value: number): string {
  if (value < 500) return 'text-emerald-300';
  if (value < 1500) return 'text-amber-300';
  if (value < 3000) return 'text-orange-400';
  return 'text-rose-400';
}
