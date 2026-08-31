import { describe, expect, it } from 'vitest';
import { mapOrderRow, nextSheetAction } from './mapper';

describe('Google Sheets mapper', () => {
  it('maps the PEDIDOS row without collapsing Vitrine and Semana', () => {
    const order = mapOrderRow(['09/2026','36/2026','Ana','31/08/2026','WhatsApp áudio','2 potes',2,350,'PIX',true,false,false,false,false,'']);
    expect(order.vitrine).toBe('09/2026');
    expect(order.week).toBe('36/2026');
    expect(order.consultantName).toBe('Ana');
    expect(order.amount).toBe(350);
    expect(order.status).toBe('CONFERIDO');
  });

  it('derives the next useful action from operational flags', () => {
    expect(nextSheetAction({checked:false,portal:false,print:false,finalized:false,cancelled:false})).toBe('Conferir pedido');
    expect(nextSheetAction({checked:true,portal:false,print:false,finalized:false,cancelled:false})).toBe('Lançar no portal');
    expect(nextSheetAction({checked:true,portal:true,print:false,finalized:false,cancelled:false})).toBe('Enviar print');
    expect(nextSheetAction({checked:true,portal:true,print:true,finalized:false,cancelled:false})).toBe('Finalizar / confirmar');
  });
});
