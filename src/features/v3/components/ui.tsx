import React, { type SVGProps } from 'react';

export type V3IconName = 'home' | 'network' | 'profile' | 'arrow' | 'lock' | 'sparkles';

export function V3Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: V3IconName }) {
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
  if (name === 'home') return <svg {...common}><path d="M3.5 11.2 12 4l8.5 7.2"/><path d="M5.5 10v9.5h13V10M9.5 19.5v-6h5v6"/></svg>;
  if (name === 'network') return <svg {...common}><circle cx="12" cy="5" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="m10.8 7.1-3.6 8.6M13.2 7.1l3.6 8.6M8.5 18h7"/></svg>;
  if (name === 'profile') return <svg {...common}><circle cx="12" cy="8" r="3.4"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>;
  if (name === 'arrow') return <svg {...common}><path d="M5 12h14M14 7l5 5-5 5"/></svg>;
  if (name === 'lock') return <svg {...common}><rect x="5" y="10" width="14" height="10" rx="3"/><path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10"/></svg>;
  return <svg {...common}><path d="m12 3 .8 3.2a6.5 6.5 0 0 0 4.6 4.6l3.1.7-3.1.8a6.5 6.5 0 0 0-4.6 4.6L12 20l-.8-3.1a6.5 6.5 0 0 0-4.6-4.6l-3.1-.8 3.1-.7a6.5 6.5 0 0 0 4.6-4.6L12 3Z"/></svg>;
}
