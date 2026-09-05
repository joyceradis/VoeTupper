import React, { type ReactNode } from 'react';
import { Icon, type IconName } from './ui';

export type AppDestination = 'today' | 'network' | 'orders' | 'profile';

type AppShellProps = {
  active: AppDestination;
  onNavigate: (destination: AppDestination) => void;
  children: ReactNode;
  warning?: string;
};

const destinations: Array<{ id: AppDestination; label: string; icon: IconName }> = [
  { id: 'today', label: 'Hoje', icon: 'today' },
  { id: 'network', label: 'Rede', icon: 'network' },
  { id: 'orders', label: 'Pedidos', icon: 'orders' },
  { id: 'profile', label: 'Perfil', icon: 'profile' },
];

function Navigation({ active, onNavigate, mobile = false }: { active: AppDestination; onNavigate: (destination: AppDestination) => void; mobile?: boolean }) {
  return (
    <nav className={mobile ? 'v2-mobile-nav' : 'v2-side-nav'} aria-label="Navegação principal">
      <div className={mobile ? 'v2-mobile-nav-inner' : undefined}>
        {destinations.map(destination => (
          <button key={destination.id} type="button" className="v2-nav-item" aria-current={active === destination.id ? 'page' : undefined} onClick={() => onNavigate(destination.id)}>
            <span className="v2-nav-icon"><Icon name={destination.icon} /></span>
            <span>{destination.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export function AppShell({ active, onNavigate, children, warning }: AppShellProps) {
  return (
    <div className="v2-shell">
      <a className="v2-skip-link" href="#v2-main">Ir para o conteúdo</a>
      <aside className="v2-sidebar">
        <button className="v2-brand" type="button" onClick={() => onNavigate('today')} aria-label="Ir para Hoje">
          <img src="/logo-192.png" alt="" width="58" height="58" />
          <span><strong>VoeTupper</strong><small>Distrito Serra</small></span>
        </button>
        <Navigation active={active} onNavigate={onNavigate} />
        <div className="v2-sidebar-note"><Icon name="sparkles" /><span>Uma rede organizada cresce com mais leveza.</span></div>
        <p className="v2-pilot-label">Piloto local</p>
      </aside>
      <div className="v2-stage">
        <header className="v2-mobile-header">
          <button className="v2-mobile-brand" type="button" onClick={() => onNavigate('today')} aria-label="Ir para Hoje">
            <img src="/logo-192.png" alt="" width="46" height="46" />
            <span><strong>VoeTupper</strong><small>Distrito Serra</small></span>
          </button>
          <span className="v2-local-pill">Piloto</span>
        </header>
        {warning ? <div className="v2-global-warning" role="alert">{warning}</div> : null}
        <main id="v2-main" className="v2-main" tabIndex={-1}>{children}</main>
      </div>
      <Navigation active={active} onNavigate={onNavigate} mobile />
    </div>
  );
}
