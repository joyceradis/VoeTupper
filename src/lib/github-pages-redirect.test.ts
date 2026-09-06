import { existsSync, readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const legacyPage = new URL('../../index.html', import.meta.url);

describe('legacy GitHub Pages address', () => {
  it('opens the current V3 and preserves the demo query and hash', () => {
    expect(existsSync(legacyPage)).toBe(true);

    const html = readFileSync(legacyPage, 'utf8');
    const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    let redirectedTo = '';

    expect(script).toBeTruthy();
    runInNewContext(script!, {
      window: {
        location: {
          search: '?demo=1',
          hash: '#rede',
          replace: (url: string) => {
            redirectedTo = url;
          },
        },
      },
    });

    expect(redirectedTo).toBe(
      'https://voetupper-serra-v3.joyceradis.chatgpt.site/?demo=1#rede',
    );
  });

  it('opens the demonstration automatically from the plain legacy address', () => {
    expect(existsSync(legacyPage)).toBe(true);

    const html = readFileSync(legacyPage, 'utf8');
    const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    let redirectedTo = '';

    expect(script).toBeTruthy();
    runInNewContext(script!, {
      window: {
        location: {
          search: '',
          hash: '',
          replace: (url: string) => {
            redirectedTo = url;
          },
        },
      },
    });

    expect(redirectedTo).toBe(
      'https://voetupper-serra-v3.joyceradis.chatgpt.site/?demo=1',
    );
  });
});
