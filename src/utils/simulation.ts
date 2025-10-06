import { ArmorPiece, Aura, BossMechanic, Familiar, Prayer } from '../types/api';

type SimulationInput = {
  mechanic: BossMechanic;
  enrage: number;
  aura: Aura | null;
  prayer: Prayer | null;
  familiar: Familiar | null;
  armorPieces: Array<ArmorPiece | null>;
};

export function calculateMitigatedDamage({ mechanic, enrage, aura, prayer, familiar, armorPieces }: SimulationInput) {
  const enrageMultiplier = 1 + enrage / 1000;
  const base = mechanic.baseDamage * enrageMultiplier;

  const armorReduction = armorPieces.some((piece) => piece?.armorType === 'tank') ? 0.12 : 0.05;
  const afterArmor = base * (1 - armorReduction);

  const prayerReduction =
    prayer?.effects?.find(
      (effect) => effect.type === 'damageReduction' && (effect.style === mechanic.attackType || effect.style === 'all')
    )?.value ?? 0;
  const afterPrayer = afterArmor * (1 - prayerReduction);

  const auraPenalty = aura?.modifiers.some((modifier) => modifier.type === 'damageTaken')
    ? aura.modifiers
        .filter((modifier) => modifier.type === 'damageTaken')
        .reduce((sum, modifier) => sum + modifier.value, 0)
    : 0;
  const afterAura = afterPrayer * (1 + auraPenalty);

  const familiarReduction = familiar?.effects?.find((effect) => effect.type === 'damageTakenMultiplier')?.value ?? 0;
  const finalDamage = afterAura * (1 - familiarReduction);

  return {
    mechanic,
    finalDamage,
    reductionSummary: [
      { label: 'Base', value: base },
      { label: 'Armor', value: afterArmor },
      { label: 'Prayer', value: afterPrayer },
      { label: 'Aura', value: afterAura },
      { label: 'Familiar', value: finalDamage }
    ]
  };
}
