import { isTerminal, nextActionLabel } from '../domain/order';
import type { Goal, GoalType, NetworkEventKind, Person, PersonStatus, V2Order, V2State } from './model';
import { normalizeSearch } from './validation';

export type GoalProgress = Goal & { percent: number; remaining: number };
export type QueueOrder = V2Order & { personName: string; nextAction: string };
export type WallEntry = {
  id: string;
  kind: NetworkEventKind | 'ORDER_RECEIVED';
  occurredAt: string;
  title: string;
  detail: string;
  actorName: string;
};
export type RankingDimension = 'SALES' | 'RECRUITMENT' | 'ACTIVE';
export type RankingEntry = { position: number; person: Person; value: number; unit: 'BRL' | 'PEOPLE' };
export type DirectoryEntry = Pick<Person, 'id' | 'name' | 'role' | 'status' | 'businessCode' | 'groupId' | 'groupName' | 'leaderId'>;
export type NetworkTreeNode = {
  id: string;
  type: 'DISTRIBUTION' | 'DISTRICT' | 'LEADER' | 'GROUP' | 'PERSON' | 'REVIEW';
  label: string;
  meta?: string;
  count?: number;
  personId?: string;
  children: NetworkTreeNode[];
};

const activeStatuses = new Set<PersonStatus>(['ACTIVE', 'NEW']);

function goalProgress(goal: Goal, current: number): GoalProgress {
  const safeCurrent = Math.max(0, current);
  const percent = goal.target > 0 ? Math.min(100, Math.round((safeCurrent / goal.target) * 100)) : 0;
  return { ...goal, current: safeCurrent, percent, remaining: Math.max(0, goal.target - safeCurrent) };
}

export function selectToday(state: V2State) {
  const weekOrders = state.orders.filter(order => order.weekId === state.workspace.week.id);
  const activeOrders = weekOrders.filter(order => !isTerminal(order.stage));
  const completedPersonIds = new Set(
    weekOrders.filter(order => order.stage === 'COMPLETED').map(order => order.consultantId),
  );
  const peopleById = new Map(state.people.map(person => [person.id, person]));
  const revenue = weekOrders
    .filter(order => order.stage !== 'CANCELLED')
    .reduce((total, order) => total + (order.amount ?? 0), 0);

  return {
    pending: activeOrders.length,
    forPortal: activeOrders.filter(order => order.stage === 'ORGANIZED').length,
    forConfirmation: activeOrders.filter(order => order.stage === 'PORTAL_DONE').length,
    withoutCompletedOrder: state.people.filter(person =>
      person.role === 'CONSULTANT' && activeStatuses.has(person.status) && !completedPersonIds.has(person.id),
    ).length,
    revenue,
    goals: state.goals.map(goal => goalProgress(goal, goal.type === 'SALES' ? revenue : goal.current)),
    queue: activeOrders
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(order => ({
        ...order,
        personName: peopleById.get(order.consultantId)?.name ?? 'Consultora',
        nextAction: nextActionLabel(order.stage),
      })),
  };
}

