'use client';

import { useEffect,useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { resolveAuthGateState,type AuthGateState } from '@/lib/auth/session';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import FirstAccessPassword from './FirstAccessPassword';

type RuntimeState='LOADING'|'BACKEND_UNCONFIGURED'|'ERROR'|AuthGateState;

export default function AuthGate({children}:{children:React.ReactNode}){
  const [client]=useState<SupabaseClient|null>(()=>getSupabaseBrowserClient());
  const [state,setState]=useState<RuntimeState>(client?'LOADING':'BACKEND_UNCONFIGURED');
  const [error,setError]=useState('');

  async function refresh(){
    if(!client){setState('BACKEND_UNCONFIGURED');return;}
    setState('LOADING');setError('');
    const sessionResult=await client.auth.getSession();
    if(sessionResult.error){setError('Não foi possível verificar sua sessão.');setState('ERROR');return;}
    const authenticated=!!sessionResult.data.session;
    if(!authenticated){setState('SIGNED_OUT');return;}

    const identityResult=await client.from('auth_identities').select('person_id,must_change_password').maybeSingle();
    if(identityResult.error){setError('Seu acesso ainda não pôde ser identificado na rede.');setState('ERROR');return;}
    const identity=identityResult.data;
    if(!identity){setState('MEMBERSHIP_REQUIRED');return;}

    const membershipResult=await client.from('memberships').select('id').eq('person_id',identity.person_id).eq('is_current',true).maybeSingle();
    if(membershipResult.error){setError('Não foi possível verificar seu vínculo atual.');setState('ERROR');return;}
    setState(resolveAuthGateState({
      authenticated:true,
      mustChangePassword:!!identity.must_change_password,
      hasMembership:!!membershipResult.data
    }));
  }

  useEffect(()=>{void refresh();},[]);

  if(state==='BACKEND_UNCONFIGURED')return <AuthStatus title="Multiusuário em preparação" text="O ambiente seguro ainda não foi conectado. O piloto atual continua separado até a configuração do backend ser concluída."/>;
  if(state==='LOADING')return <AuthStatus title="Carregando sua rede" text="Verificando identidade e permissões."/>;
  if(state==='ERROR')return <AuthStatus title="Não foi possível abrir sua rede" text={error||'Tente novamente em instantes.'} action={<button className="action" onClick={()=>void refresh()}>Tentar novamente</button>}/>;
  if(state==='SIGNED_OUT'&&client)return <LoginPanel client={client} onSignedIn={refresh}/>;
  if(state==='PASSWORD_CHANGE_REQUIRED'&&client)return <FirstAccessPassword client={client} onComplete={refresh}/>;
  if(state==='MEMBERSHIP_REQUIRED'&&client)return <AuthStatus title="Acesso aguardando configuração" text="Seu login existe, mas o vínculo na rede ainda precisa ser liberado." action={<button className="action" onClick={async()=>{await client.auth.signOut();setState('SIGNED_OUT')}}>Sair</button>}/>;
  return <>{children}</>;
}

function LoginPanel({client,onSignedIn}:{client:SupabaseClient;onSignedIn:()=>Promise<void>}){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);

  async function submit(event:React.FormEvent){
    event.preventDefault();setBusy(true);setError('');
    const result=await client.auth.signInWithPassword({email:email.trim(),password});
    if(result.error){setError('E-mail ou senha não conferem.');setBusy(false);return;}
    setPassword('');setBusy(false);await onSignedIn();
  }

  async function recover(){
    const clean=email.trim();
    if(!clean){setError('Informe seu e-mail para recuperar a senha.');return;}
    setBusy(true);setError('');
    const redirectTo=typeof window==='undefined'?undefined:`${window.location.origin}/`;
    const result=await client.auth.resetPasswordForEmail(clean,{redirectTo});
    setBusy(false);
    setError(result.error?'Não foi possível enviar a recuperação agora.':'Se o e-mail estiver ativo, você receberá as instruções de recuperação.');
  }

  return <main className="auth-shell"><section className="auth-card">
    <div className="auth-mark">V</div>
    <div className="eyebrow">VoeTupper</div>
    <h1>Entrar na sua rede</h1>
    <p>Use o e-mail vinculado ao seu perfil.</p>
    <form onSubmit={submit}>
      <div className="field"><label>E-mail</label><input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
      <div className="field"><label>Senha</label><input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
      {error&&<div className="auth-error" role="status">{error}</div>}
      <button className="primary" disabled={busy}>{busy?'Entrando...':'Entrar'}</button>
      <button type="button" className="auth-link" disabled={busy} onClick={()=>void recover()}>Esqueci minha senha</button>
    </form>
  </section></main>;
}

function AuthStatus({title,text,action}:{title:string;text:string;action?:React.ReactNode}){
  return <main className="auth-shell"><section className="auth-card"><div className="auth-mark">V</div><div className="eyebrow">VoeTupper</div><h1>{title}</h1><p>{text}</p>{action}</section></main>;
}
