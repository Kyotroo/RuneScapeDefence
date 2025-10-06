import { Aura, BossEncounter, Familiar, Prayer } from '../types/api';
import { httpGet } from './http';

const COMMUNITY_DATA_ROOT = 'https://runescape-calcs.github.io/data';

export async function fetchPrayers(): Promise<Prayer[]> {
  return httpGet<Prayer[]>(`${COMMUNITY_DATA_ROOT}/prayers.json`, 24 * 60 * 60 * 1000);
}

export async function fetchAuras(): Promise<Aura[]> {
  return httpGet<Aura[]>(`${COMMUNITY_DATA_ROOT}/auras.json`, 24 * 60 * 60 * 1000);
}

export async function fetchFamiliars(): Promise<Familiar[]> {
  return httpGet<Familiar[]>(`${COMMUNITY_DATA_ROOT}/familiars.json`, 24 * 60 * 60 * 1000);
}

export async function fetchBosses(): Promise<BossEncounter[]> {
  return httpGet<BossEncounter[]>(`${COMMUNITY_DATA_ROOT}/bosses.json`, 2 * 60 * 60 * 1000);
}
