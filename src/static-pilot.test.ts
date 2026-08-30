import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

describe('GitHub Pages pilot', () => {
  it('ships a visible pink product shell before JavaScript executes', () => {
    expect(html).toContain('--pink:#f72578');
    expect(html).toContain('<div id="root">');
    expect(html).toContain('A gente junto, voa mais alto!');
    expect(html).toContain('Produção da semana');
    expect(html).toContain('Ações mais importantes');
  });

  it('has JavaScript that parses before boot', () => {
    const match = html.match(/<script>([\s\S]*?)<\/script>/);
    expect(match?.[1]).toBeTruthy();
    expect(() => new Function(match![1])).not.toThrow();
  });

  it('uses defensive local state and cannot blank the initial shell on storage failure', () => {
    expect(html).toContain("var KEY='voetupper-pilot-v3'");
    expect(html).toContain('function loadState()');
    expect(html).toContain('try{render();}catch(err)');
    expect(html).toContain('bootError');
  });

  it('preserves the operational order workflow including cancellation', () => {
    expect(html).toContain('window.VT=');
    expect(html).toContain('cancel:function(oid)');
    expect(html).toContain("o.stage='CANCELLED'");
    expect(html).toContain('localStorage.setItem');
  });

  it('ships brand and installable metadata with cache-busted favicon', () => {
    expect(html).toContain('manifest.webmanifest?v=4');
    expect(html).toContain('logo.svg?v=4');
    expect(html).toContain('VoeTupper');
  });
});
