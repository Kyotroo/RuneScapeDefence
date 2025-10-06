import { useMemo } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useUserConfig } from '../../state/UserConfigContext';
import { calculateMitigatedDamage } from '../../utils/simulation';
import { ArmorPiece } from '../../types/api';
import { calculateHitpoints } from '../../utils/hitpointCalculations';

export function SimulationPanel(): JSX.Element {
  const {
    configuration: { boss, enrage, activePrayer, activeAura, familiar, armor, constitutionLevel, currentHitpointsPercent }
  } = useUserConfig();

  const mechanics = useMemo(() => boss?.mechanics ?? [], [boss]);

  const results = useMemo(() => {
    if (!boss) return null;
    const equippedArmor = Object.values(armor ?? {}).filter((piece): piece is ArmorPiece => Boolean(piece));
    const { totalMax } = calculateHitpoints({
      constitutionLevel,
      armorPieces: equippedArmor,
      prayer: activePrayer,
      aura: activeAura
    });
    const currentHp = (currentHitpointsPercent / 100) * totalMax;

    return mechanics.slice(0, 5).map((mechanic) => {
      const mitigation = calculateMitigatedDamage({
        mechanic,
        enrage,
        aura: activeAura,
        prayer: activePrayer,
        familiar,
        armorPieces: equippedArmor
      });
      const remainingHp = Math.max(currentHp - mitigation.finalDamage, 0);
      const severity = mitigation.finalDamage / totalMax;
      return {
        breakdown: mitigation,
        remainingHp,
        severity,
        isFatal: mitigation.finalDamage >= currentHp,
        maxHp: totalMax,
        currentHp
      };
    });
  }, [activeAura, activePrayer, armor, boss, constitutionLevel, currentHitpointsPercent, enrage, familiar, mechanics]);

  if (!boss) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-slate-900/70 bg-slate-900/60 p-6 text-sm text-slate-400"
      >
        Choose an encounter to preview mitigation breakdowns.
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 rounded-xl border border-slate-900/70 bg-slate-900/60 p-6 shadow-inner"
    >
      <header>
        <h3 className="text-lg font-semibold">Survivability Preview</h3>
        <p className="text-sm text-slate-400">
          Preview mitigation on highlighted mechanics. Full simulation engine runs in a worker thread in future iterations.
        </p>
      </header>
      <div className="space-y-4">
        {results?.map((result) => (
          <MechanicResult key={result.breakdown.mechanic.id} result={result} />
        ))}
      </div>
    </motion.div>
  );
}

type MechanicResultProps = {
  result: {
    breakdown: ReturnType<typeof calculateMitigatedDamage>;
    remainingHp: number;
    severity: number;
    isFatal: boolean;
    maxHp: number;
    currentHp: number;
  };
};

function MechanicResult({ result }: MechanicResultProps): JSX.Element {
  const { breakdown, remainingHp, severity, isFatal, maxHp, currentHp } = result;
  return (
    <div className="rounded-lg border border-slate-900/70 bg-slate-950/60 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-200">{breakdown.mechanic.name}</h4>
          <p className="text-xs text-slate-400">{breakdown.mechanic.description}</p>
        </div>
        <div className="text-right text-sm">
          <p className={clsx('font-semibold', isFatal ? 'text-rose-300' : severity > 0.5 ? 'text-amber-300' : 'text-emerald-300')}>
            {Math.round(breakdown.finalDamage).toLocaleString()} dmg
          </p>
          <p className="text-xs text-slate-400">{breakdown.reductionSummary.map((step) => step.label).join(' → ')}</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-xs text-slate-300">
        {breakdown.reductionSummary.map((step) => (
          <div key={step.label} className="flex items-center justify-between">
            <span>{step.label}</span>
            <span>{Math.round(step.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded border border-slate-900/60 bg-slate-950/40 px-3 py-2 text-xs text-slate-300">
        <p>
          Outcome:{' '}
          {isFatal ? (
            <span className="font-semibold text-rose-300">☠️ Fatal — {Math.abs(Math.round(remainingHp)).toLocaleString()} LP short</span>
          ) : (
            <span className="font-semibold text-emerald-200">
              ✅ Survive with {Math.round(remainingHp).toLocaleString()} LP ({Math.max((remainingHp / maxHp) * 100, 0).toFixed(1)}%)
            </span>
          )}
        </p>
        <p className="mt-1 text-slate-400">
          Current HP before hit: {Math.round(currentHp).toLocaleString()} · Maximum HP: {Math.round(maxHp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
