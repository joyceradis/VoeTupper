import type { Goal, Membership, NetworkRole, Person, PersonStatus, V3Snapshot, Vitrine } from '../domain/model';
import type { LoadSnapshotResult } from './repository';

type MembershipRow = {
  id: string;
  person_id: string;
  role: NetworkRole;
  distribution_id: string;
  district_id: string | null;
  group_id: string | null;
  started_at: string;
  ended_at: string | null;
};

type PersonRow = {
  id: string;
  display_name: string;
  status: string;
  source_member_id: string | null;
  phone: string | null;
};

type GroupRow = { id: string; name: string; distribution_id: string; district_id: string };
type DistrictRow = { id: string; name: string; distribution_id: string; owner_person_id?: string | null };
type VitrineRow = { id: string; label: string; opens_at: string; closes_at: string; timezone: string };
type GoalRow = { id: string; vitrine_id: string; person_id: string; goal_type: string; target_value: number | string; current_value: number | string };

export type SupabaseSnapshotRows = {
  personId: string;
  memberships: MembershipRow[];
  people: PersonRow[];
  groups: GroupRow[];
  districts: DistrictRow[];
  vitrine: VitrineRow | null;
  goals: GoalRow[];
};

function personStatus(status: string): PersonStatus {
  if (status === 'INACTIVE') return 'INACTIVE';
  if (status === 'PENDING') return 'PAUSED';
  return 'ACTIVE';
}

function goalType(type: string): Goal['type'] | null {
  if (type === 'sales') return 'SALES';
  if (type === 'recruitment') return 'RECRUITMENT';
  if (type === 'activity') return 'ACTIVITY';
  return null;
}

export function mapSupabaseSnapshot(rows: SupabaseSnapshotRows): LoadSnapshotResult {
  const current = rows.memberships.find(membership => membership.person_id === rows.personId && membership.ended_at === null);
  if (!current) return { kind: 'error', message: 'Sua conta ainda não está vinculada à rede.' };
  if (!rows.vitrine) return { kind: 'error', message: 'Nenhuma Vitrine está aberta para sua rede.' };

  const memberships = new Map(rows.memberships.filter(row => row.ended_at === null).map(row => [row.person_id, row]));
  const people = rows.people.flatMap<Person>(row => {
    const membership = memberships.get(row.id);
    if (!membership) return [];
    return [{
      personId: row.id,
      displayName: row.display_name,
      role: membership.role,
      status: personStatus(row.status),
      businessCode: null,
      phone: row.phone,
      distributionId: membership.distribution_id,
      ...(membership.district_id ? { districtId: membership.district_id } : {}),
      ...(membership.group_id ? { groupId: membership.group_id } : {}),
    }];
  });
  const viewer = people.find(person => person.personId === rows.personId);
  if (!viewer) return { kind: 'error', message: 'Seu perfil ainda não está disponível.' };

  const membership: Membership = {
    id: current.id,
    personId: current.person_id,
    role: current.role,
    distributionId: current.distribution_id,
    ...(current.district_id ? { districtId: current.district_id } : {}),
    ...(current.group_id ? { groupId: current.group_id } : {}),
    startedAt: current.started_at,
    endedAt: current.ended_at,
  };
  const vitrine: Vitrine = {
    id: rows.vitrine.id,
    label: rows.vitrine.label,
    opensAt: rows.vitrine.opens_at,
    closesAt: rows.vitrine.closes_at,
    timezone: 'America/Sao_Paulo',
  };
  const goals = rows.goals.flatMap<Goal>(row => {
    const type = goalType(row.goal_type);
    if (!type) return [];
    return [{ id: row.id, vitrineId: row.vitrine_id, personId: row.person_id, type, target: Number(row.target_value), current: Number(row.current_value) }];
  });

  const ownerByDistrict = new Map(rows.memberships
    .filter(row => row.role === 'BUSINESS_OWNER' && row.district_id && row.ended_at === null)
    .map(row => [row.district_id as string, row.person_id]));

  const snapshot: V3Snapshot = {
    mode: 'REAL',
    viewer,
    membership,
    vitrine,
    people,
    groups: rows.groups.map(row => ({ id: row.id, name: row.name, distributionId: row.distribution_id, districtId: row.district_id })),
    districts: rows.districts.map(row => ({ id: row.id, name: row.name, distributionId: row.distribution_id, ownerPersonId: row.owner_person_id ?? ownerByDistrict.get(row.id) ?? null })),
    goals,
  };
  return { kind: 'ready', snapshot };
}
