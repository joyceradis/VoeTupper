import type { SupabaseClient } from '@supabase/supabase-js';
import type { V3Snapshot } from '../domain/model';
import { createDemoRepository } from './demo-repository';
import { createSupabaseRepository } from './supabase-repository';

export type LoadSnapshotResult =
  | { kind: 'ready'; snapshot: V3Snapshot }
  | { kind: 'signed-out' }
  | { kind: 'configuration-required' }
  | { kind: 'error'; message: string };

export interface V3Repository {
  loadSnapshot(): Promise<LoadSnapshotResult>;
}

export function createRepository({ demo, client }: { demo: boolean; client: SupabaseClient | null }): V3Repository {
  if (demo) return createDemoRepository();
  if (client) return createSupabaseRepository(client);
  return { async loadSnapshot() { return { kind: 'configuration-required' }; } };
}
