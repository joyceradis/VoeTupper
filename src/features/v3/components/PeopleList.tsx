'use client';

import React, { useState } from 'react';
import type { Person, V3Snapshot } from '../domain/model';
import { filterPeopleForViewer } from '../domain/scope';

const roleLabels = { DISTRIBUTION: 'Distribuição', BUSINESS_OWNER: 'Empresária', LEADER: 'Líder', CONSULTANT: 'Consultora' } as const;
const statusLabels = { NEW: 'Nova', ACTIVE: 'Ativa', PAUSED: 'Pausada', INACTIVE: 'Inativa', REACTIVATION_ELIGIBLE: 'Pode recadastrar', REACTIVATED: 'Recadastrada' } as const;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toLocaleUpperCase('pt-BR')).join('');
}

function PersonRow({ person }: { person: Person }) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  async function copyCode() {
    if (!person.businessCode) return;
    try {
      await navigator.clipboard.writeText(person.businessCode);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  }
  return <li className="v3-person-row">
    <span className="v3-person-avatar" aria-hidden="true">{initials(person.displayName)}</span>
    <span className="v3-person-copy"><strong>{person.displayName}</strong><small>{roleLabels[person.role]} · {statusLabels[person.status]}</small></span>
    {person.businessCode ? <div className="v3-code-actions">
      <span className="v3-person-code">Cód. {person.businessCode}</span>
      <button type="button" onClick={copyCode} aria-label={`Copiar código de ${person.displayName}`}>{copyState === 'copied' ? 'Copiado!' : 'Copiar código'}</button>
      <span role="status">{copyState === 'copied' ? 'Código copiado.' : copyState === 'failed' ? 'Não foi possível copiar. Selecione o código e copie manualmente.' : ''}</span>
    </div> : <span className="v3-person-code">Código não informado</span>}
  </li>;
}

export function PeopleList({ snapshot, revealInactive, onToggleInactive }: { snapshot: V3Snapshot; revealInactive: boolean; onToggleInactive(): void }) {
  const [query, setQuery] = useState('');
  const people = filterPeopleForViewer(snapshot.viewer, snapshot.people);
  const inactive = people.filter(person => person.status === 'INACTIVE' || person.status === 'REACTIVATION_ELIGIBLE');
  const visible = people.filter(person => person.status !== 'INACTIVE' && person.status !== 'REACTIVATION_ELIGIBLE');
  if (revealInactive) visible.push(...inactive);
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  const search = normalize(query.trim());
  const results = visible.filter(person => {
    const group = snapshot.groups.find(item => item.id === person.groupId)?.name ?? '';
    return normalize(`${person.displayName} ${person.businessCode ?? ''} ${group}`).includes(search);
  });
  return <section className="v3-people">
    <div className="v3-people-summary">
      <div><strong>{people.length}</strong><span>sob sua responsabilidade</span></div>
      <div aria-label={`${people.length - inactive.length} ativas`}><strong>{people.length - inactive.length}</strong><span>ativas</span></div>
      <button type="button" aria-label={`${inactive.length} ${inactive.length === 1 ? 'inativa' : 'inativas'}`} aria-pressed={revealInactive} onClick={onToggleInactive}><strong>{inactive.length}</strong><span>{inactive.length === 1 ? 'inativa' : 'inativas'}</span></button>
    </div>
    <label className="v3-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Buscar por nome, grupo ou código" aria-label="Buscar pessoas" value={query} onChange={event => setQuery(event.target.value)} /></label>
    <ul className="v3-person-list">{results.map(person => <PersonRow key={person.personId} person={person} />)}</ul>
    {!results.length ? <p role="status">Nenhuma pessoa encontrada nesta lista.</p> : null}
    {inactive.length > 0 && !revealInactive ? <p className="v3-hidden-note">Toque no número de inativas para ver os nomes e avaliar recadastro.</p> : null}
  </section>;
}
