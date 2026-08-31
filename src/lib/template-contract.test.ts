import { describe, expect, it } from 'vitest';
import { TEMPLATE_CONTRACT } from './template-contract';

describe('Vitoriaware template contract', () => {
  it('preserves the operational workbook tabs', () => {
    expect(TEMPLATE_CONTRACT.requiredSheets).toEqual([
      'INÍCIO','PEDIDOS','FECHAMENTO','EQUIPE','SEMANAS','OFERTAS','METAS','RECONHECIMENTO','AJUDA','AÇÕES','_BASE_PEDIDOS','CONFIG'
    ]);
  });

  it('keeps the order fields that drive closing decisions', () => {
    expect(TEMPLATE_CONTRACT.orderColumns).toEqual([
      'Vitrine (auto)','Semana','Consultora','Data','Recebi por','Resumo / itens','Qtd.','Valor','Pagamento','Conferido','Portal','Print','Finalizado','Cancelado','Observação','Status','Próxima ação'
    ]);
  });

  it('forbids credentials and real team data in the master template', () => {
    expect(TEMPLATE_CONTRACT.forbiddenTemplateData).toEqual(expect.arrayContaining([
      'portal_password','cpf','real_phone','real_consultant_name'
    ]));
  });
});
