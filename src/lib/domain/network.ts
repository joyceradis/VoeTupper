export type NetworkRole='DISTRIBUTION'|'BUSINESS_OWNER'|'LEADER'|'CONSULTANT';

export type ViewerContext={
  personId:string;
  role:NetworkRole;
  distributionId:string;
  districtId?:string;
  groupId?:string;
};

export type ScopeRef={
  distributionId:string;
  districtId?:string;
  groupId?:string;
};

export type Membership={
  id:string;
  personId:string;
  role:NetworkRole;
  distributionId:string;
  districtId?:string;
  groupId?:string;
  parentPersonId?:string|null;
  validFrom:string;
  validTo:string|null;
  isCurrent:boolean;
};

export type PromotionInput={
  current:Membership;
  promotedAt:string;
  newGroupId:string;
  migratedPersonIds:string[];
  approvedByPersonId:string;
};

export type PromotionResult={
  closedMembership:Membership;
  newMembership:Membership;
  migratedPersonIds:string[];
  audit:{
    action:'CONSULTANT_PROMOTED_TO_LEADER';
    personId:string;
    approvedByPersonId:string;
    occurredAt:string;
    fromGroupId:string|null;
    toGroupId:string;
  };
};

export function promoteConsultantToLeader(input:PromotionInput):PromotionResult{
  if(input.current.role!=='CONSULTANT')throw new Error('Only a CONSULTANT can be promoted with this operation');
  if(!input.current.isCurrent)throw new Error('Current membership must be active');
  if(!Array.isArray(input.migratedPersonIds))throw new Error('migratedPersonIds must be explicitly provided');
  if(!input.newGroupId.trim())throw new Error('newGroupId is required');
  if(!input.approvedByPersonId.trim())throw new Error('approvedByPersonId is required');

  const closedMembership:Membership={
    ...input.current,
    validTo:input.promotedAt,
    isCurrent:false
  };

  const newMembership:Membership={
    id:`leader:${input.current.personId}:${input.promotedAt}`,
    personId:input.current.personId,
    role:'LEADER',
    distributionId:input.current.distributionId,
    districtId:input.current.districtId,
    groupId:input.newGroupId,
    parentPersonId:null,
    validFrom:input.promotedAt,
    validTo:null,
    isCurrent:true
  };

  return{
    closedMembership,
    newMembership,
    migratedPersonIds:[...input.migratedPersonIds],
    audit:{
      action:'CONSULTANT_PROMOTED_TO_LEADER',
      personId:input.current.personId,
      approvedByPersonId:input.approvedByPersonId,
      occurredAt:input.promotedAt,
      fromGroupId:input.current.groupId??null,
      toGroupId:input.newGroupId
    }
  };
}
