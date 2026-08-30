import { isTerminal, nextActionLabel } from './order';
import type { Consultant, Offer, Order, Week } from './types';

export function buildTodaySummary(input:{week:Week;orders:Order[];consultants:Consultant[];offers:Offer[]}) {
  const orders = input.orders.filter(o => o.weekId === input.week.id);
  const activeConsultants = input.consultants.filter(c => c.status === 'ACTIVE' || c.status === 'NEW');
  const completedIds = new Set(orders.filter(o => o.stage === 'COMPLETED').map(o => o.consultantId));
  const pending = orders.filter(o => !isTerminal(o.stage));
  const realized = orders.filter(o => o.stage !== 'CANCELLED').reduce((sum,o)=>sum+(o.amount ?? 0),0);
  return {
    pendingCount: pending.length,
    portalPendingCount: pending.filter(o => o.stage === 'ORGANIZED').length,
    confirmationPendingCount: pending.filter(o => o.stage === 'PORTAL_DONE').length,
    noOrderCount: activeConsultants.filter(c => !completedIds.has(c.id)).length,
    realized,
    goal: input.week.teamGoal,
    progress: input.week.teamGoal > 0 ? realized / input.week.teamGoal : 0,
    activeOffers: input.offers.filter(o => o.active && (o.weekId === input.week.id || !o.weekId)),
    queue: pending.map(o => ({...o,nextAction:nextActionLabel(o.stage)})),
  };
}
