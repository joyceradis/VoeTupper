import { describe, expect, it } from 'vitest';
import { createDemoSnapshot } from '../data/demo-repository';
import { buildHomeInsights, rankVitrineProgress } from './insights';

describe('V3 insights', () => {
  it('puts the leader who is almost at her goal first', () => {
    const insights = buildHomeInsights(createDemoSnapshot());

    expect(insights[0]).toMatchObject({ kind: 'NEAR_GOAL', personName: 'Marina exemplo', progress: 88 });
  });

  it('summarizes inactive people without listing their names', () => {
    const snapshot = createDemoSnapshot();
    snapshot.people[4].status = 'INACTIVE';

    const insights = buildHomeInsights(snapshot);
    const inactive = insights.find(item => item.kind === 'INACTIVE_COUNT');

    expect(inactive).toMatchObject({ kind: 'INACTIVE_COUNT', count: 1 });
    expect(JSON.stringify(inactive)).not.toContain('Lúcia');
  });

  it('ranks comparable people by percentage of their individual goal', () => {
    const ranking = rankVitrineProgress(createDemoSnapshot(), 'LEADER');

    expect(ranking.map(item => item.personName)).toEqual(['Marina exemplo', 'Paula exemplo']);
    expect(ranking.map(item => item.progress)).toEqual([88, 51]);
  });

  it('excludes earlier Vitrines from rankings and priorities', () => {
    const snapshot = createDemoSnapshot();
    snapshot.goals.push({ ...snapshot.goals[2], id: 'old-leader-goal', vitrineId: 'previous', current: 1499 });
    expect(rankVitrineProgress(snapshot, 'LEADER')).toHaveLength(2);
    expect(buildHomeInsights(snapshot).filter(item => item.kind === 'NEAR_GOAL')).toHaveLength(1);
  });

  it('keeps a small remaining amount visible instead of rounding to completion', () => {
    const snapshot = createDemoSnapshot();
    snapshot.goals[2].current = 1499.99;
    const entry = buildHomeInsights(snapshot).find(item => item.kind === 'NEAR_GOAL');
    expect(entry).toMatchObject({ progress: 99 });
    if (entry?.kind === 'NEAR_GOAL') expect(entry.remaining).toBeCloseTo(0.01);
  });
});
