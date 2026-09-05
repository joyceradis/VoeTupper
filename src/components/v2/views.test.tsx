import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createDemoState } from '../../lib/v2/model';
import { AppShell } from './AppShell';
import { TodayView } from './TodayView';
import { IconButton } from './ui';

describe('VoeTupper V2 views', () => {
  it('renders the four primary destinations and no closing tab', () => {
    const html = renderToStaticMarkup(
      <AppShell active="today" onNavigate={() => undefined}>
        <div />
      </AppShell>,
    );

    expect(html).toContain('Hoje');
    expect(html).toContain('Rede');
    expect(html).toContain('Pedidos');
    expect(html).toContain('Perfil');
    expect(html).not.toContain('>Fechamento</button>');
  });

  it('puts the primary order action and current work before secondary content', () => {
    const state = createDemoState('2026-09-05T15:00:00.000Z');
    const html = renderToStaticMarkup(
      <TodayView
        state={state}
        dispatch={() => undefined}
        onOpenOrder={() => undefined}
        onOpenClosing={() => undefined}
        onNavigate={() => undefined}
      />,
    );

    expect(html.indexOf('Novo pedido')).toBeGreaterThanOrEqual(0);
    expect(html.indexOf('Novo pedido')).toBeLessThan(html.indexOf('Metas do ciclo'));
    expect(html).toContain('O que precisa de você');
    expect(html).toContain('Rede em movimento');
  });

  it('keeps rendered product copy free of em dashes', () => {
    const shell = renderToStaticMarkup(
      <AppShell active="today" onNavigate={() => undefined}>
        <TodayView
          state={createDemoState('2026-09-05T15:00:00.000Z')}
          dispatch={() => undefined}
          onOpenOrder={() => undefined}
          onOpenClosing={() => undefined}
          onNavigate={() => undefined}
        />
      </AppShell>,
    );

    expect(shell).not.toContain('—');
  });

  it('gives icon-only buttons an accessible name', () => {
    const html = renderToStaticMarkup(
      <IconButton icon="close" label="Fechar" onClick={() => undefined} />,
    );

    expect(html).toContain('aria-label="Fechar"');
    expect(html).toContain('title="Fechar"');
  });
});
