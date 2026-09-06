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
});
