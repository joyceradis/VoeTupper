import { describe, expect, it } from 'vitest';
import {
  createLocalAccessGateway,
  LEGACY_AUTH_KEY,
  LEGACY_HANDLE,
  V2_AUTH_KEY,
  V2_SESSION_KEY,
  VISIBLE_HANDLE,
} from './auth';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

async function legacyHash(password: string, salt: string) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
}

describe('local pilot access', () => {
  it('maps the visible handle to the existing legacy identity', async () => {
    const local = new MemoryStorage();
    const session = new MemoryStorage();
    const salt = 'legacy-salt';
    local.setItem(LEGACY_AUTH_KEY, JSON.stringify({
      handle: LEGACY_HANDLE,
      salt,
      hash: await legacyHash('Senha!123', salt),
    }));
    const access = createLocalAccessGateway(local, session, globalThis.crypto);

    await expect(access.signIn(VISIBLE_HANDLE, 'Senha!123')).resolves.toEqual({ ok: true });
    expect(session.getItem(V2_SESSION_KEY)).toBe('1');
  });

  it('upgrades a successful legacy sign-in to PBKDF2', async () => {
    const local = new MemoryStorage();
    const session = new MemoryStorage();
    const salt = 'legacy-salt';
    local.setItem(LEGACY_AUTH_KEY, JSON.stringify({
      handle: LEGACY_HANDLE,
      salt,
      hash: await legacyHash('Senha!123', salt),
    }));
    const access = createLocalAccessGateway(local, session, globalThis.crypto);

    await access.signIn(VISIBLE_HANDLE, 'Senha!123');
    const upgraded = JSON.parse(local.getItem(V2_AUTH_KEY) ?? '{}');

    expect(upgraded).toMatchObject({ version: 2, scheme: 'PBKDF2-SHA256', iterations: 120000 });
    expect(upgraded.hash).not.toBe(await legacyHash('Senha!123', salt));
    expect(local.getItem(LEGACY_AUTH_KEY)).not.toBeNull();
  });

  it('creates and verifies a new local credential', async () => {
    const local = new MemoryStorage();
    const session = new MemoryStorage();
    const access = createLocalAccessGateway(local, session, globalThis.crypto);

    await expect(access.create(VISIBLE_HANDLE, 'Senha!123')).resolves.toEqual({ ok: true });
    access.signOut();
    await expect(access.signIn(VISIBLE_HANDLE, 'Senha!123')).resolves.toEqual({ ok: true });
    expect(access.isSignedIn()).toBe(true);
  });

  it.each(['curta!', 'apenasletras', '12345678!', ''])('rejects an unsafe new password %s', async password => {
    const access = createLocalAccessGateway(new MemoryStorage(), new MemoryStorage(), globalThis.crypto);

    await expect(access.create(VISIBLE_HANDLE, password)).resolves.toEqual({
      ok: false,
      error: 'Use pelo menos 8 caracteres, com letra e símbolo.',
    });
  });

  it('does not change stored credentials after a wrong password', async () => {
    const local = new MemoryStorage();
    const session = new MemoryStorage();
    const access = createLocalAccessGateway(local, session, globalThis.crypto);
    await access.create(VISIBLE_HANDLE, 'Senha!123');
    access.signOut();
    const before = local.getItem(V2_AUTH_KEY);

    await expect(access.signIn(VISIBLE_HANDLE, 'Errada!123')).resolves.toEqual({
      ok: false,
      error: 'Usuária ou senha incorreta.',
    });

    expect(local.getItem(V2_AUTH_KEY)).toBe(before);
    expect(access.isSignedIn()).toBe(false);
  });

  it('signs out without deleting either credential record', async () => {
    const local = new MemoryStorage();
    const session = new MemoryStorage();
    const access = createLocalAccessGateway(local, session, globalThis.crypto);
    await access.create(VISIBLE_HANDLE, 'Senha!123');

    access.signOut();

    expect(session.getItem(V2_SESSION_KEY)).toBeNull();
    expect(local.getItem(V2_AUTH_KEY)).not.toBeNull();
  });
});
