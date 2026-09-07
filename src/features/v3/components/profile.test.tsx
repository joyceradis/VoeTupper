import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createDemoSnapshot } from '../data/demo-repository';
import { ProfileView } from './ProfileView';

describe('V3 profile', () => {
  it('separates personal registration from portal credentials', () => {
    const html = renderToStaticMarkup(<ProfileView snapshot={createDemoSnapshot()} />);

    expect(html).toContain('Ritheli exemplo');
    expect(html).toContain('Dados do VoeTupper');
    expect(html).toContain('Acesso do TupperNet');
    expect(html).toContain('O cadastro e a cópia de senhas ainda não estão disponíveis');
    expect(html).toContain('Importar equipe');
    expect(html).not.toContain('type="password"');
    expect(html).not.toContain('—');
  });
});
