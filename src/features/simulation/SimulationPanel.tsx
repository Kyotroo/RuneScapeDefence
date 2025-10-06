import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUserConfig } from '../../state/UserConfigContext';
import { calculateMitigatedDamage } from '../../utils/simulation';
import { ArmorPiece } from '../../types/api';

export function SimulationPanel(): JSX.Element {
  const {
    configuration: { boss, enrage, activePrayer, activeAura, familiar, armor }
  } = useUserConfig();

  const mechanics = useMemo(() => boss?.mechanics ?? [], [boss]);

  const results = useMemo(() => {
    if (!boss) return null;
    const equippedArmor = Object.values(armor ?? {}).filter((piece): piece is ArmorPiece => Boolean(piece));

    return mechanics.slice(0, 5).map((mechanic) =>
      calculateMitigatedDamage({
        mechanic,
        enrage,
        aura: activeAura,
        prayer: activePrayer,
        familiar,
        armorPieces: equippedArmor
      })
    );
  }, [activeAura, activePrayer, armor, boss, enrage, familiar, mechanics]);

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
          <MechanicResult key={result.mechanic.id} result={result} />
        ))}
      </div>
    </motion.div>
  );
}

type MechanicResultProps = {
  result: ReturnType<typeof calculateMitigatedDamage>;
};

function MechanicResult({ result }: MechanicResultProps): JSX.Element {
  return (
    <div className="rounded-lg border border-slate-900/70 bg-slate-950/60 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-200">{result.mechanic.name}</h4>
          <p className="text-xs text-slate-400">{result.mechanic.description}</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold text-emerald-300">{Math.round(result.finalDamage).toLocaleString()} dmg</p>
          <p className="text-xs text-slate-400">{result.reductionSummary.map((step) => step.label).join(' → ')}</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-xs text-slate-300">
        {result.reductionSummary.map((step) => (
          <div key={step.label} className="flex items-center justify-between">
            <span>{step.label}</span>
            <span>{Math.round(step.value).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
