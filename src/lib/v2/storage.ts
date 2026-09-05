import { createDemoState, createEmptyState, type V2State } from './model';
import { isV2State, migrateLegacyState } from './migration';

export const V2_STATE_KEY = 'voetupper-v2-state-v1';
export const LEGACY_STATE_KEY = 'voetupper-vitoriaware-state-v1';
export const LEGACY_BACKUP_KEY = 'voetupper-vitoriaware-state-v1:backup';

export type LoadResult = {
  state: V2State;
  source: 'v2' | 'legacy' | 'empty' | 'demo';
  warning?: string;
};

export interface PilotStore {
  load(options?: { demo?: boolean }): LoadResult;
  save(state: V2State): { saved: boolean; warning?: string };
}

export function createLocalPilotStore(
  storage: Storage,
  now: () => string = () => new Date().toISOString(),
): PilotStore {
  return {
    load(options) {
      const current = storage.getItem(V2_STATE_KEY);
      if (current) {
        try {
          const parsed: unknown = JSON.parse(current);
          if (isV2State(parsed)) return { state: parsed, source: 'v2' };
        } catch {
          // Fall through to the preserved legacy value or a safe blank state.
        }
      }

      const legacy = storage.getItem(LEGACY_STATE_KEY);
      if (legacy) {
        try {
          const migrated = migrateLegacyState(legacy, now());
          storage.setItem(LEGACY_BACKUP_KEY, legacy);
          storage.setItem(V2_STATE_KEY, JSON.stringify(migrated));
          return { state: migrated, source: 'legacy' };
        } catch {
          return {
            state: createEmptyState(now()),
            source: 'empty',
            warning: 'Não foi possível migrar os dados antigos. A cópia original foi preservada.',
          };
        }
      }

      if (options?.demo) return { state: createDemoState(now()), source: 'demo' };
      if (current) {
        return {
          state: createEmptyState(now()),
          source: 'empty',
          warning: 'Os dados salvos neste aparelho não puderam ser lidos.',
        };
      }
      return { state: createEmptyState(now()), source: 'empty' };
    },
    save(state) {
      try {
        storage.setItem(V2_STATE_KEY, JSON.stringify(state));
        return { saved: true };
      } catch {
        return { saved: false, warning: 'Não foi possível salvar neste aparelho.' };
      }
    },
  };
}
