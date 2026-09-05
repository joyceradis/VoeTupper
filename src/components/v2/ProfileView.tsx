import React, { useState, type FormEvent } from 'react';
import type { Goal, V2State } from '../../lib/v2/model';
import type { V2Action } from '../../lib/v2/reducer';
import { selectToday } from '../../lib/v2/selectors';
import { parseBRL, validateHttpsUrl } from '../../lib/v2/validation';
import { Icon, Initials, ProgressBar } from './ui';

type ProfileViewProps = {
  state: V2State;
  dispatch: (action: V2Action) => void;
  onSignOut: () => void;
  demo?: boolean;
};

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

function GoalEditor({ goal, current, dispatch }: { goal: Goal; current: number; dispatch: (action: V2Action) => void }) {
  const isMoney = goal.unit === 'BRL';
  const [target, setTarget] = useState(isMoney ? decimal.format(goal.target) : String(goal.target));
  const [progress, setProgress] = useState(String(current));
  const [message, setMessage] = useState('');
  const percent = goal.target > 0 ? Math.min(100, Math.round((current / goal.target) * 100)) : 0;

  function parseValue(raw: string) {
    if (isMoney) return parseBRL(raw);
    const clean = raw.trim();
    if (!/^\d+$/.test(clean)) return null;
    return Number(clean);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedTarget = parseValue(target);
    const parsedCurrent = isMoney ? goal.current : parseValue(progress);
    if (parsedTarget === null || parsedTarget === undefined || parsedCurrent === null || parsedCurrent === undefined) {
      setMessage('Use somente valores iguais ou maiores que zero.');
      return;
    }
    dispatch({ type: 'goalUpdated', goalId: goal.id, target: parsedTarget, current: parsedCurrent, at: new Date().toISOString() });
    setMessage('Meta atualizada neste aparelho.');
  }

  const title = goal.type === 'SALES' ? 'Meta de vendas' : goal.type === 'RECRUITMENT' ? 'Meta de recrutamento' : goal.label;
  return (
    <article className="v2-profile-goal-card">
      <div className="v2-profile-goal-head"><span><Icon name={isMoney ? 'trend' : 'users'} /></span><div><h3>{title}</h3><p>{isMoney ? `${money.format(current)} de ${money.format(goal.target)}` : `${current} de ${goal.target} pessoas`}</p></div><strong>{percent}%</strong></div>
      <ProgressBar value={percent} label={`Progresso da ${title.toLocaleLowerCase('pt-BR')}`} />
      <form onSubmit={submit}>
        <div className="v2-field"><label htmlFor={`goal-${goal.id}-target`}>{isMoney ? 'Objetivo em R$' : 'Objetivo em pessoas'}</label><input id={`goal-${goal.id}-target`} inputMode={isMoney ? 'decimal' : 'numeric'} value={target} onChange={event => { setTarget(event.target.value); setMessage(''); }} /></div>
        {!isMoney ? <div className="v2-field"><label htmlFor={`goal-${goal.id}-current`}>Já alcançado</label><input id={`goal-${goal.id}-current`} inputMode="numeric" value={progress} onChange={event => { setProgress(event.target.value); setMessage(''); }} /></div> : <p className="v2-derived-note">O realizado vem dos pedidos registrados.</p>}
        {message ? <p className={message.startsWith('Meta') ? 'v2-form-success' : 'v2-field-error'} aria-live="polite">{message}</p> : null}
        <button className="v2-secondary-button" type="submit">Salvar meta</button>
      </form>
    </article>
  );
}

export function ProfileView({ state, dispatch, onSignOut, demo = false }: ProfileViewProps) {
  const owner = state.people.find(person => person.id === state.workspace.ownerPersonId);
  const today = selectToday(state);
  const [externalUrl, setExternalUrl] = useState(state.workspace.externalUrl);
  const [externalMessage, setExternalMessage] = useState('');
  const externalValid = validateHttpsUrl(externalUrl);

  function saveExternal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!externalValid) { setExternalMessage('Use um endereço completo começando com https://'); return; }
    dispatch({ type: 'externalUrlUpdated', url: externalUrl, at: new Date().toISOString() });
    setExternalMessage('Endereço salvo neste aparelho.');
  }

  return (
    <div className="v2-page v2-profile-page">
      <header className="v2-page-heading"><div><p className="v2-eyebrow">Seu espaço</p><h1>Perfil</h1><p>Identidade, metas e preferências do piloto.</p></div></header>

      <section className="v2-owner-card" aria-label="Perfil de Ritheli">
        <div className="v2-owner-main"><Initials name={owner?.name ?? 'Ritheli Radis'} /><div><p className="v2-eyebrow">Empresária</p><h2>{owner?.name ?? 'Ritheli Radis'}</h2><span>Distrito {state.workspace.districtName}</span></div></div>
        <div className="v2-owner-path"><div><small>Distribuição</small><strong>{state.workspace.distributionName}</strong></div><Icon name="chevron" /><div><small>Responsável</small><strong>{state.workspace.distributionManagerName}</strong></div></div>
      </section>

      <section className="v2-section" aria-labelledby="profile-goals-title">
        <div className="v2-section-heading"><div><p className="v2-eyebrow">Direção do ciclo</p><h2 id="profile-goals-title">Suas metas</h2></div></div>
        <div className="v2-profile-goals">{state.goals.map(goal => <GoalEditor key={goal.id} goal={goal} current={today.goals.find(item => item.id === goal.id)?.current ?? goal.current} dispatch={dispatch} />)}</div>
      </section>

      <section className="v2-section" aria-labelledby="external-access-title">
        <div className="v2-section-heading"><div><p className="v2-eyebrow">Atalho</p><h2 id="external-access-title">Portal de pedidos</h2></div></div>
        <div className="v2-settings-card">
          <div className="v2-settings-copy"><span><Icon name="orders" /></span><p><strong>Acesso externo</strong><small>Guarde apenas o endereço. Senhas externas nunca são salvas aqui.</small></p></div>
          <form className="v2-external-form" onSubmit={saveExternal} noValidate>
            <div className="v2-field"><label htmlFor="external-portal-url">Endereço do portal de pedidos</label><input id="external-portal-url" type="url" inputMode="url" value={externalUrl} onChange={event => { setExternalUrl(event.target.value); setExternalMessage(''); }} aria-invalid={!externalValid} aria-describedby={!externalValid ? 'external-url-error' : undefined} /></div>
            {!externalValid ? <p className="v2-field-error" id="external-url-error">Use um endereço completo começando com https://</p> : null}
            {externalMessage ? <p className={externalMessage.startsWith('Endereço salvo') ? 'v2-form-success' : 'v2-field-error'} aria-live="polite">{externalMessage}</p> : null}
            <div className="v2-settings-actions"><button className="v2-secondary-button" type="submit">Salvar endereço</button>{externalValid ? <a className="v2-primary-button" href={externalUrl} target="_blank" rel="noreferrer noopener">Abrir portal <Icon name="arrow" /></a> : null}</div>
          </form>
        </div>
      </section>

      <section className="v2-section v2-session-card" aria-labelledby="session-title"><div><p className="v2-eyebrow">Neste navegador</p><h2 id="session-title">{demo ? 'Demonstração ativa' : 'Acesso local ativo'}</h2><p>{demo ? 'Os dados de demonstração não criam uma senha.' : 'Sair encerra a sessão, mas mantém os dados e o acesso deste aparelho.'}</p></div><button className="v2-secondary-button" type="button" onClick={onSignOut}>{demo ? 'Sair da demonstração' : 'Sair'}</button></section>
    </div>
  );
}
