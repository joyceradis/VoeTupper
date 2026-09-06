import React, { useState, type FormEvent } from 'react';
import { VISIBLE_HANDLE } from '../../lib/v2/auth';
import { Icon } from './ui';

type LoginViewProps = {
  mode: 'create' | 'signin';
  busy: boolean;
  error?: string;
  onSubmit: (handle: string, password: string) => Promise<void>;
};

export function LoginView({ mode, busy, error, onSubmit }: LoginViewProps) {
  const [handle, setHandle] = useState(VISIBLE_HANDLE);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [localError, setLocalError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === 'create' && password !== confirmation) {
      setLocalError('As senhas precisam ser iguais.');
      return;
    }
    setLocalError('');
    await onSubmit(handle, password);
  }

  return (
    <main className="v2-login-page">
      <section className="v2-login-story" aria-label="VoeTupper">
        <div className="v2-login-glow" />
        <img src="/logo-512.png" width="190" height="190" alt="VoeTupper" />
        <div><p className="v2-eyebrow v2-eyebrow-light">Rede Serra</p><h1>Sua rede mais perto.<br />Seu dia mais leve.</h1><p>Pedidos, pessoas e metas reunidos para você cuidar do que faz a rede crescer.</p></div>
        <small>Feito para a rotina de Ritheli e sua rede.</small>
      </section>

      <section className="v2-login-panel">
        <div className="v2-login-box">
          <div className="v2-login-mobile-logo"><img src="/logo-512.png" width="112" height="112" alt="VoeTupper" /></div>
          <p className="v2-eyebrow">{mode === 'create' ? 'Primeiro acesso' : 'Bem-vinda de volta'}</p>
          <h2>Acesso deste aparelho</h2>
          <p className="v2-login-intro">{mode === 'create' ? 'Crie uma senha para abrir o piloto neste navegador.' : 'Entre com a senha criada neste navegador.'}</p>

          <form className="v2-login-form" onSubmit={submit}>
            <div className="v2-field v2-field-wide">
              <label htmlFor="login-handle">Usuária</label>
              <input id="login-handle" value={handle} onChange={event => setHandle(event.target.value)} autoComplete="username" spellCheck={false} />
            </div>
            <div className="v2-field v2-field-wide">
              <label htmlFor="login-password">Senha</label>
              <input id="login-password" type="password" value={password} onChange={event => { setPassword(event.target.value); setLocalError(''); }} autoComplete={mode === 'create' ? 'new-password' : 'current-password'} />
              {mode === 'create' ? <small className="v2-field-hint">Use 8 ou mais caracteres, com letra e símbolo.</small> : null}
            </div>
            {mode === 'create' ? (
              <div className="v2-field v2-field-wide">
                <label htmlFor="login-confirmation">Repita a senha</label>
                <input id="login-confirmation" type="password" value={confirmation} onChange={event => { setConfirmation(event.target.value); setLocalError(''); }} autoComplete="new-password" />
              </div>
            ) : null}
            {localError || error ? <p className="v2-login-error" role="alert">{localError || error}</p> : null}
            <button className="v2-primary-button v2-login-submit" type="submit" disabled={busy}>{busy ? 'Aguarde...' : mode === 'create' ? 'Criar acesso e entrar' : 'Entrar'}<Icon name="arrow" /></button>
          </form>

          <div className="v2-local-access-note"><Icon name="profile" /><p><strong>Acesso local do piloto</strong><span>A senha fica somente neste navegador. Não use a senha de nenhum portal externo.</span></p></div>
          <footer className="v2-login-footer"><a href="/privacidade">Privacidade</a><span>·</span><a href="/termos">Termos</a></footer>
        </div>
      </section>
    </main>
  );
}
