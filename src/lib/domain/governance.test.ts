import { describe, expect, it } from 'vitest';
import { canManageScope, canViewMetric, canViewPerson } from './governance';
import type { ViewerContext } from './network';

const businessSerra: ViewerContext = { personId:'p-serra', role:'BUSINESS_OWNER', distributionId:'dist-es', districtId:'d-serra' };
const businessVitoria: ViewerContext = { personId:'p-vix', role:'BUSINESS_OWNER', distributionId:'dist-es', districtId:'d-vix' };
const leaderSerraA: ViewerContext = { personId:'l-a', role:'LEADER', distributionId:'dist-es', districtId:'d-serra', groupId:'g-a' };
const leaderSerraB: ViewerContext = { personId:'l-b', role:'LEADER', distributionId:'dist-es', districtId:'d-serra', groupId:'g-b' };
const leaderVitoria: ViewerContext = { personId:'l-v', role:'LEADER', distributionId:'dist-es', districtId:'d-vix', groupId:'g-v' };
const consultantA: ViewerContext = { personId:'c-a', role:'CONSULTANT', distributionId:'dist-es', districtId:'d-serra', groupId:'g-a' };

describe('VoeTupper governance', () => {
  it('lets business owners compare only approved aggregate district metrics', () => {
    expect(canViewMetric(businessSerra,businessVitoria,'district_goal_percent')).toBe(true);
    expect(canViewMetric(businessSerra,businessVitoria,'district_recruitment_count')).toBe(true);
    expect(canViewMetric(businessSerra,businessVitoria,'district_revenue_detail')).toBe(false);
    expect(canViewPerson(businessSerra,{...leaderVitoria,personId:'l-v'})).toBe(false);
  });

  it('lets leaders compare only with leaders in their own district', () => {
    expect(canViewMetric(leaderSerraA,leaderSerraB,'leader_goal_percent')).toBe(true);
    expect(canViewMetric(leaderSerraA,leaderVitoria,'leader_goal_percent')).toBe(false);
    expect(canViewPerson(leaderSerraA,leaderSerraB)).toBe(false);
  });

  it('keeps consultants away from management intelligence', () => {
    expect(canViewMetric(consultantA,businessSerra,'district_goal_percent')).toBe(false);
    expect(canViewMetric(consultantA,leaderSerraA,'leader_goal_percent')).toBe(false);
    expect(canManageScope(consultantA,{distributionId:'dist-es',districtId:'d-serra',groupId:'g-a'})).toBe(false);
  });

  it('lets a business owner manage her district but not another district', () => {
    expect(canManageScope(businessSerra,{distributionId:'dist-es',districtId:'d-serra'})).toBe(true);
    expect(canManageScope(businessSerra,{distributionId:'dist-es',districtId:'d-vix'})).toBe(false);
  });
});
