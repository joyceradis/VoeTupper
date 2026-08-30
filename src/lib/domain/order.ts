export const ORDER_STAGES = ['RECEIVED','ORGANIZED','PORTAL_DONE','CONFIRMATION_SENT','COMPLETED','CANCELLED'] as const;
export type OrderStage = (typeof ORDER_STAGES)[number];

const transitions: Partial<Record<OrderStage, OrderStage>> = {
  RECEIVED: 'ORGANIZED',
  ORGANIZED: 'PORTAL_DONE',
  PORTAL_DONE: 'CONFIRMATION_SENT',
  CONFIRMATION_SENT: 'COMPLETED',
};

const actions: Record<OrderStage, string> = {
  RECEIVED: 'Organizar pedido',
  ORGANIZED: 'Lançar no portal',
  PORTAL_DONE: 'Enviar confirmação',
  CONFIRMATION_SENT: 'Finalizar',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

export function nextOrderStage(stage: OrderStage): OrderStage | null {
  return transitions[stage] ?? null;
}

export function nextActionLabel(stage: OrderStage): string {
  return actions[stage];
}

export function isTerminal(stage: OrderStage): boolean {
  return stage === 'COMPLETED' || stage === 'CANCELLED';
}
