import { describe, expect, it } from 'vitest';
import { formatVitrineClosing, getVitrineStatus } from './vitrine';
import type { Vitrine } from './model';

const vitrine: Vitrine = {
  id: 'vitrine-09-2026',
  label: 'Vitrine 09/2026',
  opensAt: '2026-08-25T12:00:00-03:00',
  closesAt: '2026-09-07T12:50:00-03:00',
  timezone: 'America/Sao_Paulo',
};

describe('V3 Vitrine', () => {
  it('keeps the Vitrine open until Monday at 12:50 in Sao Paulo', () => {
    expect(getVitrineStatus(vitrine, new Date('2026-09-07T15:00:00Z'))).toBe('OPEN');
    expect(getVitrineStatus(vitrine, new Date('2026-09-07T15:49:59Z'))).toBe('OPEN');
    expect(getVitrineStatus(vitrine, new Date('2026-09-07T15:50:00Z'))).toBe('CLOSED');
  });

  it('distinguishes a planned Vitrine from an open one', () => {
    expect(getVitrineStatus(vitrine, new Date('2026-08-25T14:59:59Z'))).toBe('PLANNED');
    expect(getVitrineStatus(vitrine, new Date('2026-08-25T15:00:00Z'))).toBe('OPEN');
  });

  it('formats the operational closing without treating Sunday as the deadline', () => {
    expect(formatVitrineClosing(vitrine)).toBe('Fechamento: segunda-feira às 12h50');
  });
});
