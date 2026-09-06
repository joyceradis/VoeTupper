import { describe, expect, it } from 'vitest';
import { createDemoState, createEmptyState, type V2Order } from './model';
import { v2Reducer } from './reducer';
import { selectToday } from './selectors';

const at = '2026-09-05T15:00:00.000Z';

describe('V2 reducer', () => {
  it('adds a received order at the start of history', () => {
    const state = createEmptyState('2026-09-05T12:00:00.000Z');
    const order: V2Order = {
      id: 'o1',
      consultantId: 'person-ritheli',
      weekId: state.workspace.week.id,
      source: 'TEXT',
      summary: 'Pedido novo',
      stage: 'RECEIVED',
      createdAt: at,
    };

    const next = v2Reducer(state, { type: 'orderCreated', order });

    expect(next.orders[0]).toEqual(order);
    expect(next.events[0]).toMatchObject({ kind: 'ORDER_RECEIVED', subjectId: 'o1' });
    expect(next.updatedAt).toBe(at);
  });

  it('advances an order and leaves completed orders in history', () => {
    let state = createDemoState('2026-09-05T12:00:00.000Z');
    state.orders = [state.orders[0]];
    const stages = ['ORGANIZED', 'PORTAL_DONE', 'CONFIRMATION_SENT', 'COMPLETED'];

    for (const [index, stage] of stages.entries()) {
      state = v2Reducer(state, { type: 'orderAdvanced', orderId: 'order-demo-1', at: `${at}-${index}` });
      expect(state.orders[0].stage).toBe(stage);
    }

    expect(selectToday(state).queue).toEqual([]);
    expect(state.orders).toHaveLength(1);
  });

  it('does not advance a terminal or missing order', () => {
    const state = createDemoState(at);

    expect(v2Reducer(state, { type: 'orderAdvanced', orderId: 'order-demo-3', at })).toBe(state);
    expect(v2Reducer(state, { type: 'orderAdvanced', orderId: 'missing', at })).toBe(state);
  });

  it('cancels active work but keeps it in history', () => {
    const state = createDemoState(at);
    const next = v2Reducer(state, { type: 'orderCancelled', orderId: 'order-demo-1', at });

    expect(next.orders.find(order => order.id === 'order-demo-1')?.stage).toBe('CANCELLED');
    expect(next.orders).toHaveLength(3);
    expect(selectToday(next).queue.map(order => order.id)).not.toContain('order-demo-1');
  });

  it('updates one goal without changing another goal', () => {
    const state = createEmptyState('2026-09-05T12:00:00.000Z');
    const originalSales = state.goals.find(goal => goal.id === 'sales');
    const next = v2Reducer(state, {
      type: 'goalUpdated',
      goalId: 'recruitment',
      target: 45,
      current: 17,
      at,
    });

    expect(next.goals.find(goal => goal.id === 'recruitment')).toMatchObject({ target: 45, current: 17 });
    expect(next.goals.find(goal => goal.id === 'sales')).toEqual(originalSales);
  });

  it('rejects invalid goal values and unsafe external URLs', () => {
    const state = createEmptyState(at);

    expect(v2Reducer(state, { type: 'goalUpdated', goalId: 'sales', target: -1, current: 0, at })).toBe(state);
    expect(v2Reducer(state, { type: 'externalUrlUpdated', url: 'javascript:alert(1)', at })).toBe(state);
  });

  it('adds one person and records the factual event', () => {
    const state = createEmptyState('2026-09-05T12:00:00.000Z');
    const person = {
      id: 'c1',
      name: 'Ana',
      role: 'CONSULTANT' as const,
      status: 'NEW' as const,
      distributionId: state.workspace.distributionId,
      districtId: state.workspace.districtId,
    };

    const next = v2Reducer(state, { type: 'personAdded', person, at });

    expect(next.people.at(-1)).toEqual(person);
    expect(next.events[0]).toMatchObject({ kind: 'PERSON_JOINED', actorPersonId: 'c1' });
    expect(v2Reducer(next, { type: 'personAdded', person, at })).toBe(next);
  });

  it('changes a role without changing the person identity', () => {
    const state = createDemoState('2026-09-05T12:00:00.000Z');
    const next = v2Reducer(state, {
      type: 'personRoleUpdated',
      personId: 'consultant-lucia',
      role: 'LEADER',
      groupId: 'group-lucia',
      groupName: 'Grupo Lúcia',
      at,
    });
    const person = next.people.find(item => item.id === 'consultant-lucia');

    expect(person).toMatchObject({ id: 'consultant-lucia', role: 'LEADER', groupId: 'group-lucia' });
    expect(next.people.filter(item => item.id === 'consultant-lucia')).toHaveLength(1);
  });

  it('stores a validated external URL', () => {
    const state = createEmptyState('2026-09-05T12:00:00.000Z');
    const next = v2Reducer(state, { type: 'externalUrlUpdated', url: 'https://pedidos.example.com/app', at });

    expect(next.workspace.externalUrl).toBe('https://pedidos.example.com/app');
  });
});
