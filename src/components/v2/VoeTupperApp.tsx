'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createLocalPilotStore, type PilotStore } from '../../lib/v2/storage';
import { createLocalAccessGateway, type LocalAccessGateway } from '../../lib/v2/auth';
import type { V2State } from '../../lib/v2/model';
import { v2Reducer, type V2Action } from '../../lib/v2/reducer';
import { AppShell, type AppDestination } from './AppShell';
import { NetworkView, type NetworkMode } from './NetworkView';
import { LoginView } from './LoginView';
import { OrderDialog } from './OrderDialog';
import { OrdersView, type OrdersMode } from './OrdersView';
import { ProfileView } from './ProfileView';
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
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [hasCredential, setHasCredential] = useState(false);
  const [demo, setDemo] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string>();
  const [active, setActive] = useState<AppDestination>('today');
  const [ordersMode, setOrdersMode] = useState<OrdersMode>('history');
  const [networkMode, setNetworkMode] = useState<NetworkMode>('wall');
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [warning, setWarning] = useState<string>();
  const stateRef = useRef<V2State | null>(null);
  const storeRef = useRef<PilotStore | null>(null);
  const accessRef = useRef<LocalAccessGateway | null>(null);

  useEffect(() => {
    const store = createLocalPilotStore(window.localStorage);
    const demoSession = new URLSearchParams(window.location.search).get('demo') === '1';
    const access = createLocalAccessGateway(window.localStorage, window.sessionStorage, window.crypto);
    const loaded = store.load({ demo: demoSession });
    storeRef.current = store;
    accessRef.current = access;
    stateRef.current = loaded.state;
    setState(loaded.state);
    setWarning(loaded.warning);
    setDemo(demoSession);
    setHasCredential(access.hasCredential());
    setSignedIn(demoSession || access.isSignedIn());
    setReady(true);
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

  const navigate = useCallback((destination: AppDestination) => {
    setActive(destination);
    if (destination === 'orders') setOrdersMode('history');
  }, []);

  const openClosing = useCallback(() => {
    setOrdersMode('closing');
    setActive('orders');
  }, []);

  const submitAccess = useCallback(async (handle: string, password: string) => {
    const access = accessRef.current;
    if (!access) return;
    setAuthBusy(true);
    setAuthError(undefined);
    const result = hasCredential ? await access.signIn(handle, password) : await access.create(handle, password);
    setAuthBusy(false);
    if (!result.ok) { setAuthError(result.error); return; }
    setHasCredential(true);
    setSignedIn(true);
  }, [hasCredential]);

  const signOut = useCallback(() => {
    accessRef.current?.signOut();
    setSignedIn(false);
    setActive('today');
  }, []);

  if (!ready || !state) return <LoadingView />;
  if (!signedIn) return <LoginView mode={hasCredential ? 'signin' : 'create'} busy={authBusy} error={authError} onSubmit={submitAccess} />;

  return (
    <>
      <AppShell active={active} onNavigate={navigate} warning={warning}>
        {active === 'today' ? (
          <TodayView state={state} dispatch={dispatch} onOpenOrder={() => setOrderDialogOpen(true)} onOpenClosing={openClosing} onNavigate={navigate} />
        ) : active === 'orders' ? (
          <OrdersView state={state} mode={ordersMode} onModeChange={setOrdersMode} dispatch={dispatch} onOpenOrder={() => setOrderDialogOpen(true)} />
        ) : active === 'network' ? (
          <NetworkView state={state} mode={networkMode} onModeChange={setNetworkMode} dispatch={dispatch} />
        ) : active === 'profile' ? (
          <ProfileView state={state} dispatch={dispatch} onSignOut={signOut} demo={demo} />
        ) : (
          <PreviewDestination destination={active} />
        )}
      </AppShell>
      <OrderDialog open={orderDialogOpen} state={state} onClose={() => setOrderDialogOpen(false)} onCreate={order => { dispatch({ type: 'orderCreated', order }); setActive('today'); }} />
    </>
  );
}
