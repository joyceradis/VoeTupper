import { normalizeHandle, validatePassword } from '../auth/model';

export const VISIBLE_HANDLE = 'empresaria01-teste';
export const LEGACY_HANDLE = 'empresaria01-teste-master';
export const LEGACY_AUTH_KEY = 'voetupper-vitoriaware-auth-v1';
export const LEGACY_SESSION_KEY = 'voetupper-vitoriaware-session-v1';
export const V2_AUTH_KEY = 'voetupper-v2-auth-v1';
export const V2_SESSION_KEY = 'voetupper-v2-session-v1';
const PBKDF2_ITERATIONS = 120_000;

type LegacyRecord = { handle: string; salt: string; hash: string };
type V2Record = {
  version: 2;
  handle: string;
  scheme: 'PBKDF2-SHA256';
  iterations: number;
  salt: string;
  hash: string;
};

export interface LocalAccessGateway {
  hasCredential(): boolean;
  isSignedIn(): boolean;
  create(handle: string, password: string): Promise<{ ok: boolean; error?: string }>;
  signIn(handle: string, password: string): Promise<{ ok: boolean; error?: string }>;
  signOut(): void;
}

function canonicalHandle(value: string) {
  const normalized = normalizeHandle(value);
  return normalized === VISIBLE_HANDLE || normalized === LEGACY_HANDLE ? LEGACY_HANDLE : null;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

async function pbkdf2Hash(password: string, salt: Uint8Array, crypto: Crypto, iterations = PBKDF2_ITERATIONS) {
  const ownedSalt = new Uint8Array(salt);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: ownedSalt, iterations },
    key,
    256,
  );
  return new Uint8Array(bits);
}

async function legacyHash(password: string, salt: string, crypto: Crypto) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
}

function sameBytes(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

function readJson<T>(storage: Storage, key: string): T | null {
  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
}

function isV2Record(value: V2Record | null): value is V2Record {
  return value?.version === 2
    && value.scheme === 'PBKDF2-SHA256'
    && value.iterations === PBKDF2_ITERATIONS
    && typeof value.salt === 'string'
    && typeof value.hash === 'string';
}

export function createLocalAccessGateway(
  localStorage: Storage,
  sessionStorage: Storage,
  crypto: Crypto,
): LocalAccessGateway {
  async function writeCredential(handle: string, password: string) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await pbkdf2Hash(password, salt, crypto);
    const record: V2Record = {
      version: 2,
      handle,
      scheme: 'PBKDF2-SHA256',
      iterations: PBKDF2_ITERATIONS,
      salt: bytesToBase64(salt),
      hash: bytesToBase64(hash),
    };
    localStorage.setItem(V2_AUTH_KEY, JSON.stringify(record));
  }

  function signedIn() {
    sessionStorage.setItem(V2_SESSION_KEY, '1');
  }

  return {
    hasCredential() {
      return Boolean(localStorage.getItem(V2_AUTH_KEY) || localStorage.getItem(LEGACY_AUTH_KEY));
    },
    isSignedIn() {
      return sessionStorage.getItem(V2_SESSION_KEY) === '1'
        || sessionStorage.getItem(LEGACY_SESSION_KEY) === '1';
    },
    async create(handle, password) {
      const canonical = canonicalHandle(handle);
      if (!canonical) return { ok: false, error: 'Usuária não reconhecida neste piloto.' };
      if (!validatePassword(password)) {
        return { ok: false, error: 'Use pelo menos 8 caracteres, com letra e símbolo.' };
      }
      if (this.hasCredential()) return { ok: false, error: 'O acesso já foi criado neste aparelho.' };
      try {
        await writeCredential(canonical, password);
        signedIn();
        return { ok: true };
      } catch {
        return { ok: false, error: 'Não foi possível criar o acesso neste aparelho.' };
      }
    },
    async signIn(handle, password) {
      const canonical = canonicalHandle(handle);
      if (!canonical) return { ok: false, error: 'Usuária ou senha incorreta.' };

      const current = readJson<V2Record>(localStorage, V2_AUTH_KEY);
      if (isV2Record(current) && current.handle === canonical) {
        try {
          const actual = await pbkdf2Hash(password, base64ToBytes(current.salt), crypto, current.iterations);
          if (!sameBytes(actual, base64ToBytes(current.hash))) return { ok: false, error: 'Usuária ou senha incorreta.' };
          signedIn();
          return { ok: true };
        } catch {
          return { ok: false, error: 'Usuária ou senha incorreta.' };
        }
      }

      const legacy = readJson<LegacyRecord>(localStorage, LEGACY_AUTH_KEY);
      if (!legacy || canonicalHandle(legacy.handle) !== canonical) return { ok: false, error: 'Usuária ou senha incorreta.' };
      const actualLegacy = await legacyHash(password, legacy.salt, crypto);
      if (actualLegacy !== legacy.hash) return { ok: false, error: 'Usuária ou senha incorreta.' };
      try {
        await writeCredential(canonical, password);
      } catch {
        return { ok: false, error: 'A senha está correta, mas o acesso não pôde ser atualizado neste aparelho.' };
      }
      signedIn();
      return { ok: true };
    },
    signOut() {
      sessionStorage.removeItem(V2_SESSION_KEY);
      sessionStorage.removeItem(LEGACY_SESSION_KEY);
    },
  };
}
