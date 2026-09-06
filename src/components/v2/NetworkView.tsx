import React, { useMemo, useState, type FormEvent } from 'react';
import type { Person, V2State } from '../../lib/v2/model';
import type { V2Action } from '../../lib/v2/reducer';
import { selectDirectory, selectLeaderRanking, selectNetworkTree, selectWall, type DirectoryEntry, type NetworkTreeNode, type RankingDimension } from '../../lib/v2/selectors';
import { Icon, IconButton, Initials } from './ui';

export type NetworkMode = 'wall' | 'ranking' | 'tree' | 'directory';

type NetworkViewProps = {
  state: V2State;
  mode: NetworkMode;
  onModeChange: (mode: NetworkMode) => void;
  dispatch: (action: V2Action) => void;
};

const roleLabels = {
  DISTRIBUTION: 'Distribuição',
  BUSINESS_OWNER: 'Empresária',
  LEADER: 'Líder',
  CONSULTANT: 'Consultora',
} as const;

const statusLabels = {
  ACTIVE: 'Ativa',
  NEW: 'Nova',
  PAUSED: 'Pausada',
  INACTIVE: 'Inativa',
  REVIEW: 'Vínculo a conferir',
} as const;

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const eventDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

function TreeBranch({ node, depth = 0 }: { node: NetworkTreeNode; depth?: number }) {
  if (node.type === 'PERSON') {
    return <div className="v2-tree-person"><span className="v2-tree-dot" /><Initials name={node.label} tone={depth} /><span><strong>{node.label}</strong>{node.meta ? <small>{node.meta}</small> : null}</span></div>;
  }

  return (
    <details className={`v2-tree-branch v2-tree-${node.type.toLowerCase()}`} open={depth < 2}>
      <summary>
        <span className="v2-tree-marker"><Icon name={node.type === 'DISTRIBUTION' ? 'sparkles' : node.type === 'DISTRICT' ? 'network' : 'users'} /></span>
        <span className="v2-tree-label"><strong>{node.label}</strong>{node.meta ? <small>{node.meta}</small> : null}</span>
        {node.count !== undefined ? <span className="v2-tree-count">{node.count} {node.count === 1 ? 'pessoa' : 'pessoas'}</span> : null}
        <Icon className="v2-tree-chevron" name="chevron" />
      </summary>
      <div className="v2-tree-children">{node.children.map(child => <TreeBranch node={child} depth={depth + 1} key={child.id} />)}</div>
    </details>
  );
}

function EmptyNetwork({ icon, title, text }: { icon: 'network' | 'trend' | 'users'; title: string; text: string }) {
  return <div className="v2-empty-state v2-network-empty-state"><span><Icon name={icon} /></span><h2>{title}</h2><p>{text}</p></div>;
}

function WallMode({ state }: { state: V2State }) {
  const entries = selectWall(state);
  if (entries.length === 0) return <EmptyNetwork icon="network" title="A rede está pronta para começar" text="Pedidos, novas pessoas e metas vão formar este mural." />;

  return (
    <div className="v2-wall-list">
      {entries.map((entry, index) => (
        <article className="v2-wall-card" key={entry.id}>
          <div className="v2-wall-avatar-wrap"><Initials name={entry.actorName} tone={index} /><span className="v2-wall-kind"><Icon name={entry.kind === 'ORDER_RECEIVED' ? 'orders' : entry.kind === 'PERSON_JOINED' || entry.kind === 'ROLE_CHANGED' ? 'users' : 'target'} /></span></div>
          <div className="v2-wall-content"><div><h2>{entry.title}</h2><time dateTime={entry.occurredAt}>{eventDate.format(new Date(entry.occurredAt))}</time></div><p>{entry.detail}</p><small>por {entry.actorName}</small></div>
        </article>
      ))}
    </div>
  );
}

