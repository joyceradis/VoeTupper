import React from 'react';
import type { V3Snapshot } from '../domain/model';
import { TeamImport } from './TeamImport';
import { V3Icon } from './ui';

const roleLabels = { DISTRIBUTION: 'Distribuição', BUSINESS_OWNER: 'Empresária', LEADER: 'Líder', CONSULTANT: 'Consultora' } as const;

export function ProfileView({ snapshot }: { snapshot: V3Snapshot }) {
  const district = snapshot.districts.find(item => item.id === snapshot.viewer.districtId);
  const group = snapshot.groups.find(item => item.id === snapshot.viewer.groupId);
  return <section className="v3-profile">
    <header className="v3-page-heading"><div><p className="v3-eyebrow">SEU ESPAÇO</p><h1>Perfil</h1><p>Seus dados, sua posição na rede e seus acessos.</p></div></header>
    <article className="v3-profile-hero">
      <span>{snapshot.viewer.displayName.split(/\s+/).slice(0, 2).map(item => item[0]).join('')}</span>
      <div><small>{roleLabels[snapshot.viewer.role]}</small><h2>{snapshot.viewer.displayName}</h2><p>{district ? `Distrito ${district.name}` : 'Rede Espírito Santo'}{group ? ` · ${group.name}` : ''}</p></div>
      <button type="button" disabled>Cadastro em preparação</button>
    </article>
    <div className="v3-profile-grid">
      <article className="v3-details-card"><p className="v3-eyebrow">CADASTRO</p><h2>Dados do VoeTupper</h2><dl><div><dt>Nome</dt><dd>{snapshot.viewer.displayName}</dd></div><div><dt>Função</dt><dd>{roleLabels[snapshot.viewer.role]}</dd></div><div><dt>Código Tupperware</dt><dd>{snapshot.viewer.businessCode ?? 'Não informado'}</dd></div><div><dt>Celular</dt><dd>{snapshot.viewer.phone ?? 'Não informado'}</dd></div><div><dt>Grupo</dt><dd>{group?.name ?? 'Não se aplica'}</dd></div></dl></article>
      <article className="v3-vault-card"><span className="v3-vault-icon"><V3Icon name="lock" /></span><div><p className="v3-eyebrow">EM PREPARAÇÃO</p><h2>Acesso do TupperNet</h2><p>O cadastro e a cópia de senhas ainda não estão disponíveis. Esta demonstração não recebe nem guarda senhas do portal.</p><strong>Use seu acesso diretamente no Tupper.NET.</strong></div><a className="v3-vault-link" href="https://pedidos.tupperware.com.br/grandevitoria/Default.aspx" target="_blank" rel="noopener noreferrer">Abrir Tupper.NET ↗</a></article>
    </div>
    {(snapshot.viewer.role === 'BUSINESS_OWNER' || snapshot.viewer.role === 'DISTRIBUTION') ? <TeamImport groups={snapshot.groups.map(item => item.name)} /> : null}
  </section>;
}
