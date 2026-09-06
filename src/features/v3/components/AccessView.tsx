'use client';

import Image from 'next/image';
import React, { useState, type FormEvent } from 'react';
import { V3Icon } from './ui';

type AccessViewProps = {
  busy: boolean;
  message?: string | null;
  onSignIn(email: string, password: string): Promise<void>;
  onResetPassword(email: string): Promise<void>;
};

export function AccessView({ busy, message, onSignIn, onResetPassword }: AccessViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSignIn(email, password);
  }

  return (
    <main className="v3-access">
      <section className="v3-access-story" aria-label="VoeTupper">
        <Image src="/logo-512.png" alt="VoeTupper" width={132} height={132} priority />
        <p className="v3-eyebrow v3-eyebrow-light">REDE SERRA</p>
        <h1>Sua rede mais perto.<br />Seu dia mais leve.</h1>
        <p>Pedidos, pessoas e metas reunidos para a sua Vitrine ganhar movimento.</p>
      </section>
      <section className="v3-access-panel">
        <div className="v3-access-form-wrap">
          <p className="v3-eyebrow">BEM-VINDA DE VOLTA</p>
          <h2>Entrar no VoeTupper</h2>
          <p className="v3-access-intro">Use o e-mail e a senha que você criou aqui.</p>
          <div className="v3-account-note">
            <V3Icon name="lock" />
            <span><strong>Este acesso não é a senha do TupperNet.</strong> Seus dados do portal ficam em outra área, protegidos e separados.</span>
          </div>
          <form onSubmit={submit} className="v3-access-form">
            <label htmlFor="v3-email">E-mail</label>
            <input id="v3-email" name="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required />
            <div className="v3-password-row">
              <label htmlFor="v3-password">Senha do VoeTupper</label>
              <button type="button" onClick={() => onResetPassword(email)} disabled={busy}>Esqueci minha senha</button>
            </div>
            <input id="v3-password" name="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
            {message ? <p className="v3-form-message" role="status">{message}</p> : null}
            <button className="v3-sign-in" type="submit" disabled={busy}>
              <span>{busy ? 'Entrando...' : 'Entrar'}</span><V3Icon name="arrow" />
            </button>
          </form>
          <p className="v3-access-help">Primeiro acesso? A pessoa responsável pela sua rede envia o convite.</p>
        </div>
      </section>
    </main>
  );
}
