import React from 'react';
import type { V3Snapshot } from '../domain/model';
import { rankVitrineProgress } from '../domain/insights';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function VitrineRace({ snapshot }: { snapshot: V3Snapshot }) {
  const ranking = rankVitrineProgress(snapshot, 'LEADER');
  return <section className="v3-race">
    <div className="v3-race-intro"><p className="v3-eyebrow">CORRIDA DA VITRINE</p><h2>Quem está quase lá?</h2><p>A comparação considera o progresso de cada meta individual, não apenas o valor vendido.</p></div>
    <ol className="v3-race-list">
      {ranking.map((entry, index) => <li key={entry.personId}>
        <span className="v3-race-position">{index + 1}º</span>
        <div className="v3-race-person"><strong>{entry.personName}</strong><span>Faltam {money.format(Math.max(0, entry.target - entry.current))}</span></div>
        <strong className="v3-race-percent">{entry.progress}%</strong>
        <div className="v3-progress" role="progressbar" aria-label={`Progresso de ${entry.personName}`} aria-valuenow={entry.progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${entry.progress}%` }} /></div>
        <button type="button">Incentivar</button>
      </li>)}
    </ol>
  </section>;
}
