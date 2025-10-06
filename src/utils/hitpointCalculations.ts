import { ArmorPiece, Aura, Prayer } from '../types/api';

const BONFIRE_PERCENT = 0.05;

export function calculateBaseHp(constitutionLevel: number): number {
  return 1000 + (constitutionLevel - 10) * 100;
}

type HitpointInput = {
  constitutionLevel: number;
  armorPieces: ArmorPiece[];
  prayer: Prayer | null;
  aura: Aura | null;
};

export function calculateHitpoints({ constitutionLevel, armorPieces, prayer, aura }: HitpointInput) {
  const baseHp = calculateBaseHp(constitutionLevel);
  const armorBonus = armorPieces.reduce((sum, piece) => sum + (piece.lifepointsBonus ?? 0), 0);

  const prayerBonus = prayer
    ? prayer.effects
        .filter((effect) => effect.type === 'lifepointBonus')
        .reduce((sum, effect) => sum + (effect as { value: number }).value, 0)
    : 0;

  const auraBonus = aura
    ? aura.modifiers
        .filter((modifier) => modifier.type === 'defence')
        .reduce((sum, modifier) => sum + modifier.value, 0)
    : 0;

  const bonfireBonus = Math.round((baseHp + armorBonus + prayerBonus) * BONFIRE_PERCENT);
  const totalMax = baseHp + armorBonus + prayerBonus + auraBonus + bonfireBonus;

  return {
    baseHp,
    armorBonus,
    prayerBonus,
    auraBonus,
    bonfireBonus,
    totalMax
  };
}
