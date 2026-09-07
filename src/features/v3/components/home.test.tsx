import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createDemoSnapshot } from '../data/demo-repository';
import { HomeView } from './HomeView';

describe('V3 Home Radar', () => {
  it('greets the signed-in person and leads with priorities', () => {
    const html = renderToStaticMarkup(<HomeView snapshot={createDemoSnapshot()} onOpenNetwork={() => undefined} />);

    expect(html).toContain('Olá, Ritheli exemplo!');
    expect(html).toContain('Radar de hoje');
    expect(html).toContain('Convide sua rede para o próximo movimento');
    expect(html).toContain('Tupperware Brasil, sempre por perto');
    expect(html).toContain('https://www.tupperware.com.br/');
    expect(html).toContain('Marina exemplo');
    expect(html.indexOf('Radar de hoje')).toBeLessThan(html.indexOf('Suas metas'));
    expect(html).toContain('segunda-feira, 12:00');
    expect(html).not.toContain('—');
  });
});
