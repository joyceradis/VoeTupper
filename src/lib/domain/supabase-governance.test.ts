import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function read(path:string){
  const url = new URL(`../../../${path}`, import.meta.url);
  return existsSync(url) ? readFileSync(url,'utf8') : '';
}

const core = read('supabase/migrations/0003_network_core.sql');
const rls = read('supabase/migrations/0004_network_rls.sql');
const v3 = read('supabase/migrations/0008_v3_vitrines_profiles.sql');
const seed = read('supabase/seed.sql');

describe('Supabase multiuser governance schema', () => {
  it('models one person independently from changing network memberships', () => {
    expect(core).toContain('create table if not exists public.people');
    expect(core).toContain('create table if not exists public.memberships');
    expect(core).toContain('person_id uuid not null references public.people');
    expect(core).toContain("'DISTRIBUTION','BUSINESS_OWNER','LEADER','CONSULTANT'");
    expect(core).toContain('one_current_membership_per_person');
  });

  it('models the territorial hierarchy and operational records', () => {
    for (const table of ['distributions','districts','groups','goals','performance_snapshots','achievements','network_events','audit_log']) {
      expect(core).toContain(`public.${table}`);
    }
    expect(core).toContain('distribution_id uuid not null references public.distributions');
    expect(core).toContain('district_id uuid references public.districts');
    expect(core).toContain('group_id uuid references public.groups');
  });

  it('uses RLS and aggregate peer scoreboards instead of frontend-only filtering', () => {
    expect(rls).toContain('enable row level security');
    expect(rls).toContain('current_person_id()');
    expect(rls).toContain('current_membership()');
    expect(rls).toContain('business_owner_scoreboard');
    expect(rls).toContain('leader_scoreboard');
    expect(rls).toContain('same_distribution');
    expect(rls).toContain('same_district');
    expect(rls).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('seeds the six confirmed ES districts without inventing emails', () => {
    for (const district of ['Norte','Noroeste','Serra','Vitória','Vila Velha e Sul','Cariacica']) expect(seed).toContain(district);
    for (const person of ['Gerusa','Giseli Aguilar','Adriana Junta','Ritheli Radis','Tatiana Madeira','Adriana Maia','Vanessa Luciana']) expect(seed).toContain(person);
    expect(seed).not.toMatch(/@[a-z0-9.-]+\.[a-z]{2,}/i);
  });

  it('keeps Vitrine goals in protected person-scoped records', () => {
    expect(v3).toContain('create table if not exists public.vitrines');
    expect(v3).toContain('create table if not exists public.vitrine_goals');
    expect(v3).toContain('America/Sao_Paulo');
    expect(v3).toContain('alter table public.vitrines enable row level security');
    expect(v3).toContain('vitrine_goals_scoped_read');
    expect(v3).toContain('can_read_operational_scope');
    expect(v3).toContain('can_admin_scope');
    expect(v3).toContain('to authenticated');
    expect(v3).toContain('alter view public.business_owner_scoreboard set (security_invoker = true)');
    expect(v3).toContain('revoke all on function public.current_person_id() from public, anon');
  });
});
