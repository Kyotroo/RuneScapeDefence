import { useMemo } from 'react';
import { useUserConfig } from '../../state/UserConfigContext';
import { ArmorPiece } from '../../types/api';
import { calculateHitpoints } from '../../utils/hitpointCalculations';

export function HitpointOverview(): JSX.Element {
  const {
    configuration: {
      constitutionLevel,
      armor,
      activePrayer,
      activeAura,
      familiar,
      currentHitpointsPercent
    },
    updateConfig
  } = useUserConfig();

  const { baseHp, armorBonus, prayerBonus, auraBonus, totalMax, bonfireBonus } = useMemo(() => {
    const armorPieces = Object.values(armor ?? {})
      .filter(Boolean)
      .map((piece) => piece as ArmorPiece);
    return calculateHitpoints({
      constitutionLevel,
      armorPieces,
      prayer: activePrayer,
      aura: activeAura
    });
  }, [constitutionLevel, armor, activePrayer, activeAura]);

  const currentHp = Math.round((currentHitpointsPercent / 100) * totalMax);

  return (
    <div className="rounded-xl border border-slate-900/70 bg-slate-900/60 p-6 shadow-inner">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Vitality Dashboard</h3>
          <p className="text-sm text-slate-400">All bonuses automatically aggregated from your configuration.</p>
        </div>
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Constitution Level
          <input
            type="number"
            value={constitutionLevel}
            min={10}
            max={120}
            onChange={(event) => updateConfig('constitutionLevel', Number(event.target.value))}
            className="ml-2 w-16 rounded border border-slate-800 bg-slate-950 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </label>
      </header>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <dl className="space-y-3 text-sm">
          <Stat label="Base HP" value={baseHp} />
          <Stat label="Armor Bonus" value={armorBonus} />
          <Stat label="Prayer Bonus" value={prayerBonus} />
          <Stat label="Aura Bonus" value={auraBonus} />
          <Stat label="Bonfire Bonus" value={bonfireBonus} />
        </dl>
        <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-900/70 bg-slate-950/50 p-4">
          <div>
            <p className="text-sm text-slate-400">Total Max HP</p>
            <p className="text-3xl font-semibold text-emerald-300">{totalMax.toLocaleString()}</p>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Current HP %
              <input
                type="range"
                min={1}
                max={100}
                value={currentHitpointsPercent}
                onChange={(event) => updateConfig('currentHitpointsPercent', Number(event.target.value))}
                className="mt-2 w-full"
              />
            </label>
            <p className="mt-2 text-sm text-slate-300">
              Current HP: <span className="font-semibold text-emerald-200">{currentHp.toLocaleString()} LP</span>
            </p>
          </div>
          <div className="rounded border border-slate-900/60 bg-slate-950/40 p-3 text-xs text-slate-300">
            <p className="mb-2 text-[11px] uppercase tracking-wide text-slate-400">Active modifiers</p>
            <ul className="space-y-1">
              <li>
                <span className="text-slate-400">Prayer:</span>{' '}
                {activePrayer ? <span className="text-emerald-200">{activePrayer.name}</span> : 'None'}
              </li>
              <li>
                <span className="text-slate-400">Aura:</span>{' '}
                {activeAura ? <span className="text-emerald-200">{activeAura.name}</span> : 'None'}
              </li>
              <li>
                <span className="text-slate-400">Familiar:</span>{' '}
                {familiar ? <span className="text-emerald-200">{familiar.name}</span> : 'None'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

type StatProps = {
  label: string;
  value: number;
};

function Stat({ label, value }: StatProps) {
  return (
    <div className="flex items-center justify-between rounded border border-slate-900/60 bg-slate-950/40 px-3 py-2">
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="text-sm font-semibold text-slate-200">{value.toLocaleString()}</dd>
    </div>
  );
}
