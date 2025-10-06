export type FreshnessMetadata = {
  updatedAt: number;
  ttl: number;
};

export type ArmorPiece = {
  id: number;
  name: string;
  tier: number;
  slot: string;
  combatStyle: 'melee' | 'ranged' | 'magic' | 'necromancy';
  armorType: 'power' | 'tank';
  armorValue: number;
  damageBonus: number;
  lifepointsBonus: number;
  prayerBonus: number;
  requirementDefence: number;
  equipSlot: string;
};

export type Prayer = {
  id: string;
  name: string;
  category: 'standard' | 'ancient';
  drainRate: number;
  description: string;
  effects: PrayerEffect[];
};

export type PrayerEffect =
  | { type: 'damageReduction'; value: number; style: 'melee' | 'ranged' | 'magic' | 'necromancy' | 'all' }
  | { type: 'lifepointBonus'; value: number }
  | { type: 'defenceModifier'; value: number };

export type Aura = {
  id: string;
  name: string;
  description: string;
  modifiers: Array<{
    type: 'damageTaken' | 'healing' | 'accuracy' | 'defence';
    value: number;
  }>;
};

export type Familiar = {
  id: string;
  name: string;
  category: 'dps' | 'healing' | 'utility' | 'tank';
  description: string;
  effects: FamiliarEffect[];
};

export type FamiliarEffect =
  | { type: 'damageTakenMultiplier'; value: number }
  | { type: 'healing'; value: number; source: 'passive' | 'special' };

export type BossMechanic = {
  id: string;
  name: string;
  description: string;
  attackType: 'melee' | 'ranged' | 'magic' | 'necromancy' | 'typeless';
  hits: number;
  baseDamage: number;
  damageFormula?: string;
  canBeAvoided: boolean;
  tips?: string;
  enrageChanges?: Array<{
    threshold: number;
    description: string;
  }>;
};

export type BossEncounter = {
  id: string;
  name: string;
  enrageCap?: number;
  modes: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  mechanics: BossMechanic[];
};
