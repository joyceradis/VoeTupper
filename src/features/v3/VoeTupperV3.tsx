'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import { requestPasswordReset, signInVoeTupper } from './auth/session';
import { AccessView } from './components/AccessView';
import { V3Shell, type V3Destination } from './components/V3Shell';
import { HomeView } from './components/HomeView';
import { NetworkView } from './components/NetworkView';
import { ProfileView } from './components/ProfileView';
import { createRepository, type LoadSnapshotResult } from './data/repository';
import type { V3Snapshot } from './domain/model';

type AppState = { kind: 'loading' } | LoadSnapshotResult;

export function V3StatusView({ kind }: { kind: 'loading' | 'configuration-required' | 'error' }) {
  if (kind === 'loading') return <main className="v3-status"><Image src="/logo-192.png" alt="VoeTupper" width={88} height={88} /><strong>Preparando sua rede...</strong></main>;
  if (kind === 'configuration-required') return <main className="v3-status"><Image src="/logo-192.png" alt="VoeTupper" width={88} height={88} /><p className="v3-eyebrow">VOETUPPER V3</p><h1>Acesso real em preparação</h1><p>A nova experiência já está pronta para receber as contas da equipe. Enquanto conectamos os dados reais, você pode conhecer a interface com exemplos identificados.</p><a href="?demo=1">Abrir demonstração</a></main>;
  return <main className="v3-status"><Image src="/logo-192.png" alt="VoeTupper" width={88} height={88} /><h1>Não conseguimos abrir sua rede</h1><p>Atualize a página. Se continuar assim, avise a pessoa responsável pelo VoeTupper.</p><button type="button" onClick={() => location.reload()}>Tentar novamente</button></main>;
}

function TemporaryView({ destination, snapshot }: { destination: V3Destination; snapshot: V3Snapshot }) {
  return <ProfileView snapshot={snapshot} />;
}

export function VoeTupperV3() {
  const [state, setState] = useState<AppState>({ kind: 'loading' });
  const [active, setActive] = useState<V3Destination>('home');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const client = createClient();

  async function load(isDemo: boolean) {
    setState({ kind: 'loading' });
    setState(await createRepository({ demo: isDemo, client }).loadSnapshot());
  }

  useEffect(() => {
    const explicitDemo = new URLSearchParams(window.location.search).get('demo') === '1';
    setDemo(explicitDemo);
    void load(explicitDemo);
  }, []);

  async function signIn(email: string, password: string) {
    if (!client) return;
    setBusy(true);
    setMessage(null);
    const result = await signInVoeTupper(client.auth, email, password);
    setBusy(false);
    if (!result.ok) return setMessage(result.message);
    await load(false);
  }

  async function resetPassword(email: string) {
    if (!client) return;
    setBusy(true);
    const result = await requestPasswordReset(client.auth, email, window.location.origin + window.location.pathname);
    setBusy(false);
    setMessage(result.ok ? 'Pronto. Confira seu e-mail para criar uma nova senha.' : result.message);
  }

  if (state.kind === 'loading') return <V3StatusView kind="loading" />;
  if (state.kind === 'configuration-required') return <V3StatusView kind="configuration-required" />;
  if (state.kind === 'error') return <V3StatusView kind="error" />;
  if (state.kind === 'signed-out') return <AccessView busy={busy} message={message} onSignIn={signIn} onResetPassword={resetPassword} />;

  const district = state.snapshot.districts.find(item => item.id === state.snapshot.membership.districtId);
  const networkName = district ? `Distrito ${district.name}` : 'Sua rede';
  return <V3Shell active={active} mode={demo ? 'DEMO' : state.snapshot.mode} networkName={networkName} onNavigate={setActive}>
    {active === 'home' ? <HomeView snapshot={state.snapshot} onOpenNetwork={() => setActive('network')} /> : active === 'network' ? <NetworkView snapshot={state.snapshot} /> : <TemporaryView destination={active} snapshot={state.snapshot} />}
  </V3Shell>;
}
