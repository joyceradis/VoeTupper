import type { Goal, NetworkRole, V3Snapshot } from './model';

export type HomeInsight =
  | { kind: 'NEAR_GOAL'; personId: string; personName: string; progress: number; remaining: number }
  | { kind: 'INACTIVE_COUNT'; count: number }
  | { kind: 'OWN_GOAL'; goalType: Goal['type']; progress: number; remaining: number };

export type RankingEntry = {
  personId: string;
  personName: string;
  progress: number;
  current: number;
  target: number;
};

function percentage(goal: Goal) {
  if (goal.target <= 0) return 0;
  return Math.min(100, Math.round((goal.current / goal.target) * 100));
}

export function rankVitrineProgress(snapshot: V3Snapshot, role: NetworkRole): RankingEntry[] {
  const names = new Map(snapshot.people.filter(person => person.role === role).map(person => [person.personId, person.displayName]));
  return snapshot.goals
    .filter(goal => goal.type === 'SALES' && names.has(goal.personId))
    .map(goal => ({
      personId: goal.personId,
      personName: names.get(goal.personId)!,
      progress: percentage(goal),
      current: goal.current,
      target: goal.target,
    }))
    .sort((left, right) => right.progress - left.progress || left.personName.localeCompare(right.personName, 'pt-BR'));
}

export function buildHomeInsights(snapshot: V3Snapshot): HomeInsight[] {
  const names = new Map(snapshot.people.map(person => [person.personId, person.displayName]));
  const nearGoal: HomeInsight[] = snapshot.goals
    .filter(goal => goal.personId !== snapshot.viewer.personId && goal.type === 'SALES')
    .map(goal => ({
      kind: 'NEAR_GOAL' as const,
      personId: goal.personId,
      personName: names.get(goal.personId) ?? 'Pessoa da rede',
      progress: percentage(goal),
      remaining: Math.max(0, goal.target - goal.current),
    }))
    .filter(item => item.progress >= 75 && item.progress < 100)
    .sort((left, right) => right.progress - left.progress);

  const inactiveCount = snapshot.people.filter(person => person.status === 'INACTIVE' || person.status === 'REACTIVATION_ELIGIBLE').length;
  const inactive: HomeInsight[] = inactiveCount ? [{ kind: 'INACTIVE_COUNT', count: inactiveCount }] : [];
  const own: HomeInsight[] = snapshot.goals
    .filter(goal => goal.personId === snapshot.viewer.personId)
    .map(goal => ({ kind: 'OWN_GOAL' as const, goalType: goal.type, progress: percentage(goal), remaining: Math.max(0, goal.target - goal.current) }));
  return [...nearGoal, ...inactive, ...own];
}
