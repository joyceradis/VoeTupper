import type { NetworkRole, ScopeRef, ViewerContext } from './types';

export type MetricKey =
  | 'district_revenue_detail'
  | 'district_goal_percent'
  | 'district_growth_percent'
  | 'district_recruitment'
  | 'district_activation'
  | 'leader_goal_percent'
  | 'leader_growth_percent'
  | 'leader_recruitment'
  | 'leader_activation'
  | 'own_order_detail'
  | 'own_goal_detail';

type ContextLike = {
  personId:string;
  role:string;
  distributionId:string;
  districtId?:string;
  groupId?:string;
};

const businessOwnerPeerMetrics = new Set<MetricKey>([
  'district_goal_percent',
  'district_growth_percent',
  'district_recruitment',
  'district_activation',
]);

const leaderPeerMetrics = new Set<MetricKey>([
  'leader_goal_percent',
  'leader_growth_percent',
  'leader_recruitment',
  'leader_activation',
]);

function isRole(value:string): value is NetworkRole {
  return value === 'DISTRIBUTION' || value === 'BUSINESS_OWNER' || value === 'LEADER' || value === 'CONSULTANT';
}

function sameDistribution(a:ContextLike,b:ContextLike){
  return a.distributionId === b.distributionId;
}

function sameDistrict(a:ContextLike,b:ContextLike){
  return sameDistribution(a,b) && !!a.districtId && a.districtId === b.districtId;
}

function sameGroup(a:ContextLike,b:ContextLike){
  return sameDistrict(a,b) && !!a.groupId && a.groupId === b.groupId;
}

export function canViewMetric(viewer:ContextLike,target:ContextLike,metric:MetricKey){
  if (!isRole(viewer.role) || !isRole(target.role) || !sameDistribution(viewer,target)) return false;
  if (viewer.personId === target.personId) return true;

  if (viewer.role === 'DISTRIBUTION') return true;

  if (viewer.role === 'BUSINESS_OWNER') {
    if (sameDistrict(viewer,target)) return true;
    return target.role === 'BUSINESS_OWNER' && businessOwnerPeerMetrics.has(metric);
  }

  if (viewer.role === 'LEADER') {
    if (sameGroup(viewer,target)) return true;
    return target.role === 'LEADER' && sameDistrict(viewer,target) && leaderPeerMetrics.has(metric);
  }

  return false;
}

export function canViewPerson(viewer:ContextLike,target:ContextLike){
  if (!isRole(viewer.role) || !isRole(target.role) || !sameDistribution(viewer,target)) return false;
  if (viewer.personId === target.personId) return true;

  if (viewer.role === 'DISTRIBUTION') return true;
  if (viewer.role === 'BUSINESS_OWNER') return sameDistrict(viewer,target);
  if (viewer.role === 'LEADER') return sameGroup(viewer,target) && target.role === 'CONSULTANT';
  return false;
}

export function canManageScope(viewer:ContextLike,scope:ScopeRef){
  if (!isRole(viewer.role) || viewer.distributionId !== scope.distributionId) return false;

  if (viewer.role === 'DISTRIBUTION') return true;
  if (viewer.role === 'BUSINESS_OWNER') return !!viewer.districtId && viewer.districtId === scope.districtId;
  if (viewer.role === 'LEADER') {
    return !!viewer.districtId && !!viewer.groupId && viewer.districtId === scope.districtId && viewer.groupId === scope.groupId;
  }
  return false;
}

export function asViewerContext(value:ContextLike):ViewerContext|null {
  if (!isRole(value.role)) return null;
  return {
    personId:value.personId,
    role:value.role,
    distributionId:value.distributionId,
    districtId:value.districtId,
    groupId:value.groupId,
  };
}
