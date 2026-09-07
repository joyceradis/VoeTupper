'use client';

import React, { useState } from 'react';
import type { V3Snapshot } from '../domain/model';
import { LivingNetwork } from './LivingNetwork';
import { PeopleList } from './PeopleList';
import { VitrineRace } from './VitrineRace';

export type NetworkTab = 'community' | 'people' | 'map' | 'race';
const tabs: { id: NetworkTab; label: string }[] = [
  { id: 'community', label: 'Comunidade' }, { id: 'people', label: 'Pessoas' }, { id: 'map', label: 'Mapa Vivo' }, { id: 'race', label: 'Corrida' },
];

function Community({ snapshot }: { snapshot: V3Snapshot }) {
  const topGoal = snapshot.goals.find(goal => goal.vitrineId === snapshot.vitrine.id && goal.personId === snapshot.viewer.personId && goal.type === 'SALES' && goal.current > 0);
  return <section className="v3-community">
    <article className="v3-compose"><span>{snapshot.viewer.displayName.slice(0, 1)}</span><button type="button">Compartilhe uma conquista, dica ou incentivo...</button></article>
    <article className="v3-post"><header><span>VT</span><div><strong>Vitrine em movimento</strong><small>Agora na sua rede</small></div></header><p>{topGoal ? `${snapshot.viewer.displayName} já movimentou ${money.format(topGoal.current)} nesta Vitrine.` : 'A primeira conquista da Vitrine pode começar por você.'}</p><footer><button type="button">♡ Curtir</button><button type="button">○ Comentar</button><button type="button">↗ Incentivar</button></footer></article>
  </section>;
}

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function NetworkView({ snapshot, initialTab = 'community' }: { snapshot: V3Snapshot; initialTab?: NetworkTab }) {
  const [tab, setTab] = useState<NetworkTab>(initialTab);
  const [revealInactive, setRevealInactive] = useState(false);
  return <section className="v3-network-view">
    <header className="v3-page-heading"><div><p className="v3-eyebrow">REDE EM MOVIMENTO</p><h1>Rede</h1><p>Converse, acompanhe e reconheça cada avanço.</p></div></header>
    <nav className="v3-network-tabs" aria-label="Áreas da rede">{tabs.map(item => <button key={item.id} type="button" aria-pressed={tab === item.id} onClick={() => setTab(item.id)}>{item.label}</button>)}</nav>
    {tab === 'community' ? <Community snapshot={snapshot} /> : null}
    {tab === 'people' ? <PeopleList snapshot={snapshot} revealInactive={revealInactive} onToggleInactive={() => setRevealInactive(value => !value)} /> : null}
    {tab === 'map' ? <LivingNetwork snapshot={snapshot} /> : null}
    {tab === 'race' ? <VitrineRace snapshot={snapshot} /> : null}
  </section>;
}
