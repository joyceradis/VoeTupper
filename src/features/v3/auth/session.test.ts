import { describe, expect, it } from 'vitest';
import { requestPasswordReset, signInVoeTupper } from './session';

describe('VoeTupper V3 session', () => {
  it('returns the authentication error without exposing credentials', async () => {
    const result = await signInVoeTupper({
      async signInWithPassword() {
        return { error: { message: 'Invalid login credentials' } };
      },
    }, 'ritheli@example.com', 'segredo');

    expect(result).toEqual({ ok: false, message: 'E-mail ou senha do VoeTupper não conferem.' });
    expect(JSON.stringify(result)).not.toContain('segredo');
  });

  it('requests a recovery link that returns to the app', async () => {
    let redirectTo = '';
    const result = await requestPasswordReset({
      async resetPasswordForEmail(_email, options) {
        redirectTo = options.redirectTo;
        return { error: null };
      },
    }, 'ritheli@example.com', 'https://voe.example.com/');

    expect(result).toEqual({ ok: true });
    expect(redirectTo).toBe('https://voe.example.com/');
  });
});
