import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AccessView } from './AccessView';
import { V3Shell } from './V3Shell';

describe('VoeTupper V3 entry and shell', () => {
  it('makes the VoeTupper account distinct from TupperNet', () => {
    const html = renderToStaticMarkup(
      <AccessView
        busy={false}
        onSignIn={async () => undefined}
        onResetPassword={async () => undefined}
      />,
    );

    expect(html).toContain('Entrar no VoeTupper');
    expect(html).toContain('Este acesso não é a senha do TupperNet');
    expect(html).toContain('Esqueci minha senha');
    expect(html).not.toContain('empresaria01-teste');
    expect(html).not.toContain('—');
  });

  it('renders the three primary destinations in the adaptive shell', () => {
    const html = renderToStaticMarkup(
      <V3Shell
        active="home"
        mode="DEMO"
        networkName="Rede de demonstração"
        onNavigate={() => undefined}
      >
        <p>Conteúdo</p>
      </V3Shell>,
    );

    expect(html).toContain('Home');
    expect(html).toContain('Rede');
    expect(html).toContain('Perfil');
    expect(html).toContain('Demonstração');
    expect(html).toContain('aria-current="page"');
    expect(html).not.toContain('—');
  });
});
