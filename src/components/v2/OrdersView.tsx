import React from 'react';
import { isTerminal, type OrderStage } from '../../lib/domain/order';
import type { V2State } from '../../lib/v2/model';
import type { V2Action } from '../../lib/v2/reducer';
import { Icon, Initials } from './ui';

export type OrdersMode = 'history' | 'closing';

type OrdersViewProps = {
  state: V2State;
  mode: OrdersMode;
  onModeChange: (mode: OrdersMode) => void;
  dispatch: (action: V2Action) => void;
  onOpenOrder: () => void;
};

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });

const stageCopy: Record<OrderStage, { label: string; action?: string; tone: string }> = {
  RECEIVED: { label: 'Recebido', action: 'Conferir', tone: 'pink' },
  ORGANIZED: { label: 'Conferido', action: 'Lançar no portal', tone: 'purple' },
  PORTAL_DONE: { label: 'No portal', action: 'Enviar print', tone: 'blue' },
  CONFIRMATION_SENT: { label: 'Print enviado', action: 'Finalizar', tone: 'orange' },
  COMPLETED: { label: 'Concluído', tone: 'green' },
  CANCELLED: { label: 'Cancelado', tone: 'gray' },
};

export function OrdersView({ state, mode, onModeChange, dispatch, onOpenOrder }: OrdersViewProps) {
  const people = new Map(state.people.map(person => [person.id, person]));
  const ordered = state.orders.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const visible = mode === 'closing' ? ordered.filter(order => !isTerminal(order.stage)) : ordered;
  const activeTotal = ordered.filter(order => !isTerminal(order.stage)).length;
  const completedTotal = ordered.filter(order => order.stage === 'COMPLETED').length;

  function cancel(orderId: string, personName: string) {
    if (typeof window === 'undefined' || window.confirm(`Cancelar o pedido de ${personName}?`)) {
      dispatch({ type: 'orderCancelled', orderId, at: new Date().toISOString() });
    }
  }

  return (
    <div className="v2-page v2-orders-page">
      <header className="v2-page-heading v2-orders-heading">
        <div><p className="v2-eyebrow">Operação do ciclo</p><h1>Pedidos</h1><p>Acompanhe cada pedido do recebimento até a conclusão.</p></div>
        <button className="v2-primary-button" type="button" onClick={onOpenOrder}><Icon name="plus" />Novo pedido</button>
      </header>

      <div className="v2-orders-summary">
        <div><span className="v2-glance-icon v2-glance-icon-pink"><Icon name="clock" /></span><p><strong>{activeTotal}</strong><small>em andamento</small></p></div>
        <div><span className="v2-glance-icon v2-glance-icon-green"><Icon name="check" /></span><p><strong>{completedTotal}</strong><small>concluídos</small></p></div>
      </div>

      <div className="v2-segmented" role="group" aria-label="Visualização dos pedidos">
        <button type="button" aria-pressed={mode === 'history'} onClick={() => onModeChange('history')}>Histórico</button>
        <button type="button" aria-pressed={mode === 'closing'} onClick={() => onModeChange('closing')}>Fechamento {activeTotal > 0 ? <span>{activeTotal}</span> : null}</button>
      </div>

      {mode === 'closing' ? <div className="v2-closing-callout"><Icon name="sparkles" /><p><strong>Fechamento sem confusão</strong><span>Avance uma etapa por vez. O histórico continua guardado.</span></p></div> : null}

      {visible.length > 0 ? (
        <div className="v2-orders-list">
          {visible.map((order, index) => {
            const personName = people.get(order.consultantId)?.name ?? 'Consultora';
            const stage = stageCopy[order.stage];
            return (
              <article className="v2-order-detail-card" key={order.id}>
                <div className="v2-order-detail-head">
                  <Initials name={personName} tone={index} />
                  <div><h2>{personName}</h2><p>{date.format(new Date(order.createdAt))} · {order.quantity ? `${order.quantity} ${order.quantity === 1 ? 'item' : 'itens'}` : 'Quantidade não informada'}</p></div>
                  <span className={`v2-status-chip v2-status-${stage.tone}`}>{stage.label}</span>
                </div>
                <div className="v2-order-detail-body"><p>{order.summary}</p>{order.note ? <small>{order.note}</small> : null}<strong>{order.amount === undefined ? 'Valor não informado' : money.format(order.amount)}</strong></div>
                {mode === 'closing' && stage.action ? (
                  <div className="v2-order-detail-actions">
                    <button className="v2-cancel-button" type="button" onClick={() => cancel(order.id, personName)}>Cancelar</button>
                    <button className="v2-order-action" type="button" onClick={() => dispatch({ type: 'orderAdvanced', orderId: order.id, at: new Date().toISOString() })}>{stage.action}<Icon name="arrow" /></button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="v2-empty-state"><span><Icon name={mode === 'closing' ? 'check' : 'orders'} /></span><h2>{mode === 'closing' ? 'Fechamento em dia' : 'Nenhum pedido ainda'}</h2><p>{mode === 'closing' ? 'Não há pedidos esperando uma próxima etapa.' : 'O primeiro pedido registrado vai aparecer aqui.'}</p>{mode === 'history' ? <button className="v2-primary-button" type="button" onClick={onOpenOrder}>Registrar pedido</button> : null}</div>
      )}
    </div>
  );
}
