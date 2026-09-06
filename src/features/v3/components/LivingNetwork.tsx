import React from 'react';
import type { V3Snapshot } from '../domain/model';

export function LivingNetwork({ snapshot }: { snapshot: V3Snapshot }) {
  const distributionPerson = snapshot.people.find(person => person.role === 'DISTRIBUTION');
  return <section className="v3-living-network">
    <article className="v3-map-card">
      <div className="v3-map-copy"><p className="v3-eyebrow">MAPA VIVO</p><h2>Espírito Santo</h2><p>Cada área acende conforme a rede ganha atividade na Vitrine.</p></div>
      <div className="v3-map-visual">
        <svg viewBox="0 0 190 280" role="img" aria-label="Mapa ilustrativo do Espírito Santo">
          <path d="M82 8c22 9 43 18 63 31l-8 30 15 27-11 33 18 26-22 24-2 42-28 9-16 42-34-16-2-39-22-28 14-34-10-31 18-28-4-34 31-18Z" />
          <circle cx="108" cy="185" r="7" /><path className="v3-map-pulse" d="M108 165a20 20 0 1 1 0 40 20 20 0 0 1 0-40Z" />
        </svg>
        <span>Serra</span>
      </div>
      <div className="v3-distribution-badge"><span>ES</span><div><small>Distribuição</small><strong>{distributionPerson?.displayName ?? 'Responsável não informada'}</strong></div></div>
    </article>
    <article className="v3-tree-card">
      <p className="v3-eyebrow">ESTRUTURA</p><h2>Da distribuição até cada consultora</h2>
      <details open>
        <summary><span>Espírito Santo</span><small>{snapshot.districts.length} {snapshot.districts.length === 1 ? 'distrito' : 'distritos'}</small></summary>
        <div className="v3-tree-branch">
          {snapshot.districts.map(district => <details key={district.id} open>
            <summary><span>Distrito {district.name}</span><small>{snapshot.people.filter(person => person.districtId === district.id).length} pessoas</small></summary>
            <div className="v3-tree-branch">
              {snapshot.groups.filter(group => group.districtId === district.id).map(group => <details key={group.id}>
                <summary><span>{group.name}</span><small>{snapshot.people.filter(person => person.groupId === group.id).length} {snapshot.people.filter(person => person.groupId === group.id).length === 1 ? 'pessoa' : 'pessoas'}</small></summary>
                <ul>{snapshot.people.filter(person => person.groupId === group.id).map(person => <li key={person.personId}>{person.displayName}</li>)}</ul>
              </details>)}
            </div>
          </details>)}
        </div>
      </details>
    </article>
  </section>;
}