export function selectWall(state: V2State): WallEntry[] {
  const peopleById = new Map(state.people.map(person => [person.id, person]));
  const recordedOrderIds = new Set(
    state.events.filter(event => event.kind === 'ORDER_RECEIVED').map(event => event.subjectId),
  );
  const orderEntries: WallEntry[] = state.orders
    .filter(order => order.stage !== 'CANCELLED' && !recordedOrderIds.has(order.id))
    .map(order => {
      const actorName = peopleById.get(order.consultantId)?.name ?? 'Consultora';
      return {
        id: `wall-${order.id}`,
        kind: 'ORDER_RECEIVED' as const,
        occurredAt: order.createdAt,
        title: 'Pedido recebido',
        detail: `${actorName}: ${order.summary}`,
        actorName,
      };
    });
  const eventEntries: WallEntry[] = state.events.map(event => ({
    id: event.id,
    kind: event.kind,
    occurredAt: event.occurredAt,
    title: event.title,
    detail: event.detail,
    actorName: peopleById.get(event.actorPersonId)?.name ?? 'Rede Serra',
  }));

  return [...eventEntries, ...orderEntries].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

function leaderMembers(state: V2State, leaderId: string) {
  return state.people.filter(person => person.role === 'CONSULTANT' && person.leaderId === leaderId);
}

function leaderValue(state: V2State, leader: Person, dimension: RankingDimension): number {
  const members = leaderMembers(state, leader.id);
  if (dimension === 'RECRUITMENT') return members.filter(person => person.status === 'NEW').length;
  if (dimension === 'ACTIVE') return members.filter(person => activeStatuses.has(person.status)).length;
  const memberIds = new Set(members.map(person => person.id));
  return state.orders
    .filter(order => memberIds.has(order.consultantId) && order.stage !== 'CANCELLED')
    .reduce((total, order) => total + (order.amount ?? 0), 0);
}

export function selectLeaderRanking(state: V2State, dimension: RankingDimension): RankingEntry[] {
  const leaders = state.people.filter(person =>
    person.role === 'LEADER' && person.districtId === state.workspace.districtId,
  );
  if (leaders.length < 2) return [];

  return leaders
    .map(person => ({
      person,
      value: leaderValue(state, person, dimension),
      unit: dimension === 'SALES' ? 'BRL' as const : 'PEOPLE' as const,
    }))
    .sort((a, b) => b.value - a.value || a.person.name.localeCompare(b.person.name, 'pt-BR'))
    .map((entry, index) => ({ ...entry, position: index + 1 }));
}

function personStatusLabel(status: PersonStatus) {
  return ({
    ACTIVE: 'Ativa',
    NEW: 'Nova',
    PAUSED: 'Pausada',
    INACTIVE: 'Inativa',
    REVIEW: 'Vínculo a conferir',
  } as const)[status];
}

export function selectNetworkTree(state: V2State): NetworkTreeNode {
  const leaders = state.people.filter(person => person.role === 'LEADER' && person.districtId === state.workspace.districtId);
  const groupedLeaderNodes = leaders.map<NetworkTreeNode>(leader => {
    const members = leaderMembers(state, leader.id);
    return {
      id: `tree-${leader.id}`,
      type: 'LEADER',
      label: leader.name,
      meta: 'Líder',
      count: members.length,
      personId: leader.id,
      children: [{
        id: `tree-${leader.groupId ?? leader.id}-group`,
        type: 'GROUP',
        label: leader.groupName ?? 'Grupo sem nome confirmado',
        count: members.length,
        children: members.map(person => ({
          id: `tree-${person.id}`,
          type: 'PERSON',
          label: person.name,
          meta: personStatusLabel(person.status),
          personId: person.id,
          children: [],
        })),
      }],
    };
  });
  const unassigned = state.people.filter(person =>
    person.role === 'CONSULTANT' && person.districtId === state.workspace.districtId && !person.leaderId,
  );
  if (unassigned.length) {
    groupedLeaderNodes.push({
      id: 'tree-review',
      type: 'REVIEW',
      label: 'Vínculos a conferir',
      count: unassigned.length,
      children: unassigned.map(person => ({
        id: `tree-${person.id}`,
        type: 'PERSON',
        label: person.name,
        meta: personStatusLabel(person.status),
        personId: person.id,
        children: [],
      })),
    });
  }

  return {
    id: 'tree-distribution-es',
    type: 'DISTRIBUTION',
    label: state.workspace.distributionName,
    meta: `${state.workspace.distributionManagerName}, Distribuição`,
    children: [{
      id: 'tree-district-serra',
      type: 'DISTRICT',
      label: `Distrito ${state.workspace.districtName}`,
      meta: `${state.people.find(person => person.id === state.workspace.ownerPersonId)?.name ?? 'Empresária'}, Empresária`,
      count: state.people.filter(person => person.districtId === state.workspace.districtId).length,
      children: groupedLeaderNodes,
    }],
  };
}

export function selectDirectory(state: V2State, query: string): DirectoryEntry[] {
  const needle = normalizeSearch(query);
  return state.people
    .filter(person => person.districtId === state.workspace.districtId && person.role !== 'BUSINESS_OWNER')
    .filter(person => !needle || normalizeSearch([person.name, person.businessCode, person.groupName].filter(Boolean).join(' ')).includes(needle))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map(person => ({
      id: person.id,
      name: person.name,
      role: person.role,
      status: person.status,
      businessCode: person.businessCode,
      groupId: person.groupId,
      groupName: person.groupName,
      leaderId: person.leaderId,
    }));
}

export function selectGoalsByType(state: V2State, type: GoalType) {
  return selectToday(state).goals.filter(goal => goal.type === type);
}
