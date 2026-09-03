import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const product = readFileSync(new URL('../product-v6.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../network-es.css', import.meta.url), 'utf8');
const active = `${product}\n${css}`;

describe('Voe operational coworker', () => {
  it('uses the flame mascot as a contextual assistant instead of decoration', () => {
    expect(product).toContain('function vt7Coworker');
    expect(product).toContain('Assistente Voe');
    expect(product).toContain('vt7CoworkerMessage');
    expect(product).toContain('pendingOrders()');
    expect(product).toContain("vt7Goal('recruitment')");
    expect(product).toContain('Meta atingida');
    expect(product).toContain('go(\'closing\')');
    expect(product).toContain('go(\'network\')');
  });

  it('keeps the mascot compact, accessible and consistent with the mobile product', () => {
    expect(product).toContain('aria-hidden="true"');
    expect(css).toContain('.vt7-coworker');
    expect(css).toContain('.vt7-coworker-flame');
    expect(css).toContain('.vt7-coworker-action');
    expect(active).not.toContain('—');
  });
});
