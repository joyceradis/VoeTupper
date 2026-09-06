import { describe, expect, it } from 'vitest';
import { canViewPerson, filterPeopleForViewer } from './scope';
import type { Person, Viewer } from './model';

const consultant: Viewer = {
  personId: 'consultant-one',
  role: 'CONSULTANT',
  distributionId: 'distribution-es',
  districtId: 'district-serra',
  groupId: 'group-one',
};

const leader: Viewer = {
  personId: 'leader-one',
  role: 'LEADER',
  distributionId: 'distribution-es',
  districtId: 'district-serra',
  groupId: 'group-one',
};

const owner: Viewer = {
  personId: 'owner-serra',
  role: 'BUSINESS_OWNER',
  distributionId: 'distribution-es',
  districtId: 'district-serra',
};

const distribution: Viewer = {
  personId: 'distribution-owner',
  role: 'DISTRIBUTION',
  distributionId: 'distribution-es',
};

function person(viewer: Viewer, displayName: string): Person {
  return {
    ...viewer,
    displayName,
    status: 'ACTIVE',
    businessCode: null,
    phone: null,
  };
}

describe('V3 hierarchy scope', () => {
  it('keeps a consultant inside her own operational identity', () => {
    expect(canViewPerson(consultant, consultant)).toBe(true);
    expect(canViewPerson(consultant, leader)).toBe(false);
  });

  it('lets a leader see consultants only in her own group', () => {
    expect(canViewPerson(leader, consultant)).toBe(true);
    expect(canViewPerson(leader, { ...consultant, personId: 'consultant-two', groupId: 'group-two' })).toBe(false);
  });

  it('lets an owner see her district without opening another district', () => {
    expect(canViewPerson(owner, leader)).toBe(true);
    expect(canViewPerson(owner, { ...leader, personId: 'leader-north', districtId: 'district-north' })).toBe(false);
  });

  it('lets distribution see the state but not another distribution', () => {
    expect(canViewPerson(distribution, owner)).toBe(true);
    expect(canViewPerson(distribution, { ...owner, personId: 'owner-rio', distributionId: 'distribution-rj' })).toBe(false);
  });

  it('filters people without leaking out-of-scope records', () => {
    const visible = filterPeopleForViewer(leader, [
      person(leader, 'Líder'),
      person(consultant, 'Consultora do grupo'),
      person({ ...consultant, personId: 'consultant-two', groupId: 'group-two' }, 'Consultora de outro grupo'),
    ]);

    expect(visible.map(item => item.displayName)).toEqual(['Líder', 'Consultora do grupo']);
  });
});
