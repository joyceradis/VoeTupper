import type { OrderStage } from '../domain/order';
import type { SourceChannel } from '../domain/types';
import { createEmptyState, type Person, type PersonStatus, type V2Order, type V2State } from './model';
import { normalizeSearch } from './validation';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function finiteNumber(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(String(value ?? '').replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function stablePart(value: string) {
  const normalized = normalizeSearch(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return normalized || 'sem-identificacao';
}

function legacyRole(value: unknown): Person['role'] {
  return normalizeSearch(text(value)) === 'leader' || normalizeSearch(text(value)) === 'lider'
    ? 'LEADER'
    : 'CONSULTANT';
}

function legacyStatus(value: unknown): PersonStatus {
  const status = normalizeSearch(text(value)).toUpperCase();
  if (status.includes('INATIV') || status.includes('RECADASTR') || status === 'H') return status.includes('INATIV') ? 'INACTIVE' : 'REVIEW';
  if (status.includes('NOV')) return 'NEW';
  if (status.includes('PAUS')) return 'PAUSED';
  if (status.includes('REVIS') || status.includes('CONFER')) return 'REVIEW';
  return 'ACTIVE';
}

function sourceChannel(value: unknown): SourceChannel {
  const source = normalizeSearch(text(value));
  if (source.includes('audio')) return 'AUDIO';
  if (source.includes('foto') || source.includes('photo')) return 'PHOTO';
  if (source.includes('texto') || source.includes('text') || source.includes('whatsapp')) return 'TEXT';
  return 'OTHER';
}

function legacyStage(order: UnknownRecord): OrderStage {
  if (order.cancelled === true) return 'CANCELLED';
  if (order.finalized === true) return 'COMPLETED';
  if (order.print === true) return 'CONFIRMATION_SENT';
  if (order.portal === true) return 'PORTAL_DONE';
  if (order.checked === true) return 'ORGANIZED';
  return 'RECEIVED';
}

function weekId(value: unknown, fallback: string) {
  const week = text(value);
  if (!week) return fallback;
  const match = week.match(/^(\d{1,2})\/(\d{4})$/);
  return match ? `week-${match[1].padStart(2, '0')}-${match[2]}` : `legacy-week-${stablePart(week)}`;
}

export function isV2State(value: unknown): value is V2State {
  if (!isRecord(value) || value.version !== 2 || !isRecord(value.workspace)) return false;
  return Array.isArray(value.people)
    && Array.isArray(value.orders)
    && Array.isArray(value.goals)
    && Array.isArray(value.events)
    && typeof value.updatedAt === 'string'
    && typeof value.workspace.districtId === 'string'
    && isRecord(value.workspace.week);
}

export function migrateLegacyState(raw: string, now: string): V2State {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Estado legado inválido');
  }
  if (!isRecord(parsed) || !isRecord(parsed.workspace) || !Array.isArray(parsed.consultants) || !Array.isArray(parsed.orders)) {
    throw new Error('Estado legado inválido');
  }

  const state = createEmptyState(now);
  const workspace = parsed.workspace;
  const ownerName = text(workspace.ownerName);
  if (ownerName) {
    state.people = state.people.map(person => person.id === state.workspace.ownerPersonId ? { ...person, name: ownerName } : person);
  }
  state.workspace.operationName = text(workspace.distribution) || state.workspace.operationName;
  const region = text(workspace.businessArea) || text(workspace.region);
  if (region && normalizeSearch(region).includes('serra')) state.workspace.districtName = 'Serra';

  const rawPeople = parsed.consultants.filter(isRecord);
  const provisional = rawPeople.map((entry, index) => {
    const name = text(entry.name) || `Pessoa a conferir ${index + 1}`;
    const id = text(entry.id) || `legacy-person-${stablePart(`${name}-${text(entry.code) || index + 1}`)}`;
    const role = legacyRole(entry.role);
    const groupName = text(entry.group);
    const leaderName = text(entry.leader);
    const groupId = groupName ? `legacy-group-${stablePart(groupName)}` : undefined;
    let status = legacyStatus(entry.status ?? entry.registrationStatus);
    if (role === 'LEADER' && !groupId) status = 'REVIEW';
    if (role === 'CONSULTANT' && (!groupId || !leaderName)) status = 'REVIEW';
    return {
      person: {
        id,
        name,
        role,
        status,
        businessCode: text(entry.code) || undefined,
        phone: text(entry.phone) || undefined,
        distributionId: state.workspace.distributionId,
        districtId: state.workspace.districtId,
        groupId,
        groupName: groupName || undefined,
      } satisfies Person,
      legacyId: text(entry.id),
      leaderName,
    };
  });
  const leadersByName = new Map(
    provisional
      .filter(item => item.person.role === 'LEADER')
      .map(item => [normalizeSearch(item.person.name), item.person]),
  );
  const migratedPeople = provisional.map(({ person, leaderName }) => {
    if (person.role !== 'CONSULTANT' || !leaderName) return person;
    const leader = leadersByName.get(normalizeSearch(leaderName));
    if (!leader) return { ...person, status: 'REVIEW' as const };
    return {
      ...person,
      leaderId: leader.id,
      groupId: person.groupId ?? leader.groupId,
      groupName: person.groupName ?? leader.groupName,
    };
  });
  const ownerNormalized = normalizeSearch(state.people.find(person => person.id === state.workspace.ownerPersonId)?.name ?? '');
  state.people.push(...migratedPeople.filter(person => normalizeSearch(person.name) !== ownerNormalized));

  const idMap = new Map(
    provisional
      .filter(item => item.legacyId)
      .map(item => [item.legacyId, item.person.id]),
  );
  state.orders = parsed.orders.filter(isRecord).map((entry, index): V2Order => {
    const amount = finiteNumber(entry.amount);
    const quantity = finiteNumber(entry.qty ?? entry.quantity);
    return {
      id: text(entry.id) || `legacy-order-${index + 1}`,
      consultantId: idMap.get(text(entry.consultantId)) ?? text(entry.consultantId) ?? `unlinked-${index + 1}`,
      weekId: weekId(entry.week, state.workspace.week.id),
      source: sourceChannel(entry.source),
      summary: text(entry.summary) || 'Pedido sem resumo',
      ...(quantity && quantity > 0 ? { quantity: Math.floor(quantity) } : {}),
      ...(amount !== undefined ? { amount } : {}),
      ...(text(entry.payment) ? { payment: text(entry.payment) } : {}),
      ...(text(entry.note) ? { note: text(entry.note) } : {}),
      stage: legacyStage(entry),
      createdAt: text(entry.date) || now,
    };
  });

  const salesTarget = finiteNumber(workspace.goal);
  const legacyGoals = Array.isArray(parsed.goals) ? parsed.goals.filter(isRecord) : [];
  state.goals = state.goals.map(goal => {
    const legacyGoal = legacyGoals.find(item => text(item.id) === goal.id || normalizeSearch(text(item.type)) === normalizeSearch(goal.type));
    if (goal.id === 'sales') return { ...goal, target: salesTarget ?? finiteNumber(legacyGoal?.target) ?? goal.target };
    return {
      ...goal,
      target: finiteNumber(legacyGoal?.target) ?? goal.target,
      current: finiteNumber(legacyGoal?.current) ?? goal.current,
    };
  });
  state.updatedAt = now;
  return state;
}
