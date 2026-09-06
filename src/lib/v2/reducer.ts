import { nextOrderStage } from '../domain/order';
import type { NetworkRole } from '../domain/types';
import type { NetworkEvent, Person, V2Order, V2State } from './model';
import { validateHttpsUrl } from './validation';

export type V2Action =
  | { type: 'orderCreated'; order: V2Order }
  | { type: 'orderAdvanced'; orderId: string; at: string }
  | { type: 'orderCancelled'; orderId: string; at: string }
  | { type: 'personAdded'; person: Person; at: string }
  | {
      type: 'personRoleUpdated';
      personId: string;
      role: NetworkRole;
      groupId?: string;
      groupName?: string;
      at: string;
    }
  | { type: 'goalUpdated'; goalId: string; target: number; current: number; at: string }
  | { type: 'externalUrlUpdated'; url: string; at: string };

function prependEvent(state: V2State, event: NetworkEvent): NetworkEvent[] {
  return [event, ...state.events.filter(existing => existing.id !== event.id)];
}

export function v2Reducer(state: V2State, action: V2Action): V2State {
  if (action.type === 'orderCreated') {
    if (state.orders.some(order => order.id === action.order.id)) return state;
    const actor = state.people.find(person => person.id === action.order.consultantId);
    return {
      ...state,
      orders: [action.order, ...state.orders],
      events: prependEvent(state, {
        id: `event-order-${action.order.id}`,
        kind: 'ORDER_RECEIVED',
        actorPersonId: action.order.consultantId,
        occurredAt: action.order.createdAt,
        title: 'Pedido recebido',
        detail: `${actor?.name ?? 'Consultora'}: ${action.order.summary}`,
        subjectId: action.order.id,
      }),
      updatedAt: action.order.createdAt,
    };
  }

  if (action.type === 'orderAdvanced') {
    const current = state.orders.find(order => order.id === action.orderId);
    if (!current) return state;
    const nextStage = nextOrderStage(current.stage);
    if (!nextStage) return state;
    return {
      ...state,
      orders: state.orders.map(order => order.id === action.orderId ? { ...order, stage: nextStage } : order),
      updatedAt: action.at,
    };
  }

  if (action.type === 'orderCancelled') {
    const current = state.orders.find(order => order.id === action.orderId);
    if (!current || current.stage === 'CANCELLED' || current.stage === 'COMPLETED') return state;
    return {
      ...state,
      orders: state.orders.map(order => order.id === action.orderId ? { ...order, stage: 'CANCELLED' } : order),
      updatedAt: action.at,
    };
  }

  if (action.type === 'personAdded') {
    if (state.people.some(person => person.id === action.person.id)) return state;
    return {
      ...state,
      people: [...state.people, action.person],
      events: prependEvent(state, {
        id: `event-person-${action.person.id}`,
        kind: 'PERSON_JOINED',
        actorPersonId: action.person.id,
        occurredAt: action.at,
        title: 'Nova pessoa na rede',
        detail: `${action.person.name} foi adicionada ao Distrito Serra.`,
        subjectId: action.person.id,
      }),
      updatedAt: action.at,
    };
  }

  if (action.type === 'personRoleUpdated') {
    const current = state.people.find(person => person.id === action.personId);
    if (!current || current.role === action.role) return state;
    const people = state.people.map(person => person.id === action.personId ? {
      ...person,
      role: action.role,
      ...(action.role === 'LEADER'
        ? { leaderId: undefined, groupId: action.groupId, groupName: action.groupName }
        : {}),
    } : person);
    return {
      ...state,
      people,
      events: prependEvent(state, {
        id: `event-role-${action.personId}-${action.at}`,
        kind: 'ROLE_CHANGED',
        actorPersonId: action.personId,
        occurredAt: action.at,
        title: 'Novo papel na rede',
        detail: `${current.name} agora atua como ${action.role === 'LEADER' ? 'Líder' : 'Consultora'}.`,
        subjectId: action.personId,
      }),
      updatedAt: action.at,
    };
  }

  if (action.type === 'goalUpdated') {
    if (!Number.isFinite(action.target) || !Number.isFinite(action.current) || action.target < 0 || action.current < 0) return state;
    const current = state.goals.find(goal => goal.id === action.goalId);
    if (!current) return state;
    const reached = action.target > 0 && action.current >= action.target && current.current < current.target;
    return {
      ...state,
      goals: state.goals.map(goal => goal.id === action.goalId
        ? { ...goal, target: action.target, current: action.current }
        : goal),
      events: prependEvent(state, {
        id: `event-goal-${action.goalId}-${action.at}`,
        kind: reached ? 'GOAL_REACHED' : 'GOAL_PROGRESS',
        actorPersonId: state.workspace.ownerPersonId,
        occurredAt: action.at,
        title: reached ? 'Meta atingida' : 'Meta atualizada',
        detail: `${current.label}: ${action.current} de ${action.target}.`,
        subjectId: action.goalId,
      }),
      updatedAt: action.at,
    };
  }

  if (!validateHttpsUrl(action.url)) return state;
  return {
    ...state,
    workspace: { ...state.workspace, externalUrl: action.url.trim() },
    updatedAt: action.at,
  };
}
