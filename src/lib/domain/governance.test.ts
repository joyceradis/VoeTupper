import { describe, expect, it } from 'vitest';

async function loadGovernance() {
  const modulePath = './governance';
  return import(modulePath).catch(() => null);
}

const empresariaSerra = {
  personId: 'owner-serra',
  role: 'BUSINESS_OWNER',
  distributionId: 'es',
  districtId: 'serra',
};

const empresariaVitoria = {
  personId: 'owner-vitoria',
  role: 'BUSINESS_OWNER',
  distributionId: 'es',
  districtId: 'vitoria',
};

const leaderSerraA = {
  personId: 'leader-a',
  role: 'LEADER',
  distributionId: 'es',
  districtId: 'serra',
  groupId: 'serra-a',
};

const leaderSerraB = {
  personId: 'leader-b',
  role: 'LEADER',
  distributionId: 'es',
  districtId: 'serra',
  groupId: 'serra-b',
};

const leaderVitoria = {
  personId: 'leader-vix',
  role: 'LEADER',
  distributionId: 'es',
  districtId: 'vitoria',
  groupId: 'vix-a',
};

const consultantA = {
  personId: 'consultant-a',
  role: 'CONSULTANT',
  distributionId: 'es',
  districtId: 'serra',
  groupId: 'serra-a',
};

const consultantB = {
  personId: 'consultant-b',
  role: 'CONSULTANT',
  distributionId: 'es',
  districtId: 'serra',
  groupId: 'serra-b',
};

describe('multiuser governance', () => {
  it('keeps district detail private while allowing approved peer aggregates', async () => {
    const governance = await loadGovernance();
    expect(governance).not.toBeNull();
    if (!governance) return;

    expect(governance.canViewMetric(empresariaSerra, empresariaVitoria, 'district_revenue_detail')).toBe(false);
    expect(governance.canViewMetric(empresariaSerra, empresariaVitoria, 'district_goal_percent')).toBe(true);
    expect(governance.canViewMetric(empresariaSerra, empresariaSerra, 'district_revenue_detail')).toBe(true);

    expect(governance.canViewMetric(leaderSerraA, leaderSerraB, 'leader_goal_percent')).toBe(true);
    expect(governance.canViewMetric(leaderSerraA, leaderVitoria, 'leader_goal_percent')).toBe(false);
    expect(governance.canViewMetric(consultantA, empresariaSerra, 'district_revenue_detail')).toBe(false);
  });

  it('limits person detail to the viewer operational scope', async () => {
    const governance = await loadGovernance();
    expect(governance).not.toBeNull();
    if (!governance) return;

    expect(governance.canViewPerson(empresariaSerra, consultantA)).toBe(true);
    expect(governance.canViewPerson(empresariaSerra, leaderVitoria)).toBe(false);
    expect(governance.canViewPerson(leaderSerraA, consultantA)).toBe(true);
    expect(governance.canViewPerson(leaderSerraA, consultantB)).toBe(false);
    expect(governance.canViewPerson(consultantA, consultantA)).toBe(true);
    expect(governance.canViewPerson(consultantA, leaderSerraA)).toBe(false);
  });

  it('allows administration only inside the viewers own scope', async () => {
    const governance = await loadGovernance();
    expect(governance).not.toBeNull();
    if (!governance) return;

    expect(governance.canManageScope(empresariaSerra, { distributionId: 'es', districtId: 'serra' })).toBe(true);
    expect(governance.canManageScope(empresariaSerra, { distributionId: 'es', districtId: 'vitoria' })).toBe(false);
    expect(governance.canManageScope(leaderSerraA, { distributionId: 'es', districtId: 'serra', groupId: 'serra-a' })).toBe(true);
    expect(governance.canManageScope(leaderSerraA, { distributionId: 'es', districtId: 'serra', groupId: 'serra-b' })).toBe(false);
    expect(governance.canManageScope(consultantA, { distributionId: 'es', districtId: 'serra', groupId: 'serra-a' })).toBe(false);
  });
});
