import { describe, expect, it } from 'vitest';
import { nextActionLabel, nextOrderStage } from './order';

describe('order workflow', () => {
  it('advances through the operational stages', () => {
    expect(nextOrderStage('RECEIVED')).toBe('ORGANIZED');
    expect(nextOrderStage('ORGANIZED')).toBe('PORTAL_DONE');
    expect(nextOrderStage('PORTAL_DONE')).toBe('CONFIRMATION_SENT');
    expect(nextOrderStage('CONFIRMATION_SENT')).toBe('COMPLETED');
  });

  it('does not advance terminal stages', () => {
    expect(nextOrderStage('COMPLETED')).toBeNull();
    expect(nextOrderStage('CANCELLED')).toBeNull();
  });

  it('uses user-facing actions instead of internal stage jargon', () => {
    expect(nextActionLabel('RECEIVED')).toBe('Organizar pedido');
    expect(nextActionLabel('ORGANIZED')).toBe('Lançar no portal');
    expect(nextActionLabel('PORTAL_DONE')).toBe('Enviar confirmação');
    expect(nextActionLabel('CONFIRMATION_SENT')).toBe('Finalizar');
  });
});
