import React, { type ButtonHTMLAttributes, type SVGProps } from 'react';

export type IconName =
  | 'arrow'
  | 'check'
  | 'chevron'
  | 'clock'
  | 'close'
  | 'network'
  | 'orders'
  | 'plus'
  | 'profile'
  | 'sparkles'
  | 'target'
  | 'today'
  | 'trend'
  | 'users';

type IconProps = SVGProps<SVGSVGElement> & { name: IconName };

export function Icon({ name, ...props }: IconProps) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    ...props,
  };

  if (name === 'today') return <svg {...common}><path d="M6.5 3.5v3M17.5 3.5v3M4 9h16"/><rect x="4" y="5.5" width="16" height="15" rx="3"/><path d="m8.5 14 2.2 2.1 4.8-5"/></svg>;
  if (name === 'network') return <svg {...common}><circle cx="12" cy="5" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m10.8 7.2-3.6 8.4M13.2 7.2l3.6 8.4M8.5 18h7"/></svg>;
  if (name === 'orders') return <svg {...common}><path d="M7 3.5h10a2 2 0 0 1 2 2v15l-3-2-4 2-4-2-3 2v-15a2 2 0 0 1 2-2Z"/><path d="M8.5 8h7M8.5 12h7"/></svg>;
  if (name === 'profile') return <svg {...common}><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>;
  if (name === 'plus') return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
  if (name === 'arrow') return <svg {...common}><path d="M5 12h14M14 7l5 5-5 5"/></svg>;
  if (name === 'chevron') return <svg {...common}><path d="m9 6 6 6-6 6"/></svg>;
  if (name === 'close') return <svg {...common}><path d="m6 6 12 12M18 6 6 18"/></svg>;
  if (name === 'check') return <svg {...common}><path d="m5 12.5 4.2 4.2L19 7"/></svg>;
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>;
  if (name === 'target') return <svg {...common}><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>;
  if (name === 'trend') return <svg {...common}><path d="m4 17 5-5 3 3 7-8"/><path d="M14 7h5v5"/></svg>;
  if (name === 'users') return <svg {...common}><path d="M15.5 19v-1.5A3.5 3.5 0 0 0 12 14H7a3.5 3.5 0 0 0-3.5 3.5V19"/><circle cx="9.5" cy="7.5" r="3.5"/><path d="M15.5 4.4a3.5 3.5 0 0 1 0 6.7M17 14a3.5 3.5 0 0 1 3.5 3.5V19"/></svg>;
  return <svg {...common}><path d="m12 3 .8 3.2a6.5 6.5 0 0 0 4.6 4.6l3.1.7-3.1.8a6.5 6.5 0 0 0-4.6 4.6L12 20l-.8-3.1a6.5 6.5 0 0 0-4.6-4.6l-3.1-.8 3.1-.7a6.5 6.5 0 0 0 4.6-4.6L12 3Z"/></svg>;
}

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> & {
  icon: IconName;
  label: string;
};

export function IconButton({ icon, label, className = '', ...props }: IconButtonProps) {
  return (
    <button {...props} type={props.type ?? 'button'} className={`v2-icon-button ${className}`.trim()} aria-label={label} title={label}>
      <Icon name={icon} />
    </button>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="v2-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue}>
      <span style={{ width: `${safeValue}%` }} />
    </div>
  );
}

export function Initials({ name, tone = 0 }: { name: string; tone?: number }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toLocaleUpperCase('pt-BR')).join('');
  return <span className={`v2-avatar v2-avatar-tone-${tone % 4}`} aria-hidden="true">{initials || 'VT'}</span>;
}
