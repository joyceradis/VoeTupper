import { describe, expect, it } from 'vitest';
import { createEmptyState } from './model';
import {
  createLocalPilotStore,
  LEGACY_BACKUP_KEY,
  LEGACY_STATE_KEY,
  V2_STATE_KEY,
} from './storage';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  readonly writes: string[] = [];
  failWrites = false;

  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new DOMException('Quota exceeded', 'QuotaExceededError');
    this.writes.push(key);
    this.values.set(key, value);
  }
}

const now = () => '2026-09-05T12:00:00.000Z';

describe('local pilot store', () => {
  it('loads an existing V2 state without migration', () => {
    const storage = new MemoryStorage();
    const expected = createEmptyState(now());
    storage.setItem(V2_STATE_KEY, JSON.stringify(expected));

    const result = createLocalPilotStore(storage, now).load();

    expect(result).toEqual({ state: expected, source: 'v2' });
    expect(storage.getItem(LEGACY_BACKUP_KEY)).toBeNull();
  });

  it('backs up legacy text before writing migrated V2 state', () => {
    const storage = new MemoryStorage();
    const legacy = JSON.stringify({ workspace: {}, consultants: [], orders: [] });
    storage.setItem(LEGACY_STATE_KEY, legacy);
    storage.writes.length = 0;

    const result = createLocalPilotStore(storage, now).load();

    expect(result.source).toBe('legacy');
    expect(storage.writes).toEqual([LEGACY_BACKUP_KEY, V2_STATE_KEY]);
    expect(storage.getItem(LEGACY_BACKUP_KEY)).toBe(legacy);
    expect(storage.getItem(LEGACY_STATE_KEY)).toBe(legacy);
  });

  it('returns an empty state and warning for malformed legacy JSON', () => {
    const storage = new MemoryStorage();
    storage.setItem(LEGACY_STATE_KEY, '{broken');

    const result = createLocalPilotStore(storage, now).load();

    expect(result.source).toBe('empty');
    expect(result.state.orders).toEqual([]);
    expect(result.warning).toBe('Não foi possível migrar os dados antigos. A cópia original foi preservada.');
    expect(storage.getItem(LEGACY_STATE_KEY)).toBe('{broken');
  });

  it('reports a failed save without changing the caller state', () => {
    const storage = new MemoryStorage();
    const state = createEmptyState(now());
    storage.failWrites = true;

    const result = createLocalPilotStore(storage, now).save(state);

    expect(result).toEqual({ saved: false, warning: 'Não foi possível salvar neste aparelho.' });
    expect(state).toEqual(createEmptyState(now()));
  });

  it('returns deterministic identities across repeated migrations', () => {
    const legacy = JSON.stringify({
      workspace: {},
      consultants: [{ name: 'Ana Maria', code: '123', status: 'ATIVA', role: 'leader', group: 'Grupo Ana' }],
      orders: [],
    });
    const firstStorage = new MemoryStorage();
    const secondStorage = new MemoryStorage();
    firstStorage.setItem(LEGACY_STATE_KEY, legacy);
    secondStorage.setItem(LEGACY_STATE_KEY, legacy);

    const first = createLocalPilotStore(firstStorage, now).load();
    const second = createLocalPilotStore(secondStorage, now).load();

    expect(first.state.people.map(person => person.id)).toEqual(second.state.people.map(person => person.id));
  });

  it('loads demo data only when requested and no saved data exists', () => {
    const result = createLocalPilotStore(new MemoryStorage(), now).load({ demo: true });

    expect(result.source).toBe('demo');
    expect(result.state.orders).toHaveLength(3);
  });
});
