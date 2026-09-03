import type { ScopeRef, ViewerContext } from './network';

export type GovernanceMetric=
  |'district_goal_percent'
  |'district_recruitment_count'
  |'district_growth_percent'
  |'district_active_count'
  |'district_badges'
  |'district_revenue_detail'
  |'leader_goal_percent'
  |'leader_recruitment_count'
  |'leader_growth_percent'
  |'leader_active_count'
  |'leader_revenue_detail'
  |'consultant_own_orders'
  |'consultant_own_goal_percent';

const BUSINESS_PEER_METRICS=new Set<GovernanceMetric>([
  'district_goal_percent','district_recruitment_count','district_growth_percent','district_active_count','district_badges'
]);
const LEADER_PEER_METRICS=new Set<GovernanceMetric>([
  'leader_goal_percent','leader_recruitment_count','leader_growth_percent','leader_active_count'
]);

function sameDistribution(a:ViewerContext,b:ViewerContext){return a.distributionId===b.distributionId}
function sameDistrict(a:ViewerContext,b:ViewerContext){return sameDistribution(a,b)&&!!a.districtId&&a.districtId===b.districtId}
function sameGroup(a:ViewerContext,b:ViewerContext){return sameDistrict(a,b)&&!!a.groupId&&a.groupId===b.groupId}

export function canViewMetric(viewer:ViewerContext,target:ViewerContext,metric:GovernanceMetric):boolean{
  if(viewer.personId===target.personId)return true;
  if(viewer.role==='DISTRIBUTION'&&sameDistribution(viewer,target))return metric!=='consultant_own_orders';
  if(viewer.role==='BUSINESS_OWNER'&&target.role==='BUSINESS_OWNER'&&sameDistribution(viewer,target))return BUSINESS_PEER_METRICS.has(metric);
  if(viewer.role==='BUSINESS_OWNER'&&sameDistrict(viewer,target))return true;
  if(viewer.role==='LEADER'&&target.role==='LEADER'&&sameDistrict(viewer,target))return LEADER_PEER_METRICS.has(metric);
  if(viewer.role==='LEADER'&&sameGroup(viewer,target)&&target.role==='CONSULTANT')return metric.startsWith('consultant_');
  return false;
}

export function canViewPerson(viewer:ViewerContext,target:ViewerContext):boolean{
  if(viewer.personId===target.personId)return true;
  if(viewer.role==='DISTRIBUTION')return sameDistribution(viewer,target)&&target.role==='BUSINESS_OWNER';
  if(viewer.role==='BUSINESS_OWNER')return sameDistrict(viewer,target);
  if(viewer.role==='LEADER')return sameGroup(viewer,target)&&target.role==='CONSULTANT';
  if(viewer.role==='CONSULTANT')return sameGroup(viewer,target)&&target.role==='LEADER';
  return false;
}

export function canManageScope(viewer:ViewerContext,scope:ScopeRef):boolean{
  if(viewer.role==='DISTRIBUTION')return viewer.distributionId===scope.distributionId;
  if(viewer.role==='BUSINESS_OWNER')return viewer.distributionId===scope.distributionId&&!!viewer.districtId&&viewer.districtId===scope.districtId;
  if(viewer.role==='LEADER')return viewer.distributionId===scope.distributionId&&!!viewer.districtId&&viewer.districtId===scope.districtId&&!!viewer.groupId&&viewer.groupId===scope.groupId;
  return false;
}
