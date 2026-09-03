import { describe,expect,it } from 'vitest';
import { ownNetworkPlan,peerScoreboardPlan } from './network-repository';
import type { ViewerContext } from '@/lib/domain/network';

const business:ViewerContext={personId:'p1',role:'BUSINESS_OWNER',distributionId:'dist-es',districtId:'d-serra'};
const leader:ViewerContext={personId:'p2',role:'LEADER',distributionId:'dist-es',districtId:'d-serra',groupId:'g1'};
const consultant:ViewerContext={personId:'p3',role:'CONSULTANT',distributionId:'dist-es',districtId:'d-serra',groupId:'g1'};
const distribution:ViewerContext={personId:'p4',role:'DISTRIBUTION',distributionId:'dist-es'};

describe('network repository plans',()=>{
  it('uses the aggregate business scoreboard for business-owner peer comparison',()=>{
    expect(peerScoreboardPlan(business,'2026-W36')).toEqual({source:'business_owner_scoreboard',periodKey:'2026-W36',filters:{distribution_id:'dist-es'}});
  });

  it('uses the aggregate leader scoreboard only within the leader district',()=>{
    expect(peerScoreboardPlan(leader,'2026-W36')).toEqual({source:'leader_scoreboard',periodKey:'2026-W36',filters:{district_id:'d-serra'}});
  });

  it('does not expose a management peer scoreboard to consultants',()=>{
    expect(peerScoreboardPlan(consultant,'2026-W36')).toBeNull();
  });

  it('keeps detail queries inside the viewer scope',()=>{
    expect(ownNetworkPlan(distribution)).toEqual({scope:'distribution',distributionId:'dist-es'});
    expect(ownNetworkPlan(business)).toEqual({scope:'district',distributionId:'dist-es',districtId:'d-serra'});
    expect(ownNetworkPlan(leader)).toEqual({scope:'group',distributionId:'dist-es',districtId:'d-serra',groupId:'g1'});
    expect(ownNetworkPlan(consultant)).toEqual({scope:'self',personId:'p3'});
  });
});
