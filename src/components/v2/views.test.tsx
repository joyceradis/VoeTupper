import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createDemoState } from '../../lib/v2/model';
import { AppShell } from './AppShell';
import { LoginView } from './LoginView';
import { NetworkView } from './NetworkView';
import { OrderDialog } from './OrderDialog';
import { OrdersView } from './OrdersView';
import { ProfileView } from './ProfileView';
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

  it('renders an accessible Brazilian order form', () => {
    const html = renderToStaticMarkup(
      <OrderDialog
        open
        state={createDemoState('2026-09-05T15:00:00.000Z')}
        onClose={() => undefined}
        onCreate={() => undefined}
      />,
    );

    expect(html).toContain('Recebi por');
    expect(html).toContain('Resumo / itens');
    expect(html).toContain('for="order-source"');
    expect(html).toContain('for="order-summary"');
    expect(html).toContain('inputMode="decimal"');
    expect(html).toContain('inputMode="numeric"');
    expect(html).toContain('Cancelar');
    expect(html).toContain('Salvar pedido');
  });

  it('keeps terminal orders in history and out of closing', () => {
    const state = createDemoState('2026-09-05T15:00:00.000Z');
    state.orders.push({
      ...state.orders[0],
      id: 'order-cancelled',
      summary: 'Pedido cancelado de teste',
      stage: 'CANCELLED',
    });

    const closing = renderToStaticMarkup(
      <OrdersView state={state} mode="closing" onModeChange={() => undefined} dispatch={() => undefined} onOpenOrder={() => undefined} />,
    );
    const history = renderToStaticMarkup(
      <OrdersView state={state} mode="history" onModeChange={() => undefined} dispatch={() => undefined} onOpenOrder={() => undefined} />,
    );

    expect(closing).toContain('2 potes e 1 garrafa');
    expect(closing).toContain('Conferir');
    expect(closing).toContain('Enviar print');
    expect(closing).not.toContain('Pedido semanal');
    expect(closing).not.toContain('Pedido cancelado de teste');
    expect(history).toContain('Pedido semanal');
    expect(history).toContain('Pedido cancelado de teste');
  });

  it('renders factual wall entries from the current network state', () => {
    const html = renderToStaticMarkup(
      <NetworkView state={createDemoState('2026-09-05T15:00:00.000Z')} mode="wall" onModeChange={() => undefined} dispatch={() => undefined} />,
    );

    expect(html).toContain('Meta em movimento');
    expect(html).toContain('Pedido recebido');
    expect(html).toContain('Consultora Lúcia');
  });

  it('explains truthfully when ranking cannot be calculated', () => {
    const html = renderToStaticMarkup(
      <NetworkView state={createDemoState('2026-09-05T15:00:00.000Z')} mode="ranking" onModeChange={() => undefined} dispatch={() => undefined} />,
    );
    expect(html).toContain('Líder Marina');
    expect(html).toContain('Líder Paula');

    const state = createDemoState('2026-09-05T15:00:00.000Z');
    state.people = state.people.filter(person => person.id !== 'leader-paula');
    const empty = renderToStaticMarkup(
      <NetworkView state={state} mode="ranking" onModeChange={() => undefined} dispatch={() => undefined} />,
    );
    expect(empty).toContain('Ainda não há dados suficientes para comparar');
  });

  it('renders the expandable Serra hierarchy with person counts', () => {
    const html = renderToStaticMarkup(
      <NetworkView state={createDemoState('2026-09-05T15:00:00.000Z')} mode="tree" onModeChange={() => undefined} dispatch={() => undefined} />,
    );

    expect(html).toContain('<details');
    expect(html).toContain('Distribuição Espírito Santo');
    expect(html).toContain('Distrito Serra');
    expect(html).toContain('Grupo Marina');
    expect(html).toContain('pessoas');
  });

  it('shows authorized directory summaries without sensitive labels', () => {
    const html = renderToStaticMarkup(
      <NetworkView state={createDemoState('2026-09-05T15:00:00.000Z')} mode="directory" onModeChange={() => undefined} dispatch={() => undefined} />,
    );

    expect(html).toContain('Consultora Lúcia');
    expect(html).toContain('Líder');
    expect(html).toContain('Ativa');
    expect(html).toContain('1003');
    expect(html).not.toContain('CPF');
    expect(html).not.toContain('Senha do portal');
    expect(html).not.toContain('—');
  });

  it('presents local pilot access with the official identity', () => {
    const html = renderToStaticMarkup(
      <LoginView mode="create" busy={false} onSubmit={async () => undefined} />,
    );

    expect(html).toContain('src="/logo-512.png"');
    expect(html).toContain('Acesso deste aparelho');
    expect(html).toContain('Primeiro acesso');
    expect(html).not.toContain('autenticação segura');
    expect(html).not.toContain('multiusuário');
    expect(html).not.toContain('—');
  });

  it('identifies Ritheli and keeps sales and recruitment goals distinct', () => {
    const html = renderToStaticMarkup(
      <ProfileView state={createDemoState('2026-09-05T15:00:00.000Z')} dispatch={() => undefined} onSignOut={() => undefined} />,
    );

    expect(html).toContain('Ritheli Radis');
    expect(html).toContain('Empresária');
    expect(html).toContain('Distrito Serra');
    expect(html).toContain('Meta de vendas');
    expect(html).toContain('R$');
    expect(html).toContain('Meta de recrutamento');
    expect(html).toContain('pessoas');
    expect(html).not.toContain('Conquistas');
  });

  it('labels and rejects an unsafe external destination inline', () => {
    const state = createDemoState('2026-09-05T15:00:00.000Z');
    state.workspace.externalUrl = 'http://portal.example.com';
    const html = renderToStaticMarkup(
      <ProfileView state={state} dispatch={() => undefined} onSignOut={() => undefined} />,
    );

    expect(html).toContain('for="external-portal-url"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('Use um endereço completo começando com https://');
  });
});
