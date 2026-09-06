'use client';

import Image from 'next/image';
import React, { type ReactNode } from 'react';
import type { DataMode } from '../domain/model';
import { V3Icon, type V3IconName } from './ui';

export type V3Destination = 'home' | 'network' | 'profile';

const destinations: { id: V3Destination; label: string; icon: V3IconName }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'network', label: 'Rede', icon: 'network' },
  { id: 'profile', label: 'Perfil', icon: 'profile' },
];

type V3ShellProps = {
  active: V3Destination;
  mode: DataMode;
  networkName: string;
  onNavigate(destination: V3Destination): void;
  children: ReactNode;
};

function Navigation({ active, onNavigate }: Pick<V3ShellProps, 'active' | 'onNavigate'>) {
  return <nav className="v3-nav" aria-label="Navegação principal">
    {destinations.map(destination => (
      <button
        key={destination.id}
        type="button"
        className="v3-nav-item"
        aria-current={active === destination.id ? 'page' : undefined}
        onClick={() => onNavigate(destination.id)}
      >
        <span className="v3-nav-icon"><V3Icon name={destination.icon} /></span>
        <span className="v3-nav-label">{destination.label}</span>
      </button>
    ))}
  </nav>;
}

export function V3Shell({ active, mode, networkName, onNavigate, children }: V3ShellProps) {
  return (
    <div className="v3-shell">
      <a className="v3-skip" href="#v3-content">Ir para o conteúdo</a>
      <aside className="v3-sidebar">
        <div className="v3-brand">
          <Image src="/logo-192.png" alt="" width={50} height={50} />
          <span><strong>VoeTupper</strong><small>{networkName}</small></span>
        </div>
        <Navigation active={active} onNavigate={onNavigate} />
        <p className="v3-sidebar-note"><V3Icon name="sparkles" /> Uma rede em movimento cresce com mais leveza.</p>
      </aside>
      <header className="v3-mobile-header">
        <div className="v3-brand"><Image src="/logo-192.png" alt="" width={44} height={44} /><span><strong>VoeTupper</strong><small>{networkName}</small></span></div>
        {mode === 'DEMO' ? <span className="v3-demo-chip">Demonstração</span> : null}
      </header>
      {mode === 'DEMO' ? <div className="v3-demo-bar"><strong>Demonstração:</strong> estes nomes e números são exemplos.</div> : null}
      <main id="v3-content" className="v3-content">{children}</main>
      <div className="v3-mobile-nav"><Navigation active={active} onNavigate={onNavigate} /></div>
    </div>
  );
}
