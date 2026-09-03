import { describe, expect, it } from 'vitest';

async function loadNetwork() {
  const modulePath = './network';
  return import(modulePath).catch(() => null);
}

const memberships = [
  {
    id: 'membership-leader-candidate',
    personId: 'person-leader-candidate',
    role: 'CONSULTANT',
    distributionId: 'es',
    districtId: 'serra',
    groupId: 'group-old',
    startedAt: '2026-01-01T00:00:00Z',
    endedAt: null,
  },
  {
    id: 'membership-moving-member',
    personId: 'person-moving-member',
    role: 'CONSULTANT',
    distributionId: 'es',
    districtId: 'serra',
    groupId: 'group-old',
    startedAt: '2026-02-01T00:00:00Z',
    endedAt: null,
  },
  {
    id: 'membership-staying-member',
    personId: 'person-staying-member',
    role: 'CONSULTANT',
    distributionId: 'es',
    districtId: 'serra',
    groupId: 'group-old',
    startedAt: '2026-03-01T00:00:00Z',
    endedAt: null,
  },
];

describe('network membership transitions', () => {
  it('promotes a consultant without changing person identity', async () => {
    const network = await loadNetwork();
    expect(network).not.toBeNull();
    if (!network) return;

    const result = network.promoteConsultantToLeader({
      personId: 'person-leader-candidate',
      memberships,
      newGroupId: 'group-new',
      migratePersonIds: [],
      approvedByPersonId: 'owner-serra',
      effectiveAt: '2026-09-03T18:00:00Z',
    });

    const activeForPerson = result.memberships.filter((item: { personId: string; endedAt: string | null }) => item.personId === 'person-leader-candidate' && item.endedAt === null);
    expect(activeForPerson).toHaveLength(1);
    expect(activeForPerson[0]).toMatchObject({
      personId: 'person-leader-candidate',
      role: 'LEADER',
      distributionId: 'es',
      districtId: 'serra',
      groupId: 'group-new',
    });

    const previous = result.memberships.find((item: { id: string }) => item.id === 'membership-leader-candidate');
    expect(previous.endedAt).toBe('2026-09-03T18:00:00Z');
    expect(result.transition).toMatchObject({
      personId: 'person-leader-candidate',
      fromRole: 'CONSULTANT',
      toRole: 'LEADER',
      fromGroupId: 'group-old',
      toGroupId: 'group-new',
      approvedByPersonId: 'owner-serra',
    });
  });

  it('moves only explicitly selected people with the promoted leader', async () => {
    const network = await loadNetwork();
    expect(network).not.toBeNull();
    if (!network) return;

    const result = network.promoteConsultantToLeader({
      personId: 'person-leader-candidate',
      memberships,
      newGroupId: 'group-new',
      migratePersonIds: ['person-moving-member'],
      approvedByPersonId: 'owner-serra',
      effectiveAt: '2026-09-03T18:00:00Z',
    });

    const moved = result.memberships.find((item: { personId: string; groupId?: string; endedAt: string | null }) => item.personId === 'person-moving-member' && item.groupId === 'group-new' && item.endedAt === null);
    const stayed = result.memberships.find((item: { id: string }) => item.id === 'membership-staying-member');

    expect(moved).toMatchObject({ personId: 'person-moving-member', role: 'CONSULTANT', groupId: 'group-new' });
    expect(stayed.endedAt).toBeNull();
    expect(result.transition.migratedPersonIds).toEqual(['person-moving-member']);
  });

  it('rejects cross-district migrations during a leader promotion', async () => {
    const network = await loadNetwork();
    expect(network).not.toBeNull();
    if (!network) return;

    const invalidMemberships = [
      ...memberships,
      {
        id: 'membership-other-district',
        personId: 'person-other-district',
        role: 'CONSULTANT',
        distributionId: 'es',
        districtId: 'vitoria',
        groupId: 'vitoria-a',
        startedAt: '2026-02-01T00:00:00Z',
        endedAt: null,
      },
    ];

    expect(() => network.promoteConsultantToLeader({
      personId: 'person-leader-candidate',
      memberships: invalidMemberships,
      newGroupId: 'group-new',
      migratePersonIds: ['person-other-district'],
      approvedByPersonId: 'owner-serra',
      effectiveAt: '2026-09-03T18:00:00Z',
    })).toThrow(/same district/i);
  });
});
