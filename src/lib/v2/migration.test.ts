import { describe, expect, it } from 'vitest';
import { migrateLegacyState } from './migration';

const now = '2026-09-05T12:00:00.000Z';

describe('legacy VoeTupper migration', () => {
  it('migrates legacy booleans to the exact order stage', () => {
    const migrated = migrateLegacyState(JSON.stringify({
      workspace: { name: 'Empresária Serra', goal: 5000 },
      consultants: [{ id: 'c1', name: 'Ana', status: 'ATIVA', role: 'consultant', group: 'Grupo Ana' }],
      orders: [{
        id: 'o1',
        consultantId: 'c1',
        week: '36/2026',
        summary: 'Pedido',
        checked: true,
        portal: true,
        print: false,
        finalized: false,
        cancelled: false,
      }],
    }), now);

    expect(migrated.orders[0].stage).toBe('PORTAL_DONE');
    expect(migrated.people.find(person => person.id === 'c1')?.status).toBe('REVIEW');
    expect(migrated.goals.find(goal => goal.id === 'sales')?.target).toBe(5000);
  });

  it.each([
    [{ cancelled: true, finalized: true, print: true, portal: true, checked: true }, 'CANCELLED'],
    [{ finalized: true, print: true, portal: true, checked: true }, 'COMPLETED'],
    [{ print: true, portal: true, checked: true }, 'CONFIRMATION_SENT'],
    [{ portal: true, checked: true }, 'PORTAL_DONE'],
    [{ checked: true }, 'ORGANIZED'],
    [{}, 'RECEIVED'],
  ] as const)('maps legacy stage flags %j to %s', (flags, stage) => {
    const migrated = migrateLegacyState(JSON.stringify({
      workspace: {},
      consultants: [{ id: 'c1', name: 'Ana', status: 'ATIVA', role: 'leader', group: 'Grupo Ana' }],
      orders: [{ id: 'o1', consultantId: 'c1', summary: 'Pedido', ...flags }],
    }), now);

    expect(migrated.orders[0].stage).toBe(stage);
  });

  it('does not invent a group for an ambiguous legacy person', () => {
    const migrated = migrateLegacyState(JSON.stringify({
      workspace: {},
      consultants: [{ id: 'c1', name: 'Ana', status: 'ATIVA', role: 'consultant' }],
      orders: [],
    }), now);
    const person = migrated.people.find(item => item.id === 'c1');

    expect(person?.groupId).toBeUndefined();
    expect(person?.leaderId).toBeUndefined();
    expect(person?.status).toBe('REVIEW');
  });

  it('resolves a confirmed leader name without duplicating identities', () => {
    const migrated = migrateLegacyState(JSON.stringify({
      workspace: {},
      consultants: [
        { id: 'l1', name: 'Líder Ana', status: 'ATIVA', role: 'leader', group: 'Grupo Ana' },
        { id: 'c1', name: 'Consultora Bia', status: 'NOVA', role: 'consultant', leader: 'Lider Ana', group: 'Grupo Ana' },
      ],
      orders: [],
    }), now);

    expect(migrated.people.find(person => person.id === 'c1')).toMatchObject({
      leaderId: 'l1',
      groupName: 'Grupo Ana',
      status: 'NEW',
    });
  });

  it('is deterministic when the same legacy value is migrated twice', () => {
    const raw = JSON.stringify({
      workspace: {},
      consultants: [{ name: 'Ana Maria', code: '123', status: 'ATIVA', role: 'leader', group: 'Grupo Ana' }],
      orders: [],
    });

    expect(migrateLegacyState(raw, now)).toEqual(migrateLegacyState(raw, now));
  });

  it('rejects a malformed legacy root', () => {
    expect(() => migrateLegacyState('{"workspace":[]}', now)).toThrow('Estado legado inválido');
  });
});
