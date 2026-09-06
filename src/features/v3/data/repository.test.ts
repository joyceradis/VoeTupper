import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createRepository } from './repository';

describe('V3 repository selection', () => {
  it('never falls back to fake people when real mode is unconfigured', async () => {
    const result = await createRepository({ demo: false, client: null }).loadSnapshot();

    expect(result).toEqual({ kind: 'configuration-required' });
  });

  it('loads visibly labelled example data only when demo mode is explicit', async () => {
    const result = await createRepository({ demo: true, client: null }).loadSnapshot();

    expect(result.kind).toBe('ready');
    if (result.kind !== 'ready') throw new Error('Expected demo snapshot');
    expect(result.snapshot.mode).toBe('DEMO');
    expect(result.snapshot.viewer.displayName).toContain('exemplo');
  });

  it('returns signed out before attempting to load real rows', async () => {
    const client = {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
    };

    const result = await createRepository({ demo: false, client: client as unknown as SupabaseClient }).loadSnapshot();

    expect(result).toEqual({ kind: 'signed-out' });
  });
});
