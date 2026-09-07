import type { V3Snapshot } from '../domain/model';
import type { V3Repository } from './repository';

export function createDemoSnapshot(): V3Snapshot {
  return {
    mode: 'DEMO',
    viewer: {
      personId: 'demo-owner',
      displayName: 'Ritheli exemplo',
      role: 'BUSINESS_OWNER',
      status: 'ACTIVE',
      businessCode: null,
      phone: null,
      distributionId: 'demo-distribution',
      districtId: 'demo-serra',
    },
    membership: {
      id: 'demo-owner-membership',
      personId: 'demo-owner',
      role: 'BUSINESS_OWNER',
      distributionId: 'demo-distribution',
      districtId: 'demo-serra',
      startedAt: '2026-01-01T00:00:00.000Z',
      endedAt: null,
    },
    vitrine: {
      id: 'demo-vitrine',
      label: 'Vitrine 09/2026 · exemplo',
      opensAt: '2026-08-25T12:00:00-03:00',
      closesAt: '2026-09-07T12:50:00-03:00',
      timezone: 'America/Sao_Paulo',
    },
    people: [
      {
        personId: 'demo-distribution-owner',
        displayName: 'Gerusa exemplo',
        role: 'DISTRIBUTION',
        status: 'ACTIVE',
        businessCode: null,
        phone: null,
        distributionId: 'demo-distribution',
      },
      {
        personId: 'demo-owner',
        displayName: 'Ritheli exemplo',
        role: 'BUSINESS_OWNER',
        status: 'ACTIVE',
        businessCode: null,
        phone: null,
        distributionId: 'demo-distribution',
        districtId: 'demo-serra',
      },
      {
        personId: 'demo-leader-one',
        displayName: 'Marina exemplo',
        role: 'LEADER',
        status: 'ACTIVE',
        businessCode: '2001',
        phone: null,
        distributionId: 'demo-distribution',
        districtId: 'demo-serra',
        groupId: 'demo-group-one',
      },
      {
        personId: 'demo-leader-two',
        displayName: 'Paula exemplo',
        role: 'LEADER',
        status: 'ACTIVE',
        businessCode: '2002',
        phone: null,
        distributionId: 'demo-distribution',
        districtId: 'demo-serra',
        groupId: 'demo-group-two',
      },
      {
        personId: 'demo-consultant',
        displayName: 'Lúcia exemplo',
        role: 'CONSULTANT',
        status: 'ACTIVE',
        businessCode: '1003',
        phone: null,
        distributionId: 'demo-distribution',
        districtId: 'demo-serra',
        groupId: 'demo-group-one',
      },
    ],
    groups: [
      { id: 'demo-group-one', name: 'Grupo Aurora', distributionId: 'demo-distribution', districtId: 'demo-serra' },
      { id: 'demo-group-two', name: 'Grupo Essência', distributionId: 'demo-distribution', districtId: 'demo-serra' },
    ],
    districts: [
      { id: 'demo-serra', name: 'Serra', distributionId: 'demo-distribution', ownerPersonId: 'demo-owner' },
    ],
    goals: [
      { id: 'demo-owner-sales', vitrineId: 'demo-vitrine', personId: 'demo-owner', type: 'SALES', target: 5000, current: 2920 },
      { id: 'demo-owner-recruitment', vitrineId: 'demo-vitrine', personId: 'demo-owner', type: 'RECRUITMENT', target: 8, current: 5 },
      { id: 'demo-leader-one-sales', vitrineId: 'demo-vitrine', personId: 'demo-leader-one', type: 'SALES', target: 1500, current: 1320 },
      { id: 'demo-leader-two-sales', vitrineId: 'demo-vitrine', personId: 'demo-leader-two', type: 'SALES', target: 1200, current: 610 },
    ],
  };
}

export function createDemoRepository(): V3Repository {
  return { async loadSnapshot() { return { kind: 'ready', snapshot: createDemoSnapshot() }; } };
}
