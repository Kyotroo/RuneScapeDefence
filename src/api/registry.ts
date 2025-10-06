import { fetchArmor } from './armor';
import { fetchPrayers } from './supportingData';
import { fetchAuras } from './supportingData';
import { fetchFamiliars } from './supportingData';
import { fetchBosses } from './supportingData';
import { CombatStyle } from '../types/config';

export const apiRegistry: Array<{
  key: string;
  queryKey: unknown[];
  fetcher: () => Promise<unknown>;
  ttlMs: number;
}> = [
  {
    key: 'armor-melee',
    queryKey: ['armor', 'melee'],
    fetcher: () => fetchArmor('melee'),
    ttlMs: 30 * 60 * 1000
  },
  {
    key: 'armor-ranged',
    queryKey: ['armor', 'ranged'],
    fetcher: () => fetchArmor('ranged'),
    ttlMs: 30 * 60 * 1000
  },
  {
    key: 'armor-magic',
    queryKey: ['armor', 'magic'],
    fetcher: () => fetchArmor('magic'),
    ttlMs: 30 * 60 * 1000
  },
  {
    key: 'armor-necromancy',
    queryKey: ['armor', 'necromancy'],
    fetcher: () => fetchArmor('necromancy' as CombatStyle),
    ttlMs: 30 * 60 * 1000
  },
  {
    key: 'prayers',
    queryKey: ['prayers'],
    fetcher: fetchPrayers,
    ttlMs: 24 * 60 * 60 * 1000
  },
  {
    key: 'auras',
    queryKey: ['auras'],
    fetcher: fetchAuras,
    ttlMs: 24 * 60 * 60 * 1000
  },
  {
    key: 'familiars',
    queryKey: ['familiars'],
    fetcher: fetchFamiliars,
    ttlMs: 24 * 60 * 60 * 1000
  },
  {
    key: 'bosses',
    queryKey: ['bosses'],
    fetcher: fetchBosses,
    ttlMs: 2 * 60 * 60 * 1000
  }
];
