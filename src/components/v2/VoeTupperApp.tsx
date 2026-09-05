'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createLocalPilotStore, type PilotStore } from '../../lib/v2/storage';
import type { V2State } from '../../lib/v2/model';
import { v2Reducer, type V2Action } from '../../lib/v2/reducer';
import { AppShell, type AppDestination } from './AppShell';
import { TodayView } from './TodayView';
import { Icon } from './ui';

const destinationCopy: Record<Exclude<AppDestination, 'today'>, { eyebrow: string; title: string; text: string }> = {
  network: { eyebrow: 'Sua comunidade', title: 'Rede Serra', text: 'A visão completa da rede está sendo organizada aqui.' },
  orders: { eyebrow: 'Operação', title: 'Pedidos', text: 'O histórico e o fechamento dos pedidos entram nesta área.' },
  profile: { eyebrow: 'Seu espaço', title: 'Perfil e metas', text: 'Identidade, metas e preferências ficam reunidas aqui.' },
};

function LoadingView() {
  return <div className="v2-loading" role="status" aria-live="polite"><img src="/logo-192.png" width="88" height="88" alt="" /><strong>Preparando seu VoeTupper</strong><span>Organizando a rede com carinho...</span></div>;
}

function PreviewDestination({ destination }: { destination: Exclude<AppDestination, 'today'> }) {
  const copy = destinationCopy[destination];
  return <div className="v2-page"><header className="v2-page-heading"><div><p className="v2-eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.text}</p></div></header><section className="v2-preview-card"><span><Icon name="sparkles" /></span><div><h2>Já estamos chegando</h2><p>Esta etapa será conectada ao mesmo fluxo, sem telas duplicadas.</p></div></section></div>;
}

export default function VoeTupperApp() {
  const [state, setState] = useState<V2State | null>(null);
  const [active, setActive] = useState<AppDestination>('today');
  const [warning, setWarning] = useState<string>();
  const stateRef = useRef<V2State | null>(null);
  const storeRef = useRef<PilotStore | null>(null);

  useEffect(() => {
    const store = createLocalPilotStore(window.localStorage);
    const demo = new URLSearchParams(window.location.search).get('demo') === '1';
    const loaded = store.load({ demo });
    storeRef.current = store;
    stateRef.current = loaded.state;
    setState(loaded.state);
    setWarning(loaded.warning);
  }, []);

  const dispatch = useCallback((action: V2Action) => {
    const current = stateRef.current;
    if (!current) return;
    const next = v2Reducer(current, action);
    if (next === current) return;
    stateRef.current = next;
    setState(next);
    const result = storeRef.current?.save(next);
    setWarning(result?.warning);
  }, []);

  if (!state) return <LoadingView />;

  return (
    <AppShell active={active} onNavigate={setActive} warning={warning}>
      {active === 'today' ? <TodayView state={state} dispatch={dispatch} onOpenOrder={() => setActive('orders')} onOpenClosing={() => setActive('orders')} onNavigate={setActive} /> : <PreviewDestination destination={active} />}
    </AppShell>
  );
}
