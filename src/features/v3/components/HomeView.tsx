import React from 'react';
import type { V3Snapshot } from '../domain/model';
import { buildHomeInsights } from '../domain/insights';
import { formatVitrineClosing } from '../domain/vitrine';
import { V3Icon } from './ui';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function GoalProgress({ label, current, target }: { label: string; current: number; target: number }) {
  const progress = target > 0 ? Math.max(0, Math.min(current < target ? 99 : 100, Math.round(current / target * 100))) : 0;
  const remaining = Math.max(0, target - current);
  const value = label === 'Vendas' ? `${money.format(current)} de ${money.format(target)}` : `${current} de ${target} pessoas`;
  return <article className="v3-goal-card">
    <div><span>{label}</span><strong>{progress}%</strong></div>
    <p className="v3-goal-remaining">{target <= 0 ? 'Meta a definir' : remaining === 0 ? 'Meta alcançada!' : label === 'Vendas' ? `Faltam ${money.format(remaining)}` : `${remaining === 1 ? 'Falta' : 'Faltam'} ${remaining} ${remaining === 1 ? 'pessoa' : 'pessoas'}`}</p>
    <p className="v3-goal-achieved">{target > 0 ? `Realizado: ${value}` : 'A meta será definida para esta Vitrine.'}</p>
    <div className="v3-progress" role="progressbar" aria-label={`Progresso de ${label}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
  </article>;
}

export function HomeView({ snapshot, onOpenNetwork }: { snapshot: V3Snapshot; onOpenNetwork(tab: 'race' | 'people'): void }) {
  const insights = buildHomeInsights(snapshot);
  const nearGoal = insights.filter(item => item.kind === 'NEAR_GOAL');
  const inactive = insights.find(item => item.kind === 'INACTIVE_COUNT');
  const ownGoals = snapshot.goals.filter(goal => goal.personId === snapshot.viewer.personId && goal.vitrineId === snapshot.vitrine.id);

  return <section className="v3-home">
    <header className="v3-page-heading">
      <div><p className="v3-eyebrow">SUA REDE HOJE</p><h1>Olá, {snapshot.viewer.displayName}!</h1><p>Quanto falta para a meta e quem precisa do seu apoio.</p></div>
      <div className="v3-vitrine-chip"><span>{snapshot.vitrine.label}</span><strong>{formatVitrineClosing(snapshot.vitrine)}</strong></div>
    </header>

    <section className="v3-goals" aria-labelledby="v3-goals-title">
      <div className="v3-section-heading"><div><p className="v3-eyebrow">SUA VITRINE</p><h2 id="v3-goals-title">Suas metas</h2></div></div>
      <div className="v3-goal-grid">
        {ownGoals.map(goal => <GoalProgress key={goal.id} label={goal.type === 'SALES' ? 'Vendas' : goal.type === 'RECRUITMENT' ? 'Recrutamento' : 'Atividade'} current={goal.current} target={goal.target} />)}
        {!ownGoals.length ? <p>As metas desta Vitrine ainda não foram definidas.</p> : null}
      </div>
      <p className="v3-goal-note">Uma meta por Vitrine. O realizado acompanha os resultados registrados.</p>
    </section>

    <nav className="v3-operation-links" aria-label="Atalhos para passar pedidos">
      <a href="https://pedidos.tupperware.com.br/grandevitoria/Default.aspx" target="_blank" rel="noopener noreferrer">Abrir Tupper.NET da Vitoriaware ↗</a>
      <a href="https://www.tupperware.com.br/pages/vitrine-digital" target="_blank" rel="noopener noreferrer">Ver Vitrine Digital ↗</a>
    </nav>

    <section className="v3-radar" aria-labelledby="v3-radar-title">
      <div className="v3-section-heading"><div><p className="v3-eyebrow">PRIORIDADES</p><h2 id="v3-radar-title">Radar de hoje</h2></div><span>{nearGoal.length + (inactive ? 1 : 0)} sinais</span></div>
      <div className="v3-radar-grid">
        {nearGoal.map(item => item.kind === 'NEAR_GOAL' ? <article className="v3-radar-card v3-radar-card-hot" key={item.personId}>
          <span className="v3-radar-icon"><V3Icon name="sparkles" /></span>
          <div><small>QUASE LÁ</small><h3>Faltam {money.format(item.remaining)}</h3><p>{item.personName} · {item.progress}% da meta de vendas.</p></div>
          <button type="button" onClick={() => onOpenNetwork('race')}>Ver na Corrida</button>
        </article> : null)}
        {inactive?.kind === 'INACTIVE_COUNT' ? <article className="v3-radar-card">
          <span className="v3-radar-icon"><V3Icon name="network" /></span>
          <div><small>ATENÇÃO</small><h3>{inactive.count} {inactive.count === 1 ? 'pessoa inativa' : 'pessoas inativas'}</h3><p>Os nomes só aparecem quando você abrir o total de pessoas sob sua responsabilidade.</p></div>
          <button type="button" onClick={() => onOpenNetwork('people')}>Abrir pessoas</button>
        </article> : null}
        {!nearGoal.length && !inactive ? <article className="v3-radar-card v3-radar-card-calm"><span className="v3-radar-icon"><V3Icon name="sparkles" /></span><div><small>TUDO CERTO</small><h3>Nenhuma urgência por aqui</h3><p>Os próximos sinais da sua rede vão aparecer neste Radar.</p></div></article> : null}
      </div>
    </section>

  </section>;
}
