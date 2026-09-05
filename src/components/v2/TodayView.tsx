import React from 'react';
import type { V2Action } from '../../lib/v2/reducer';
import { selectToday, selectWall } from '../../lib/v2/selectors';
import type { V2State } from '../../lib/v2/model';
import type { AppDestination } from './AppShell';
import { Icon, Initials, ProgressBar } from './ui';

type TodayViewProps = {
  state: V2State;
  dispatch: (action: V2Action) => void;
  onOpenOrder: () => void;
  onOpenClosing: () => void;
  onNavigate: (destination: AppDestination) => void;
};

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const number = new Intl.NumberFormat('pt-BR');

function formatGoalValue(value: number, unit: 'BRL' | 'PEOPLE' | 'ORDERS' | 'PERCENT') {
  if (unit === 'BRL') return money.format(value);
  if (unit === 'PERCENT') return `${number.format(value)}%`;
  return number.format(value);
}

function sourceLabel(source: 'AUDIO' | 'PHOTO' | 'TEXT' | 'OTHER') {
  return ({ AUDIO: 'Áudio', PHOTO: 'Foto', TEXT: 'Texto', OTHER: 'Outro' } as const)[source];
}

export function TodayView({ state, dispatch, onOpenOrder, onOpenClosing, onNavigate }: TodayViewProps) {
  const today = selectToday(state);
  const wall = selectWall(state).slice(0, 2);
  const owner = state.people.find(person => person.id === state.workspace.ownerPersonId);
  const consultants = state.people.filter(person => person.role === 'CONSULTANT' && (person.status === 'ACTIVE' || person.status === 'NEW'));
  const leaders = state.people.filter(person => person.role === 'LEADER' && person.status === 'ACTIVE');
  const newConsultants = consultants.filter(person => person.status === 'NEW').length;

  return (
    <div className="v2-page v2-today-page">
      <header className="v2-page-heading">
        <div>
          <p className="v2-eyebrow">Seu dia na Serra</p>
          <h1>Olá, {owner?.name.split(' ')[0] ?? 'Ritheli'}!</h1>
          <p>Vamos deixar os pedidos em dia e a rede em movimento.</p>
        </div>
        <div className="v2-cycle-chip"><span>{state.workspace.campaignLabel}</span><strong>{state.workspace.week.label}</strong></div>
      </header>

      <section className="v2-action-hero" aria-labelledby="today-action-title">
        <div className="v2-action-copy">
          <span className="v2-hero-icon"><Icon name="sparkles" /></span>
          <div><p className="v2-eyebrow v2-eyebrow-light">Comece por aqui</p><h2 id="today-action-title">Recebeu um pedido?</h2><p>Registre agora para ele não se perder na conversa.</p></div>
        </div>
        <button className="v2-primary-button v2-primary-button-light" type="button" onClick={onOpenOrder}><Icon name="plus" />Novo pedido</button>
      </section>

      <div className="v2-glance-grid" aria-label="Resumo de hoje">
        <button className="v2-glance-card" type="button" onClick={onOpenClosing}>
          <span className="v2-glance-icon v2-glance-icon-pink"><Icon name="clock" /></span>
          <span><strong>{today.pending}</strong><small>para resolver</small></span><Icon className="v2-card-arrow" name="chevron" />
        </button>
        <div className="v2-glance-card"><span className="v2-glance-icon v2-glance-icon-green"><Icon name="trend" /></span><span><strong>{money.format(today.revenue)}</strong><small>em pedidos no ciclo</small></span></div>
      </div>

      <section className="v2-section" aria-labelledby="today-queue-title">
        <div className="v2-section-heading">
          <div><p className="v2-eyebrow">Prioridade</p><h2 id="today-queue-title">O que precisa de você</h2></div>
          {today.queue.length > 0 ? <button className="v2-text-button" type="button" onClick={onOpenClosing}>Ver tudo <Icon name="arrow" /></button> : null}
        </div>
        {today.queue.length > 0 ? (
          <div className="v2-order-stack">
            {today.queue.slice(0, 3).map((order, index) => (
              <article className="v2-order-card" key={order.id}>
                <Initials name={order.personName} tone={index} />
                <div className="v2-order-main">
                  <div className="v2-order-title-row"><h3>{order.personName}</h3>{order.amount !== undefined ? <strong>{money.format(order.amount)}</strong> : null}</div>
                  <p>{order.summary}</p>
                  <div className="v2-order-meta"><span>{sourceLabel(order.source)}</span>{order.quantity ? <span>{order.quantity} {order.quantity === 1 ? 'item' : 'itens'}</span> : null}</div>
                </div>
                <button className="v2-order-action" type="button" onClick={() => dispatch({ type: 'orderAdvanced', orderId: order.id, at: new Date().toISOString() })}>{order.nextAction}<Icon name="arrow" /></button>
              </article>
            ))}
          </div>
        ) : (
          <div className="v2-success-strip"><span><Icon name="check" /></span><div><strong>Tudo em dia por aqui</strong><p>Os próximos pedidos vão aparecer nesta fila.</p></div></div>
        )}
      </section>

      <section className="v2-section" aria-labelledby="today-goals-title">
        <div className="v2-section-heading">
          <div><p className="v2-eyebrow">Progresso</p><h2 id="today-goals-title">Metas do ciclo</h2></div>
          <button className="v2-text-button" type="button" onClick={() => onNavigate('profile')}>Ajustar <Icon name="chevron" /></button>
        </div>
        <div className="v2-goal-grid">
          {today.goals.map(goal => (
            <article className="v2-goal-card" key={goal.id}>
              <div className="v2-goal-topline"><span className="v2-goal-icon"><Icon name={goal.type === 'SALES' ? 'trend' : 'users'} /></span><span className="v2-goal-percent">{goal.percent}%</span></div>
              <h3>{goal.label}</h3><p><strong>{formatGoalValue(goal.current, goal.unit)}</strong> de {formatGoalValue(goal.target, goal.unit)}</p>
              <ProgressBar value={goal.percent} label={`Progresso de ${goal.label}`} />
              <small>{goal.remaining > 0 ? `Faltam ${formatGoalValue(goal.remaining, goal.unit)}` : 'Meta alcançada'}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="v2-section v2-network-section" aria-labelledby="today-network-title">
        <div className="v2-section-heading">
          <div><p className="v2-eyebrow">Sua comunidade</p><h2 id="today-network-title">Rede em movimento</h2></div>
          <button className="v2-text-button" type="button" onClick={() => onNavigate('network')}>Abrir rede <Icon name="arrow" /></button>
        </div>
        <div className="v2-network-card">
          <div className="v2-network-numbers"><div><strong>{consultants.length}</strong><span>consultoras ativas</span></div><div><strong>{leaders.length}</strong><span>{leaders.length === 1 ? 'líder ativa' : 'líderes ativas'}</span></div><div><strong>{newConsultants}</strong><span>novas no ciclo</span></div></div>
          {wall.length > 0 ? (
            <div className="v2-mini-wall">{wall.map((entry, index) => <div className="v2-wall-row" key={entry.id}><Initials name={entry.actorName} tone={index + 1} /><div><strong>{entry.title}</strong><p>{entry.detail}</p></div></div>)}</div>
          ) : <p className="v2-network-empty">As próximas novidades da rede vão aparecer aqui.</p>}
        </div>
      </section>
    </div>
  );
}
