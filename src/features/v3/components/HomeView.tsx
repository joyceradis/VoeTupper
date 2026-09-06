import React from 'react';
import type { V3Snapshot } from '../domain/model';
import { buildHomeInsights } from '../domain/insights';
import { V3Icon } from './ui';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function GoalProgress({ label, current, target }: { label: string; current: number; target: number }) {
  const progress = target > 0 ? Math.min(100, Math.round(current / target * 100)) : 0;
  const value = label === 'Vendas' ? `${money.format(current)} de ${money.format(target)}` : `${current} de ${target} pessoas`;
  return <article className="v3-goal-card">
    <div><span>{label}</span><strong>{progress}%</strong></div>
    <p>{value}</p>
    <div className="v3-progress" role="progressbar" aria-label={`Progresso de ${label}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
  </article>;
}

export function HomeView({ snapshot, onOpenNetwork }: { snapshot: V3Snapshot; onOpenNetwork(): void }) {
  const insights = buildHomeInsights(snapshot);
  const nearGoal = insights.filter(item => item.kind === 'NEAR_GOAL');
  const inactive = insights.find(item => item.kind === 'INACTIVE_COUNT');
  const ownGoals = snapshot.goals.filter(goal => goal.personId === snapshot.viewer.personId);

  return <section className="v3-home">
    <header className="v3-page-heading">
      <div><p className="v3-eyebrow">SUA REDE HOJE</p><h1>Olá, {snapshot.viewer.displayName}!</h1><p>Uma visão rápida do que pode ganhar movimento agora.</p></div>
      <div className="v3-vitrine-chip"><span>{snapshot.vitrine.label}</span><strong>Fecha segunda-feira, 12:00</strong></div>
    </header>

    <section className="v3-radar" aria-labelledby="v3-radar-title">
      <div className="v3-section-heading"><div><p className="v3-eyebrow">PRIORIDADES</p><h2 id="v3-radar-title">Radar de hoje</h2></div><span>{nearGoal.length + (inactive ? 1 : 0)} sinais</span></div>
      <div className="v3-radar-grid">
        {nearGoal.map(item => item.kind === 'NEAR_GOAL' ? <article className="v3-radar-card v3-radar-card-hot" key={item.personId}>
          <span className="v3-radar-icon"><V3Icon name="sparkles" /></span>
          <div><small>QUASE LÁ</small><h3>{item.personName} chegou a {item.progress}%</h3><p>Faltam {money.format(item.remaining)} para a meta de vendas.</p></div>
          <button type="button" onClick={onOpenNetwork}>Ver na Corrida</button>
        </article> : null)}
        {inactive?.kind === 'INACTIVE_COUNT' ? <article className="v3-radar-card">
          <span className="v3-radar-icon"><V3Icon name="network" /></span>
          <div><small>ATENÇÃO</small><h3>{inactive.count} {inactive.count === 1 ? 'pessoa inativa' : 'pessoas inativas'}</h3><p>Os nomes só aparecem quando você abrir o total de pessoas sob sua responsabilidade.</p></div>
          <button type="button" onClick={onOpenNetwork}>Abrir pessoas</button>
        </article> : null}
        {!nearGoal.length && !inactive ? <article className="v3-radar-card v3-radar-card-calm"><span className="v3-radar-icon"><V3Icon name="sparkles" /></span><div><small>TUDO CERTO</small><h3>Nenhuma urgência por aqui</h3><p>Os próximos sinais da sua rede vão aparecer neste Radar.</p></div></article> : null}
      </div>
    </section>

    <section className="v3-goals" aria-labelledby="v3-goals-title">
      <div className="v3-section-heading"><div><p className="v3-eyebrow">SUA VITRINE</p><h2 id="v3-goals-title">Suas metas</h2></div></div>
      <div className="v3-goal-grid">
        {ownGoals.map(goal => <GoalProgress key={goal.id} label={goal.type === 'SALES' ? 'Vendas' : goal.type === 'RECRUITMENT' ? 'Recrutamento' : 'Atividade'} current={goal.current} target={goal.target} />)}
      </div>
    </section>
  </section>;
}
