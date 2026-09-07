import type { Vitrine } from './model';

export type VitrineStatus = 'PLANNED' | 'OPEN' | 'CLOSED';

export function getVitrineStatus(vitrine: Vitrine, now: Date): VitrineStatus {
  if (now.getTime() < Date.parse(vitrine.opensAt)) return 'PLANNED';
  return now.getTime() < Date.parse(vitrine.closesAt) ? 'OPEN' : 'CLOSED';
}

export function formatVitrineClosing(vitrine: Vitrine) {
  const parts = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: vitrine.timezone,
    hour12: false,
  }).formatToParts(new Date(vitrine.closesAt));
  const weekday = parts.find(part => part.type === 'weekday')?.value ?? '';
  const hour = parts.find(part => part.type === 'hour')?.value ?? '';
  const minute = parts.find(part => part.type === 'minute')?.value ?? '00';
  return `Fechamento: ${weekday} às ${Number(hour)}h${minute}`;
}
