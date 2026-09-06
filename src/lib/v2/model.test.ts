import { describe, expect, it } from 'vitest';
import { createDemoState, createEmptyState } from './model';
import { parseBRL, validateHttpsUrl } from './validation';

describe('VoeTupper V2 model', () => {
  it('creates a blank Serra pilot without fabricated results', () => {
    const state = createEmptyState('2026-09-05T12:00:00.000Z');

    expect(state.version).toBe(2);
    expect(state.workspace.districtName).toBe('Serra');
    expect(state.people.map(person => person.name)).toEqual(['Gerusa', 'Ritheli Radis']);
    expect(state.orders).toEqual([]);
    expect(state.events).toEqual([]);
    expect(state.goals.find(goal => goal.id === 'recruitment')).toMatchObject({
      target: 45,
      current: 0,
      unit: 'PEOPLE',
    });
  });

  it('creates coherent demo facts without changing the pilot identity', () => {
    const state = createDemoState('2026-09-05T12:00:00.000Z');

    expect(state.workspace.ownerPersonId).toBe('person-ritheli');
    expect(state.people.filter(person => person.role === 'LEADER')).toHaveLength(2);
    expect(state.orders).toHaveLength(3);
    expect(state.events.every(event => state.people.some(person => person.id === event.actorPersonId))).toBe(true);
  });
});

describe('V2 field validation', () => {
  it.each<[string, number | undefined | null]>([
    ['1.234,56', 1234.56],
    ['0,50', 0.5],
    ['', undefined],
    ['-1', null],
    ['abc', null],
  ])('parses Brazilian money %s', (raw, expected) => {
    expect(parseBRL(raw)).toBe(expected);
  });

  it.each<[string, boolean]>([
    ['https://pedidos.example.com', true],
    ['https://pedidos.example.com/caminho?origem=app', true],
    ['http://pedidos.example.com', false],
    ['javascript:alert(1)', false],
    ['not a url', false],
  ])('validates external URL %s', (raw, expected) => {
    expect(validateHttpsUrl(raw)).toBe(expected);
  });
});
