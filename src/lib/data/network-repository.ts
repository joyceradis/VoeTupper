import type { SupabaseClient } from '@supabase/supabase-js';
import type { ViewerContext } from '@/lib/domain/network';

export type PeerScoreboardPlan=
  |{source:'business_owner_scoreboard';periodKey:string;filters:{distribution_id:string}}
  |{source:'leader_scoreboard';periodKey:string;filters:{district_id:string}};

export type OwnNetworkPlan=
  |{scope:'distribution';distributionId:string}
  |{scope:'district';distributionId:string;districtId:string}
  |{scope:'group';distributionId:string;districtId:string;groupId:string}
  |{scope:'self';personId:string};

export function peerScoreboardPlan(viewer:ViewerContext,periodKey:string):PeerScoreboardPlan|null{
  if(viewer.role==='DISTRIBUTION'||viewer.role==='BUSINESS_OWNER'){
    return {source:'business_owner_scoreboard',periodKey,filters:{distribution_id:viewer.distributionId}};
  }
  if(viewer.role==='LEADER'&&viewer.districtId){
    return {source:'leader_scoreboard',periodKey,filters:{district_id:viewer.districtId}};
  }
  return null;
}

export function ownNetworkPlan(viewer:ViewerContext):OwnNetworkPlan{
  if(viewer.role==='DISTRIBUTION')return {scope:'distribution',distributionId:viewer.distributionId};
  if(viewer.role==='BUSINESS_OWNER'&&viewer.districtId)return {scope:'district',distributionId:viewer.distributionId,districtId:viewer.districtId};
  if(viewer.role==='LEADER'&&viewer.districtId&&viewer.groupId)return {scope:'group',distributionId:viewer.distributionId,districtId:viewer.districtId,groupId:viewer.groupId};
  return {scope:'self',personId:viewer.personId};
}

export async function loadPeerScoreboard(client:SupabaseClient,viewer:ViewerContext,periodKey:string){
  const plan=peerScoreboardPlan(viewer,periodKey);
  if(!plan)return {data:[],error:null as Error|null};
  let query=client.from(plan.source).select('*').eq('period_key',plan.periodKey);
  for(const [column,value] of Object.entries(plan.filters))query=query.eq(column,value);
  const result=await query;
  return {data:result.data??[],error:result.error};
}

export async function loadMyNetwork(client:SupabaseClient,viewer:ViewerContext){
  const plan=ownNetworkPlan(viewer);
  if(plan.scope==='distribution'){
    return client.from('districts').select('id,name,region_label,business_owner_person_id').eq('distribution_id',plan.distributionId).eq('status','ACTIVE').order('name');
  }
  if(plan.scope==='district'){
    return client.from('memberships').select('id,person_id,role,district_id,group_id,parent_person_id,valid_from,people(full_name),groups(name)').eq('district_id',plan.districtId).eq('is_current',true).order('role');
  }
  if(plan.scope==='group'){
    return client.from('memberships').select('id,person_id,role,district_id,group_id,parent_person_id,valid_from,people(full_name)').eq('group_id',plan.groupId).eq('is_current',true).order('role');
  }
  return client.from('memberships').select('id,person_id,role,district_id,group_id,parent_person_id,valid_from').eq('person_id',plan.personId).eq('is_current',true).maybeSingle();
}
