import type { SupabaseClient } from '@supabase/supabase-js';
import { mapSupabaseSnapshot } from './map-supabase';
import type { V3Repository } from './repository';

export function createSupabaseRepository(client: SupabaseClient): V3Repository {
  return {
    async loadSnapshot() {
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError) return { kind: 'error', message: 'Não foi possível confirmar seu acesso.' };
      if (!userData.user) return { kind: 'signed-out' };

      const { data: personId, error: identityError } = await client.rpc('current_person_id');
      if (identityError) return { kind: 'error', message: 'Não foi possível abrir sua rede.' };
      if (!personId) return { kind: 'error', message: 'Sua conta ainda não está vinculada à rede.' };

      const [memberships, people, groups, districts, vitrines, goals] = await Promise.all([
        client.from('memberships').select('id,person_id,role,distribution_id,district_id,group_id,started_at,ended_at'),
        client.from('people').select('id,display_name,status,source_member_id,phone'),
        client.from('groups').select('id,name,distribution_id,district_id'),
        client.from('districts').select('id,name,distribution_id'),
        client.from('vitrines').select('id,label,opens_at,closes_at,timezone').order('closes_at', { ascending: true }).limit(1).maybeSingle(),
        client.from('vitrine_goals').select('id,vitrine_id,person_id,goal_type,target_value,current_value'),
      ]);
      if (memberships.error || people.error || groups.error || districts.error || vitrines.error || goals.error) {
        return { kind: 'error', message: 'Não foi possível abrir sua rede.' };
      }
      return mapSupabaseSnapshot({
        personId: String(personId),
        memberships: memberships.data ?? [],
        people: people.data ?? [],
        groups: groups.data ?? [],
        districts: districts.data ?? [],
        vitrine: vitrines.data,
        goals: goals.data ?? [],
      });
    },
  };
}
