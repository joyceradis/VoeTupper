import React from 'react';
import type { Person, V3Snapshot } from '../domain/model';

const roleLabels = { DISTRIBUTION: 'Distribuição', BUSINESS_OWNER: 'Empresária', LEADER: 'Líder', CONSULTANT: 'Consultora' } as const;
const statusLabels = { NEW: 'Nova', ACTIVE: 'Ativa', PAUSED: 'Pausada', INACTIVE: 'Inativa', REACTIVATION_ELIGIBLE: 'Pode recadastrar', REACTIVATED: 'Recadastrada' } as const;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toLocaleUpperCase('pt-BR')).join('');
}

function PersonRow({ person }: { person: Person }) {
  return <li className="v3-person-row">
    <span className="v3-person-avatar" aria-hidden="true">{initials(person.displayName)}</span>
    <span className="v3-person-copy"><strong>{person.displayName}</strong><small>{roleLabels[person.role]} · {statusLabels[person.status]}</small></span>
    {person.businessCode ? <span className="v3-person-code">Cód. {person.businessCode}</span> : null}
    <button type="button" aria-label={`Abrir perfil de ${person.displayName}`}>›</button>
  </li>;
}

export function PeopleList({ snapshot, revealInactive, onToggleInactive }: { snapshot: V3Snapshot; revealInactive: boolean; onToggleInactive(): void }) {
  const people = snapshot.people.filter(person => person.districtId === snapshot.viewer.districtId || person.personId === snapshot.viewer.personId);
  const inactive = people.filter(person => person.status === 'INACTIVE' || person.status === 'REACTIVATION_ELIGIBLE');
  const visible = people.filter(person => person.status !== 'INACTIVE' && person.status !== 'REACTIVATION_ELIGIBLE');
  if (revealInactive) visible.push(...inactive);
  return <section className="v3-people">
    <div className="v3-people-summary">
      <div><strong>{people.length}</strong><span>sob sua responsabilidade</span></div>
      <div aria-label={`${people.length - inactive.length} ativas`}><strong>{people.length - inactive.length}</strong><span>ativas</span></div>
      <button type="button" aria-label={`${inactive.length} ${inactive.length === 1 ? 'inativa' : 'inativas'}`} aria-pressed={revealInactive} onClick={onToggleInactive}><strong>{inactive.length}</strong><span>{inactive.length === 1 ? 'inativa' : 'inativas'}</span></button>
    </div>
    <label className="v3-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Buscar por nome, grupo ou código" aria-label="Buscar pessoas" /></label>
    <ul className="v3-person-list">{visible.map(person => <PersonRow key={person.personId} person={person} />)}</ul>
    {inactive.length > 0 && !revealInactive ? <p className="v3-hidden-note">Toque no número de inativas para ver os nomes e avaliar recadastro.</p> : null}
  </section>;
}
