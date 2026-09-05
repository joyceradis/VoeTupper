import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function readPngSize(path: string): [number, number] {
  const png = readFileSync(join(root, path));
  expect([...png.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  return [png.readUInt32BE(16), png.readUInt32BE(20)];
}

type Listener = (event: Record<string, unknown>) => void;

function loadServiceWorker() {
  const source = readFileSync(join(root, 'public/sw.js'), 'utf8');
  const listeners = new Map<string, Listener>();
  const added: string[][] = [];
  const cache = {
    async addAll(assets: string[]) { added.push(assets); },
    async match() { return undefined; },
    async put() { return undefined; },
  };
  const caches = {
    async open() { return cache; },
    async keys() { return ['older-cache']; },
    async delete() { return true; },
    async match() { return undefined; },
  };
  const self = {
    location: { origin: 'https://preview.example.com' },
    clients: { async claim() { return undefined; } },
    async skipWaiting() { return undefined; },
    addEventListener(name: string, listener: Listener) { listeners.set(name, listener); },
  };
  const fetch = async () => ({
    ok: true,
    clone() { return this; },
    async text() { return '<script src="/_next/static/chunks/app.js"></script><link href="/_next/static/css/app.css">'; },
  });
  const execute = new Function('self', 'caches', 'fetch', 'URL', source);
  execute(self, caches, fetch, URL);
  return { listeners, added };
}

describe('VoeTupper V2 PWA', () => {
  it('declares both official PNG sizes and valid files', () => {
    const manifest = JSON.parse(readFileSync(join(root, 'public/manifest.webmanifest'), 'utf8'));

    expect(manifest).toMatchObject({ name: 'VoeTupper', start_url: '/', scope: '/', display: 'standalone' });
    expect(manifest.icons).toEqual([
      { src: '/logo-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/logo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ]);
    expect(readPngSize('public/logo-192.png')).toEqual([192, 192]);
    expect(readPngSize('public/logo-512.png')).toEqual([512, 512]);
  });

  it('discovers and caches the exported Next shell during install', async () => {
    const { listeners, added } = loadServiceWorker();
    let installation: Promise<unknown> | undefined;
    listeners.get('install')?.({ waitUntil(value: Promise<unknown>) { installation = value; } });
    await installation;

    expect(added.flat()).toEqual(expect.arrayContaining([
      '/',
      '/manifest.webmanifest',
      '/logo-192.png',
      '/logo-512.png',
      '/_next/static/chunks/app.js',
      '/_next/static/css/app.css',
    ]));
  });

  it('does not intercept non-GET or cross-origin requests', () => {
    const { listeners } = loadServiceWorker();
    let responses = 0;
    const respondWith = () => { responses += 1; };
    const fetchListener = listeners.get('fetch');

    fetchListener?.({ request: { method: 'POST', url: 'https://preview.example.com/action' }, respondWith });
    fetchListener?.({ request: { method: 'GET', url: 'https://other.example.com/file' }, respondWith });
    expect(responses).toBe(0);

    fetchListener?.({ request: { method: 'GET', url: 'https://preview.example.com/logo-192.png', mode: 'same-origin' }, respondWith });
    expect(responses).toBe(1);
  });

  it('registers the service worker from the application layout', () => {
    const layout = readFileSync(join(root, 'src/app/layout.tsx'), 'utf8');
    expect(layout).toContain('ServiceWorkerRegistration');
    expect(layout).toContain("manifest: '/manifest.webmanifest'");
  });
});
