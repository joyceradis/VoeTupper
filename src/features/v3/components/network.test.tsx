import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createDemoSnapshot } from '../data/demo-repository';
import { LivingNetwork } from './LivingNetwork';
import { PeopleList } from './PeopleList';
import { VitrineRace } from './VitrineRace';
import { NetworkView } from './NetworkView';

describe('V3 network views', () => {
  it('keeps inactive names behind an explicit reveal', () => {
    const snapshot = createDemoSnapshot();
    snapshot.people.push({ ...snapshot.people[4], personId: 'inactive-demo', displayName: 'Inativa exemplo', status: 'INACTIVE' });

    const hidden = renderToStaticMarkup(<PeopleList snapshot={snapshot} revealInactive={false} onToggleInactive={() => undefined} />);
    const revealed = renderToStaticMarkup(<PeopleList snapshot={snapshot} revealInactive onToggleInactive={() => undefined} />);

    expect(hidden).toContain('4 ativas');
    expect(hidden).toContain('1 inativa');
    expect(hidden).not.toContain('Inativa exemplo');
    expect(revealed).toContain('Inativa exemplo');
  });

  it('places the distribution over the living Espírito Santo structure', () => {
    const html = renderToStaticMarkup(<LivingNetwork snapshot={createDemoSnapshot()} />);

    expect(html).toContain('Espírito Santo');
    expect(html).toContain('Gerusa exemplo');
    expect(html).toContain('Distribuição');
    expect(html).toContain('Distrito Serra');
    expect(html).toContain('<details');
  });

  it('shows individual-goal progress and a supportive action', () => {
    const html = renderToStaticMarkup(<VitrineRace snapshot={createDemoSnapshot()} />);

    expect(html).toContain('Marina exemplo');
    expect(html).toContain('88%');
    expect(html).toContain('Faltam R$ 180,00');
    expect(html).toContain('Incentivar');
  });

  it('offers a social community beside the management views', () => {
    const html = renderToStaticMarkup(<NetworkView snapshot={createDemoSnapshot()} initialTab="community" />);

    expect(html).toContain('Comunidade');
    expect(html).toContain('Compartilhe uma conquista');
    expect(html).toContain('Pessoas');
    expect(html).toContain('Mapa Vivo');
    expect(html).toContain('Corrida');
    expect(html).not.toContain('—');
  });
});
