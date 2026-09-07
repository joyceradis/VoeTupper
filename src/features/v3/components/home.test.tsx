import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createDemoSnapshot } from '../data/demo-repository';
import { HomeView } from './HomeView';

describe('V3 Home Radar', () => {
  it('greets the signed-in person and leads with the amount still missing', () => {
    const html = renderToStaticMarkup(<HomeView snapshot={createDemoSnapshot()} onOpenNetwork={() => undefined} />);

    expect(html).toContain('Olá, Ritheli exemplo!');
    expect(html).toContain('Radar de hoje');
    expect(html).toContain('Marina exemplo');
    expect(html.indexOf('Suas metas')).toBeLessThan(html.indexOf('Radar de hoje'));
    expect(html).toContain('Faltam R$ 2.080,00');
    expect(html).toContain('Faltam 3 pessoas');
    expect(html).toContain('segunda-feira às 12h50');
    expect(html).not.toContain('—');
  });

  it('does not show an earlier Vitrine goal on the current home', () => {
    const snapshot = createDemoSnapshot();
    snapshot.goals.push({ ...snapshot.goals[0], id: 'old-goal', vitrineId: 'previous', target: 99999 });
    const html = renderToStaticMarkup(<HomeView snapshot={snapshot} onOpenNetwork={() => undefined} />);
    expect(html).not.toContain('99.999');
  });

  it('distinguishes an unassigned goal from an achieved one', () => {
    const snapshot = createDemoSnapshot();
    snapshot.goals[0].target = 0;
    snapshot.goals[1].current = 10;
    const html = renderToStaticMarkup(<HomeView snapshot={snapshot} onOpenNetwork={() => undefined} />);
    expect(html).toContain('Meta a definir');
    expect(html).toContain('Meta alcançada!');
    expect(html).not.toContain('Faltam -');
  });
});
