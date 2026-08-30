import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? '';

describe('GitHub Pages pilot', () => {
  it('keeps the approved pink responsive product shell', () => {
    expect(html).toContain('--pink:#f72578');
    expect(html).toContain('class="sidebar"');
    expect(html).toContain('class="mobileNav"');
    expect(html).toContain('Vitrine');
    expect(html).toContain('Produção da semana');
    expect(html).toContain('Ações mais importantes');
    expect(html).toContain('Incentivo da semana');
  });

  it('has JavaScript that parses before the first render', () => {
    expect(script).toBeTruthy();
    expect(() => new Function(script)).not.toThrow();
  });

  it('recovers from stale or malformed local pilot data instead of rendering a blank page', () => {
    const root = { innerHTML: '' };
    const document = { getElementById: (id: string) => id === 'root' ? root : null };
    const localStorage = {
      getItem: () => JSON.stringify({ legacy: true }),
      setItem: () => undefined,
    };
    const run = new Function('document','localStorage','Intl','crypto','confirm', script);
    expect(() => run(document, localStorage, Intl, { randomUUID: () => 'id' }, () => true)).not.toThrow();
    expect(root.innerHTML).toContain('VoeTupper');
  });

  it('preserves the full operational order workflow including cancellation', () => {
    expect(html).toContain("function cancelOrder(id)");
    expect(html).toContain("onclick=\"cancelOrder('");
    expect(html).toContain("stage:'CANCELLED'");
    expect(html).toContain('localStorage');
  });

  it('ships the brand art and installable pilot metadata', () => {
    expect(html).toContain('rel="manifest" href="manifest.webmanifest"');
    expect(html).toContain('rel="icon" href="logo.svg"');
    expect(html).toContain('<img src="logo.svg"');
  });
});
