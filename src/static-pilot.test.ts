import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

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
    const match = html.match(/<script>([\s\S]*?)<\/script>/);
    expect(match?.[1]).toBeTruthy();
    expect(() => new Function(match![1])).not.toThrow();
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
