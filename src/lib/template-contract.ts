export const TEMPLATE_CONTRACT = {
  requiredSheets: [
    'INÍCIO','PEDIDOS','FECHAMENTO','EQUIPE','SEMANAS','OFERTAS','METAS','RECONHECIMENTO','AJUDA','AÇÕES','_BASE_PEDIDOS','CONFIG'
  ],
  orderColumns: [
    'Vitrine (auto)','Semana','Consultora','Data','Recebi por','Resumo / itens','Qtd.','Valor','Pagamento','Conferido','Portal','Print','Finalizado','Cancelado','Observação','Status','Próxima ação'
  ],
  forbiddenTemplateData: ['portal_password','cpf','real_phone','real_consultant_name'],
  distribution: 'Vitoriaware / Grande Vitória',
  state: 'Espírito Santo',
  portalUrl: 'https://pedidos.tupperware.com.br/grandevitoria/Default.aspx',
  templateVersion: 'Vitoriaware Template 1.0'
} as const;
