'use client';

import { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { validateNewPassword } from '@/lib/auth/password';

export default function FirstAccessPassword({client,onComplete}:{client:SupabaseClient;onComplete:()=>Promise<void>|void}){
  const [password,setPassword]=useState('');
  const [confirmation,setConfirmation]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);

  async function submit(event:React.FormEvent){
    event.preventDefault();
    const validation=validateNewPassword(password,confirmation);
    if(!validation.ok){setError(validation.message);return;}
    setBusy(true);setError('');
    const updated=await client.auth.updateUser({password});
    if(updated.error){setError('Não foi possível atualizar a senha. Tente novamente.');setBusy(false);return;}
    const identityUpdate=await client.from('auth_identities').update({must_change_password:false,updated_at:new Date().toISOString()}).eq('auth_user_id',updated.data.user.id);
    if(identityUpdate.error){setError('A senha foi atualizada, mas o primeiro acesso ainda precisa ser confirmado. Tente novamente.');setBusy(false);return;}
    setPassword('');setConfirmation('');setBusy(false);await onComplete();
  }

  return <main className="auth-shell"><section className="auth-card">
    <div className="auth-mark">V</div>
    <div className="eyebrow">Primeiro acesso</div>
    <h1>Crie sua senha</h1>
    <p>A senha inicial serve apenas para entrar pela primeira vez. A nova senha fica somente no provedor de autenticação.</p>
    <form onSubmit={submit}>
      <div className="field"><label>Nova senha</label><input type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8}/></div>
      <div className="field"><label>Confirmar nova senha</label><input type="password" autoComplete="new-password" value={confirmation} onChange={e=>setConfirmation(e.target.value)} required minLength={8}/></div>
      {error&&<div className="auth-error" role="alert">{error}</div>}
      <button className="primary" disabled={busy}>{busy?'Salvando...':'Salvar nova senha'}</button>
    </form>
  </section></main>;
}
