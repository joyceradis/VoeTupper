import { expect, it } from 'vitest';
import { mapSupabaseSnapshot } from './map-supabase';

it('maps authenticated rows without fabricating missing values', () => {
  const result = mapSupabaseSnapshot({
    personId: 'person-owner',
    memberships: [
      { id: 'membership-owner', person_id: 'person-owner', role: 'BUSINESS_OWNER', distribution_id: 'distribution-es', district_id: 'district-serra', group_id: null, started_at: '2026-01-01T00:00:00Z', ended_at: null },
      { id: 'membership-leader', person_id: 'person-leader', role: 'LEADER', distribution_id: 'distribution-es', district_id: 'district-serra', group_id: 'group-one', started_at: '2026-01-01T00:00:00Z', ended_at: null },
    ],
    people: [
      { id: 'person-owner', display_name: 'Ritheli Radis', status: 'ACTIVE', source_member_id: null, phone: null },
      { id: 'person-leader', display_name: 'Líder confirmada', status: 'ACTIVE', source_member_id: null, phone: null },
    ],
    groups: [{ id: 'group-one', name: 'Grupo confirmado', distribution_id: 'distribution-es', district_id: 'district-serra' }],
    districts: [{ id: 'district-serra', name: 'Serra', distribution_id: 'distribution-es', owner_person_id: 'person-owner' }],
    vitrine: { id: 'vitrine-09', label: 'Vitrine 09/2026', opens_at: '2026-08-25T15:00:00Z', closes_at: '2026-09-07T15:00:00Z', timezone: 'America/Sao_Paulo' },
    goals: [{ id: 'goal-one', vitrine_id: 'vitrine-09', person_id: 'person-leader', goal_type: 'sales', target_value: 1000, current_value: 800 }],
  });

  expect(result.kind).toBe('ready');
  if (result.kind !== 'ready') throw new Error('Expected mapped snapshot');
  expect(result.snapshot.mode).toBe('REAL');
  expect(result.snapshot.viewer.displayName).toBe('Ritheli Radis');
  expect(result.snapshot.people[1]).toMatchObject({ role: 'LEADER', businessCode: null });
  expect(result.snapshot.goals[0]).toMatchObject({ type: 'SALES', target: 1000, current: 800 });
});

it('rejects a snapshot when the signed-in person has no current membership', () => {
  const result = mapSupabaseSnapshot({
    personId: 'person-owner',
    memberships: [],
    people: [],
    groups: [],
    districts: [],
    vitrine: null,
    goals: [],
  });

  expect(result).toEqual({ kind: 'error', message: 'Sua conta ainda não está vinculada à rede.' });
});