function RankingMode({ state }: { state: V2State }) {
  const [dimension, setDimension] = useState<RankingDimension>('SALES');
  const ranking = selectLeaderRanking(state, dimension);
  return (
    <>
      <div className="v2-ranking-filter" role="group" aria-label="Critério do ranking">
        {([['SALES', 'Vendas'], ['RECRUITMENT', 'Novas'], ['ACTIVE', 'Ativas']] as const).map(([id, label]) => <button type="button" aria-pressed={dimension === id} onClick={() => setDimension(id)} key={id}>{label}</button>)}
      </div>
      <p className="v2-truth-note"><Icon name="sparkles" />Comparação entre líderes do mesmo nível, usando somente os dados registrados.</p>
      {ranking.length < 2 ? (
        <EmptyNetwork icon="trend" title="Ainda não há dados suficientes para comparar" text="O ranking aparece quando duas ou mais líderes têm dados no mesmo critério." />
      ) : (
        <div className="v2-ranking-list">
          {ranking.map((entry, index) => (
            <article className="v2-ranking-card" key={entry.person.id}>
              <span className={`v2-rank-position v2-rank-${entry.position}`}>{entry.position}º</span>
              <Initials name={entry.person.name} tone={index} />
              <div><h2>{entry.person.name}</h2><p>{entry.person.groupName ?? 'Grupo sem nome confirmado'}</p></div>
              <strong>{entry.unit === 'BRL' ? money.format(entry.value) : `${entry.value} ${entry.value === 1 ? 'pessoa' : 'pessoas'}`}</strong>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function TreeMode({ state }: { state: V2State }) {
  return <div className="v2-tree"><div className="v2-tree-intro"><Icon name="network" /><p><strong>Da distribuição até cada consultora</strong><span>Toque nos níveis para abrir ou recolher a estrutura.</span></p></div><TreeBranch node={selectNetworkTree(state)} /></div>;
}

function PersonProfile({ person, onClose }: { person: DirectoryEntry; onClose: () => void }) {
  return (
    <div className="v2-dialog-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="v2-dialog v2-person-dialog" role="dialog" aria-modal="true" aria-labelledby="person-profile-title">
        <header className="v2-dialog-header"><div><p className="v2-eyebrow">Perfil da rede</p><h2 id="person-profile-title">{person.name}</h2><p>Informações operacionais visíveis para a Empresária.</p></div><IconButton icon="close" label="Fechar perfil" onClick={onClose} /></header>
        <div className="v2-person-profile-hero"><Initials name={person.name} /><div><strong>{roleLabels[person.role]}</strong><span>{statusLabels[person.status]}</span></div></div>
        <dl className="v2-profile-facts">
          <div><dt>Código</dt><dd>{person.businessCode || 'Não informado'}</dd></div>
          <div><dt>Grupo</dt><dd>{person.groupName || 'Vínculo a conferir'}</dd></div>
          <div><dt>Situação</dt><dd>{statusLabels[person.status]}</dd></div>
        </dl>
      </section>
    </div>
  );
}

function DirectoryMode({ state }: { state: V2State }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<DirectoryEntry | null>(null);
  const people = selectDirectory(state, query);
  return (
    <>
      <div className="v2-search-box"><Icon name="users" /><label className="v2-visually-hidden" htmlFor="network-search">Buscar pessoa</label><input id="network-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por nome, grupo ou código" /></div>
      <p className="v2-result-count">{people.length} {people.length === 1 ? 'pessoa encontrada' : 'pessoas encontradas'}</p>
      {people.length > 0 ? (
        <div className="v2-directory-grid">
          {people.map((person, index) => (
            <article className="v2-person-card" key={person.id}>
              <Initials name={person.name} tone={index} />
              <div className="v2-person-card-copy"><h2>{person.name}</h2><p>{roleLabels[person.role]} · {statusLabels[person.status]}</p>{person.businessCode ? <small>Código {person.businessCode}</small> : <small>Código não informado</small>}</div>
              <button type="button" onClick={() => setSelected(person)}>Ver perfil <Icon name="chevron" /></button>
            </article>
          ))}
        </div>
      ) : <EmptyNetwork icon="users" title="Nenhuma pessoa encontrada" text="Tente buscar por outro nome, grupo ou código." />}
      {selected ? <PersonProfile person={selected} onClose={() => setSelected(null)} /> : null}
    </>
  );
}

function createPersonId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') return `person-${globalThis.crypto.randomUUID()}`;
  return `person-${Date.now().toString(36)}`;
}

function AddPersonDialog({ state, dispatch, onClose }: { state: V2State; dispatch: (action: V2Action) => void; onClose: () => void }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'CONSULTANT' | 'LEADER'>('CONSULTANT');
  const [businessCode, setBusinessCode] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [error, setError] = useState('');
  const leaders = state.people.filter(person => person.role === 'LEADER' && person.status === 'ACTIVE');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (cleanName.length < 2) { setError('Digite o nome da pessoa.'); return; }
    const leader = leaders.find(person => person.id === leaderId);
    const now = new Date().toISOString();
    const person: Person = {
      id: createPersonId(),
      name: cleanName,
      role,
      status: role === 'CONSULTANT' ? 'NEW' : 'ACTIVE',
      businessCode: businessCode.trim() || undefined,
      distributionId: state.workspace.distributionId,
      districtId: state.workspace.districtId,
      ...(role === 'CONSULTANT' && leader ? { leaderId: leader.id, groupId: leader.groupId, groupName: leader.groupName } : {}),
      ...(role === 'LEADER' ? { groupId: `group-${createPersonId()}`, groupName: `Grupo ${cleanName.split(' ')[0]}` } : {}),
    };
    dispatch({ type: 'personAdded', person, at: now });
    onClose();
  }

  return (
    <div className="v2-dialog-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="v2-dialog v2-add-person-dialog" role="dialog" aria-modal="true" aria-labelledby="add-person-title">
        <header className="v2-dialog-header"><div><p className="v2-eyebrow">Crescer a rede</p><h2 id="add-person-title">Adicionar pessoa</h2><p>Comece com os dados essenciais. O vínculo pode ser ajustado depois.</p></div><IconButton icon="close" label="Fechar cadastro de pessoa" onClick={onClose} /></header>
        <form className="v2-order-form" onSubmit={submit}>
          <div className="v2-field v2-field-wide"><label htmlFor="person-name">Nome</label><input id="person-name" value={name} onChange={event => { setName(event.target.value); setError(''); }} placeholder="Nome completo" aria-invalid={Boolean(error)} />{error ? <small className="v2-field-error">{error}</small> : null}</div>
          <div className="v2-field"><label htmlFor="person-role">Papel</label><select id="person-role" value={role} onChange={event => { setRole(event.target.value as 'CONSULTANT' | 'LEADER'); setLeaderId(''); }}><option value="CONSULTANT">Consultora</option><option value="LEADER">Líder</option></select></div>
          <div className="v2-field"><label htmlFor="person-code">Código <span>opcional</span></label><input id="person-code" inputMode="numeric" value={businessCode} onChange={event => setBusinessCode(event.target.value)} placeholder="Ex.: 1234" /></div>
          {role === 'CONSULTANT' ? <div className="v2-field v2-field-wide"><label htmlFor="person-leader">Líder ou grupo <span>opcional</span></label><select id="person-leader" value={leaderId} onChange={event => setLeaderId(event.target.value)}><option value="">Vínculo a conferir</option>{leaders.map(leader => <option value={leader.id} key={leader.id}>{leader.groupName ?? leader.name}</option>)}</select></div> : null}
          <div className="v2-dialog-actions"><button className="v2-secondary-button" type="button" onClick={onClose}>Cancelar</button><button className="v2-primary-button" type="submit"><Icon name="plus" />Adicionar</button></div>
        </form>
      </section>
    </div>
  );
}

export function NetworkView({ state, mode, onModeChange, dispatch }: NetworkViewProps) {
  const [adding, setAdding] = useState(false);
  const consultants = state.people.filter(person => person.role === 'CONSULTANT').length;
  const leaders = state.people.filter(person => person.role === 'LEADER').length;
  const modes = useMemo(() => ([['wall', 'Mural'], ['ranking', 'Ranking'], ['tree', 'Estrutura'], ['directory', 'Pessoas']] as const), []);

  return (
    <div className="v2-page v2-network-page">
      <header className="v2-page-heading v2-network-heading">
        <div><p className="v2-eyebrow">Comunidade Serra</p><h1>Rede</h1><p>{consultants} {consultants === 1 ? 'consultora' : 'consultoras'} e {leaders} {leaders === 1 ? 'líder' : 'líderes'} conectadas.</p></div>
        <button className="v2-primary-button" type="button" onClick={() => setAdding(true)}><Icon name="plus" />Adicionar pessoa</button>
      </header>
      <div className="v2-network-tabs" role="group" aria-label="Visualização da rede">{modes.map(([id, label]) => <button type="button" aria-pressed={mode === id} onClick={() => onModeChange(id)} key={id}>{label}</button>)}</div>
      <section className="v2-network-mode" aria-label={modes.find(([id]) => id === mode)?.[1]}>
        {mode === 'wall' ? <WallMode state={state} /> : mode === 'ranking' ? <RankingMode state={state} /> : mode === 'tree' ? <TreeMode state={state} /> : <DirectoryMode state={state} />}
      </section>
      {adding ? <AddPersonDialog state={state} dispatch={dispatch} onClose={() => setAdding(false)} /> : null}
    </div>
  );
}
