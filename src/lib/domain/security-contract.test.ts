import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const core=readFileSync(new URL('../../../supabase/migrations/202609030001_network_core.sql',import.meta.url),'utf8');
const rls=readFileSync(new URL('../../../supabase/migrations/202609030002_rls.sql',import.meta.url),'utf8');
const seed=readFileSync(new URL('../../../supabase/seed.sql',import.meta.url),'utf8');

describe('Supabase multiuser security contract',()=>{
  it('creates the canonical network tables',()=>{
    for(const table of ['people','auth_identities','distributions','districts','groups','memberships','goals','orders','performance_snapshots','achievements','network_events','audit_log']){
      expect(core).toMatch(new RegExp(`create table[^;]*${table}`,'i'));
    }
  });

  it('enables RLS on every business table',()=>{
    for(const table of ['people','auth_identities','distributions','districts','groups','memberships','goals','orders','performance_snapshots','achievements','network_events','audit_log']){
      expect(rls.toLowerCase()).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it('uses aggregate peer views instead of exposing cross-district raw data',()=>{
    expect(core).toContain('business_owner_scoreboard');
    expect(core).toContain('leader_scoreboard');
    expect(rls).not.toMatch(/using\s*\(\s*true\s*\)/i);
  });

  it('seeds ES with Gerusa as distribution and six districts',()=>{
    for(const value of ['Gerusa','Norte','Noroeste','Serra','Vitória','Vila Velha e Sul','Cariacica'])expect(seed).toContain(value);
    expect(seed).toContain('Distribuição ES');
  });
});
