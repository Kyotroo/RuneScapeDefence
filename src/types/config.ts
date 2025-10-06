import { ArmorPiece, Aura, BossEncounter, Familiar, Prayer } from './api';

export type CombatStyle = 'melee' | 'ranged' | 'magic' | 'necromancy';

export type UserConfiguration = {
  combatStyle: CombatStyle;
  constitutionLevel: number;
  armor: Partial<Record<ArmorSlot, ArmorPiece | null>>;
  activePrayer: Prayer | null;
  activeAura: Aura | null;
  familiar: Familiar | null;
  boss: BossEncounter | null;
  bossModeId: string | null;
  enrage: number;
  currentHitpointsPercent: number;
};

export type ArmorSlot =
  | 'head'
  | 'body'
  | 'legs'
  | 'hands'
  | 'feet'
  | 'cape'
  | 'ring'
  | 'amulet'
  | 'pocket';

export const defaultConfiguration: UserConfiguration = {
  combatStyle: 'melee',
  constitutionLevel: 99,
  armor: {
    head: null,
    body: null,
    legs: null,
    hands: null,
    feet: null,
    cape: null,
    ring: null,
    amulet: null,
    pocket: null
  },
  activePrayer: null,
  activeAura: null,
  familiar: null,
  boss: null,
  bossModeId: null,
  enrage: 0,
  currentHitpointsPercent: 100
};
