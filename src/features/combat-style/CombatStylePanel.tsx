import { motion } from 'framer-motion';
import clsx from 'clsx';
import { CombatStyle } from '../../types/config';
import { useUserConfig } from '../../state/UserConfigContext';

const STYLES: Array<{ id: CombatStyle; label: string; description: string; color: string }> = [
  {
    id: 'melee',
    label: 'Melee',
    description: 'Torva, Masterwork, Havoc defensives',
    color: 'border-melee/60 bg-melee/10 text-melee'
  },
  {
    id: 'ranged',
    label: 'Ranged',
    description: 'Sirenic, Ascension, ammo mitigation',
    color: 'border-ranged/60 bg-ranged/10 text-ranged'
  },
  {
    id: 'magic',
    label: 'Magic',
    description: 'Tectonic, Cryptbloom and wards',
    color: 'border-magic/60 bg-magic/10 text-magic'
  },
  {
    id: 'necromancy',
    label: 'Necromancy',
    description: 'Deathwarden, neutral triangle',
    color: 'border-necromancy/60 bg-necromancy/10 text-necromancy'
  }
];

export function CombatStylePanel(): JSX.Element {
  const {
    configuration: { combatStyle },
    updateConfig
  } = useUserConfig();

  return (
    <div className="grid gap-4 rounded-xl border border-slate-900/70 bg-slate-900/60 p-6 shadow-inner sm:grid-cols-2">
      {STYLES.map((style) => {
        const selected = combatStyle === style.id;
        return (
          <button
            key={style.id}
            type="button"
            onClick={() => updateConfig('combatStyle', style.id)}
            className={clsx(
              'group relative overflow-hidden rounded-lg border bg-slate-950/70 px-5 py-4 text-left transition',
              selected ? style.color : 'border-transparent hover:border-slate-700/80'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{style.label}</p>
                <p className="text-sm text-slate-400">{style.description}</p>
              </div>
              {selected && (
                <motion.span
                  layoutId="style-indicator"
                  className="h-3 w-3 rounded-full bg-emerald-400"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                />
              )}
            </div>
            <div className="mt-3 text-xs text-slate-500">
              {renderStyleNotes(style.id)}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function renderStyleNotes(style: CombatStyle): string {
  switch (style) {
    case 'melee':
      return 'Access to Berserker, Preparation and melee-specific tank perks.';
    case 'ranged':
      return 'Consider ammo mitigation, Reckless aura risk, and SGB thresholds.';
    case 'magic':
      return 'Cryptbloom tank synergy, Maniacal aura, and Disruption Shield combos.';
    case 'necromancy':
      return 'Dark powers, Deathguard scaling, unaffected by combat triangle.';
    default:
      return '';
  }
}
