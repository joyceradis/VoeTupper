import type { Membership, NetworkRole, NetworkTransition } from './types';

type MembershipLike = {
  id:string;
  personId:string;
  role:string;
  distributionId:string;
  districtId?:string;
  groupId?:string;
  startedAt:string;
  endedAt:string|null;
};

type PromotionInput = {
  personId:string;
  memberships:MembershipLike[];
  newGroupId:string;
  migratePersonIds:string[];
  approvedByPersonId:string;
  effectiveAt:string;
};

function isNetworkRole(value:string):value is NetworkRole {
  return value === 'DISTRIBUTION' || value === 'BUSINESS_OWNER' || value === 'LEADER' || value === 'CONSULTANT';
}

function toMembership(value:MembershipLike):Membership {
  if (!isNetworkRole(value.role)) throw new Error(`Unsupported network role: ${value.role}`);
  return {...value,role:value.role};
}

function transitionMembershipId(personId:string,role:NetworkRole,effectiveAt:string){
  return `${personId}:${role.toLowerCase()}:${effectiveAt}`;
}

export function promoteConsultantToLeader(input:PromotionInput):{
  memberships:Membership[];
  transition:NetworkTransition;
} {
  const source = input.memberships.map(toMembership);
  const activeCandidate = source.find(item => item.personId === input.personId && item.endedAt === null);

  if (!activeCandidate) throw new Error('Active consultant membership not found');
  if (activeCandidate.role !== 'CONSULTANT') throw new Error('Only an active consultant can be promoted to leader');
  if (!activeCandidate.districtId) throw new Error('Leader promotion requires a district');
  if (!input.newGroupId.trim()) throw new Error('Leader promotion requires a new group');

  const migratedIds = [...new Set(input.migratePersonIds)].filter(personId => personId !== input.personId);
  const selected = migratedIds.map(personId => {
    const membership = source.find(item => item.personId === personId && item.endedAt === null);
    if (!membership) throw new Error(`Active membership not found for ${personId}`);
    if (membership.role !== 'CONSULTANT') throw new Error('Only consultants can migrate with a promoted leader');
    if (membership.distributionId !== activeCandidate.distributionId || membership.districtId !== activeCandidate.districtId) {
      throw new Error('Migrated people must belong to the same district as the promoted leader');
    }
    return membership;
  });

  const endingIds = new Set([activeCandidate.id,...selected.map(item => item.id)]);
  const updated = source.map(item => endingIds.has(item.id) ? {...item,endedAt:input.effectiveAt} : item);

  const leaderMembership:Membership = {
    id:transitionMembershipId(input.personId,'LEADER',input.effectiveAt),
    personId:input.personId,
    role:'LEADER',
    distributionId:activeCandidate.distributionId,
    districtId:activeCandidate.districtId,
    groupId:input.newGroupId,
    startedAt:input.effectiveAt,
    endedAt:null,
  };

  const migratedMemberships:Membership[] = selected.map(item => ({
    id:transitionMembershipId(item.personId,'CONSULTANT',input.effectiveAt),
    personId:item.personId,
    role:'CONSULTANT',
    distributionId:item.distributionId,
    districtId:item.districtId,
    groupId:input.newGroupId,
    startedAt:input.effectiveAt,
    endedAt:null,
  }));

  return {
    memberships:[...updated,leaderMembership,...migratedMemberships],
    transition:{
      personId:input.personId,
      fromRole:'CONSULTANT',
      toRole:'LEADER',
      fromGroupId:activeCandidate.groupId,
      toGroupId:input.newGroupId,
      migratedPersonIds:migratedIds,
      approvedByPersonId:input.approvedByPersonId,
      effectiveAt:input.effectiveAt,
    },
  };
}
