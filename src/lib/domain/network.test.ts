import { describe, expect, it } from 'vitest';
import { promoteConsultantToLeader } from './network';
import type { Membership } from './network';

describe('network promotions', () => {
  it('promotes without duplicating the person identity', () => {
    const membership: Membership = {
      id:'m1',personId:'p1',role:'CONSULTANT',distributionId:'dist-es',districtId:'d-serra',groupId:'g-old',parentPersonId:'leader-old',validFrom:'2026-01-01',validTo:null,isCurrent:true
    };
    const result=promoteConsultantToLeader({
      current:membership,
      promotedAt:'2026-09-03T18:00:00-03:00',
      newGroupId:'g-new',
      migratedPersonIds:['p2','p3'],
      approvedByPersonId:'p-ritheli'
    });
    expect(result.closedMembership.personId).toBe('p1');
    expect(result.closedMembership.isCurrent).toBe(false);
    expect(result.newMembership.personId).toBe('p1');
    expect(result.newMembership.role).toBe('LEADER');
    expect(result.newMembership.groupId).toBe('g-new');
    expect(result.migratedPersonIds).toEqual(['p2','p3']);
    expect(result.audit.approvedByPersonId).toBe('p-ritheli');
  });

  it('requires explicit migrated people instead of inferring a group by name', () => {
    const membership: Membership = {
      id:'m1',personId:'p1',role:'CONSULTANT',distributionId:'dist-es',districtId:'d-serra',groupId:'g-old',parentPersonId:'leader-old',validFrom:'2026-01-01',validTo:null,isCurrent:true
    };
    expect(()=>promoteConsultantToLeader({current:membership,promotedAt:'2026-09-03',newGroupId:'g-new',migratedPersonIds:null as unknown as string[],approvedByPersonId:'p-ritheli'})).toThrow(/migratedPersonIds/);
  });
});
