import { ArmorPiece } from '../types/api';
import { CombatStyle } from '../types/config';
import { httpGet } from './http';

const ARMOR_ENDPOINT = 'https://api.weirdgloop.org/runescape/items/search';

export async function fetchArmor(style: CombatStyle): Promise<ArmorPiece[]> {
  const params = new URLSearchParams({
    type: 'armour',
    json: '1',
    limit: '200',
    category: mapStyleToCategory(style)
  });

  const response = await httpGet<ArmorPiece[]>(`${ARMOR_ENDPOINT}?${params.toString()}`);
  return response.map((piece) => ({
    ...piece,
    combatStyle: style
  }));
}

function mapStyleToCategory(style: CombatStyle): string {
  switch (style) {
    case 'melee':
      return 'melee';
    case 'ranged':
      return 'ranged';
    case 'magic':
      return 'magic';
    case 'necromancy':
      return 'necromancy';
    default:
      return 'melee';
  }
}
