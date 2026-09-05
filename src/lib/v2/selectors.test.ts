import { describe, expect, it } from 'vitest';
import { createDemoState, createEmptyState } from './model';
import {
  selectDirectory,
  selectLeaderRanking,
  selectNetworkTree,
  selectToday,
  selectWall,
} from './selectors';

describe('V2 selectors', () => {
  it('summarizes only active work in the current week', () => {
    const summary = selectToday(createDemoState('2026-09-05T12:00:00.000Z'));

    expect(summary.pending).toBe(2);
    expect(summary.forPortal).toBe(0);
    expect(summary.forConfirmation).toBe(1);
    expect(summary.revenue).toBe(729.9);
    expect(summary.queue.map(order => order.id)).toEqual(['order-demo-2', 'order-demo-1']);
    expect(summary.goals.find(goal => goal.id === 'sales')).toMatchObject({ current: 729.9, target: 5000 });
  });

  it('returns no wall entries when there are no facts', () => {
    expect(selectWall(createEmptyState('2026-09-05T12:00:00.000Z'))).toEqual([]);
  });

  it('derives wall entries from demo facts in newest-first order', () => {
    const entries = selectWall(createDemoState('2026-09-05T12:00:00.000Z'));

    expect(entries.map(entry => entry.kind)).toEqual([
      'GOAL_PROGRESS',
      'ORDER_RECEIVED',
      'ORDER_RECEIVED',
      'ORDER_RECEIVED',
      'PERSON_JOINED',
    ]);
  });

  it('ranks only comparable leaders from the same district', () => {
    const ranking = selectLeaderRanking(createDemoState('2026-09-05T12:00:00.000Z'), 'SALES');

    expect(ranking.map(item => [item.position, item.person.name, item.value])).toEqual([
      [1, 'Líder Marina', 549.9],
      [2, 'Líder Paula', 180],
    ]);
  });

  it('returns no ranking when fewer than two leaders have comparable data', () => {
    const state = createDemoState('2026-09-05T12:00:00.000Z');
    state.people = state.people.filter(person => person.name !== 'Líder Paula');

    expect(selectLeaderRanking(state, 'SALES')).toEqual([]);
  });

  it('builds the canonical Serra path without an operation node', () => {
    const tree = selectNetworkTree(createDemoState('2026-09-05T12:00:00.000Z'));

    expect(tree.label).toBe('Distribuição Espírito Santo');
    expect(tree.children[0].label).toBe('Distrito Serra');
    expect(tree.children[0].meta).toBe('Ritheli Radis, Empresária');
    expect(JSON.stringify(tree)).not.toContain('Vitoriaware');
  });

  it('searches the directory without requiring accents', () => {
    const state = createDemoState('2026-09-05T12:00:00.000Z');

    expect(selectDirectory(state, 'lider marina').map(person => person.name)).toEqual(['Líder Marina']);
    expect(selectDirectory(state, '1003').map(person => person.name)).toEqual(['Consultora Lúcia']);
  });
});
