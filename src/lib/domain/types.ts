import type { OrderStage } from './order';

export type ConsultantStatus = 'ACTIVE'|'NEW'|'PAUSED'|'INACTIVE';
export type SourceChannel = 'AUDIO'|'PHOTO'|'TEXT'|'OTHER';
export type Consultant = { id:string; name:string; businessCode?:string; phone?:string; status:ConsultantStatus; note?:string };
export type Campaign = { id:string; label:string };
export type Week = { id:string; label:string; campaignId:string; closesAt:string; teamGoal:number; status:'PLANNED'|'ACTIVE'|'CLOSED' };
export type Order = { id:string; consultantId:string; weekId:string; source:SourceChannel; summary:string; amount?:number; stage:OrderStage; createdAt:string };
export type Offer = { id:string; title:string; weekId?:string; campaignId?:string; active:boolean };

export type NetworkRole = 'DISTRIBUTION'|'BUSINESS_OWNER'|'LEADER'|'CONSULTANT';

export type ScopeRef = {
  distributionId:string;
  districtId?:string;
  groupId?:string;
};

export type ViewerContext = ScopeRef & {
  personId:string;
  role:NetworkRole;
};

export type Membership = ScopeRef & {
  id:string;
  personId:string;
  role:NetworkRole;
  startedAt:string;
  endedAt:string|null;
};

export type NetworkTransition = {
  personId:string;
  fromRole:NetworkRole;
  toRole:NetworkRole;
  fromGroupId?:string;
  toGroupId?:string;
  migratedPersonIds:string[];
  approvedByPersonId:string;
  effectiveAt:string;
};
