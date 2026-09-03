const VT8_ES_NETWORK={
  root:'Espírito Santo',
  distribution:{name:'Gerusa',role:'Distribuição ES'},
  businesses:[
    {id:'norte',name:'Giseli Aguilar',district:'Norte',region:'Norte do estado'},
    {id:'noroeste',name:'Adriana Junta',district:'Noroeste',region:'Noroeste'},
    {id:'serra',name:'Ritheli Radis',district:'Serra',region:'Serra',current:true},
    {id:'vitoria',name:'Tatiana Madeira',district:'Vitória',region:'Vitória'},
    {id:'vilavelha-sul',name:'Adriana Maia',district:'Vila Velha e Sul',region:'Vila Velha e sul do estado'},
    {id:'cariacica',name:'Vanessa Luciana',district:'Cariacica',region:'Cariacica'}
  ]
};

const vt8CurrentDistrict=VT8_ES_NETWORK.businesses.find(b=>b.current);
if(vt8CurrentDistrict){
  state.workspace={
    ...state.workspace,
    district:vt8CurrentDistrict.district,
    districtManager:vt8CurrentDistrict.name,
    distribution:'Espírito Santo',
    distributionManager:VT8_ES_NETWORK.distribution.name,
    businessArea:`${vt8CurrentDistrict.district} / Espírito Santo`,
    name:`Empresária ${vt8CurrentDistrict.district}`,
    region:`${vt8CurrentDistrict.district} / Espírito Santo`
  };
  save();
}

function vt8StateNetwork(){
  return `<section class="vt8-state-network"><div class="vt8-state-head"><div><span>Rede Espírito Santo</span><strong>Distritos e Empresárias</strong></div><small>${esc(VT8_ES_NETWORK.distribution.name)} · ${esc(VT8_ES_NETWORK.distribution.role)}</small></div><div class="vt8-business-grid">${VT8_ES_NETWORK.businesses.map(b=>`<button class="vt8-business-card ${b.current?'current':''}" onclick="vt8OpenBusinessProfile('${b.id}')"><span class="avatar">${esc(vt7Initials(b.name))}</span><div><strong>${esc(b.name)}</strong><small>Empresária · Distrito ${esc(b.district)}</small></div>${b.current?'<b>Você está aqui</b>':'<i>Ver perfil</i>'}</button>`).join('')}</div></section>`;
}

function vt8RitheliBranch(){
  const leaders=vt7Leaders();
  const consultants=vt7Consultants();
  const assigned=new Set();
  const leaderHtml=leaders.map(leader=>{
    const members=vt7LeaderMembers(leader);
    members.forEach(m=>assigned.add(m.id));
    return `<details class="vt7-tree-leader" open><summary onclick="event.stopPropagation();vt7OpenMemberProfile('${leader.id}')"><span>Líder</span><strong>${esc(leader.name)}</strong><b>${members.length}</b></summary>${members.length?`<div class="vt6-people">${members.map(p=>`<button onclick="vt7OpenMemberProfile('${p.id}')"><span>${esc(p.name)}</span><small>${esc(p.group||'Revendedora / Consultora')}</small></button>`).join('')}</div>`:`<div class="vt7-tree-note">Nenhuma revendedora vinculada a esta líder.</div>`}</details>`;
  }).join('');
  const unassigned=consultants.filter(c=>!assigned.has(c.id));
  return `${leaderHtml||'<div class="vt7-tree-note"><strong>Nenhuma líder identificada ainda.</strong><span>Abra uma ficha e marque o papel na rede como Líder.</span></div>'}${unassigned.length?`<details class="vt7-tree-unassigned"><summary><span>Sem líder confirmada</span><strong>Revendedoras / Consultoras</strong><b>${unassigned.length}</b></summary><div class="vt6-people">${unassigned.map(p=>`<button onclick="vt7OpenMemberProfile('${p.id}')"><span>${esc(p.name)}</span><small>${esc(p.group||'Vínculo a definir')}</small></button>`).join('')}</div></details>`:''}`;
}

vt6Tree=function(){
  return `<div class="vt6-network vt7-tree vt8-state-tree"><div class="vt6-network-root"><span>${esc(VT8_ES_NETWORK.root)}</span><strong>${esc(VT8_ES_NETWORK.distribution.name)}</strong><small>${esc(VT8_ES_NETWORK.distribution.role)}</small></div><div class="vt8-business-tree">${VT8_ES_NETWORK.businesses.map(b=>b.current?`<details class="vt8-business-node current" open><summary><span>Distrito</span><strong>${esc(b.district)}</strong><small>${esc(b.name)} · Empresária</small><b>aberto</b></summary><div class="vt8-current-branch">${vt8RitheliBranch()}</div></details>`:`<button class="vt8-business-node" onclick="vt8OpenBusinessProfile('${b.id}')"><span>Distrito</span><strong>${esc(b.district)}</strong><small>${esc(b.name)} · Empresária</small><i>Ver perfil</i></button>`).join('')}</div></div>`;
};

window.vt8OpenBusinessProfile=function(id){
  const b=VT8_ES_NETWORK.businesses.find(x=>x.id===id);if(!b)return;
  const isCurrent=!!b.current;
  modal=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><section class="modal vt7-member-profile"><div class="modal-head"><div class="vt7-member-title"><span class="avatar">${esc(vt7Initials(b.name))}</span><div><div class="eyebrow">PERFIL DA REDE</div><h2>${esc(b.name)}</h2><p>Empresária · Distrito ${esc(b.district)}</p></div></div><button class="icon-close" onclick="closeModal()">×</button></div><div class="vt7-profile-section"><h3>Rede</h3><p>${isCurrent?'Este é o Distrito Serra. Líderes e revendedoras aparecem conforme os vínculos forem confirmados.':'O Distrito está identificado na rede estadual. Líderes, revendedoras e indicadores só serão exibidos quando houver dados confirmados.'}</p></div><div class="modal-actions">${isCurrent?'<button class="btn" onclick="closeModal();go(\'profile\')">Abrir meu perfil</button>':''}<button class="btn primary" onclick="closeModal()">Fechar</button></div></section></div>`;
  render();
};

networkView=function(){
  const n=vt6Counts();
  return `<section class="panel vt7-network-page"><div class="vt7-network-hero"><div><div class="eyebrow">REDE · ESPÍRITO SANTO</div><h2>Gente, metas e movimento</h2><p>Veja o que está acontecendo, acompanhe seu Distrito e navegue pela rede.</p></div><button class="btn" onclick="vt6ShowOnboarding()">Tutorial</button></div><div class="vt7-network-kpis"><div><strong>${VT8_ES_NETWORK.businesses.length}</strong><span>Distritos</span></div><div><strong>${vt7Leaders().length}</strong><span>Líderes na Serra</span></div><div><strong>${n.active}</strong><span>Pessoas ativas na Serra</span></div></div>${vt8StateNetwork()}${vt7NetworkTabs()}<div class="vt7-network-body">${vt7NetworkBody()}</div></section>`;
};

vt7NetworkSnapshot=function(){
  const leaders=vt7Leaders(),active=vt7ActiveConsultants(),recruitment=vt7Goal('recruitment');
  return `<section class="panel vt7-home-network"><div class="panel-head"><div><h2>Sua rede</h2><small>Distrito Serra · Espírito Santo</small></div><button class="btn" onclick="go('network')">Abrir Rede</button></div><div class="vt7-network-stats"><div><strong>${leaders.length}</strong><span>Líderes</span></div><div><strong>${active.length}</strong><span>Consultoras ativas</span></div><div><strong>${vt7GoalCurrent(recruitment)}</strong><span>Novas no ciclo</span></div></div><div class="vt7-owner-path"><span>Distribuição ES</span><b>${esc(VT8_ES_NETWORK.distribution.name)}</b><i>›</i><span>Distrito Serra</span><b>Ritheli Radis</b></div></section>`;
};

profileView=function(){
  const achievements=vt7Achievements();
  return `<section class="panel vt7-profile-page"><div class="vt7-profile-hero"><span class="vt7-profile-avatar">${esc(vt7Initials(state.workspace.ownerName||VT6_OWNER_NAME))}</span><div><div class="eyebrow">MEU PERFIL</div><h2>${esc(state.workspace.ownerName||VT6_OWNER_NAME)}</h2><p>Empresária · Distrito Serra · Espírito Santo</p></div></div><div class="vt7-profile-stats"><div><strong>${vt7Leaders().length}</strong><span>Líderes</span></div><div><strong>${vt7ActiveConsultants().length}</strong><span>Consultoras ativas</span></div><div><strong>${currentOrders().length}</strong><span>Pedidos na semana</span></div></div><div class="vt7-profile-section"><div class="panel-head"><h3>Metas</h3></div><div class="vt7-goal-grid">${state.goals.map(vt7GoalCard).join('')}</div></div><div class="vt7-profile-section"><div class="panel-head"><h3>Conquistas</h3></div>${achievements.length?`<div class="vt7-badges">${achievements.map(x=>`<span>★ ${esc(x)}</span>`).join('')}</div>`:'<p class="vt7-muted">As conquistas aparecem conforme a rede registra resultados reais.</p>'}</div><div class="vt7-profile-section"><div class="panel-head"><h3>Minha rede estadual</h3></div><p class="vt7-muted">${esc(VT8_ES_NETWORK.distribution.role)} · ${esc(VT8_ES_NETWORK.distribution.name)} · ${VT8_ES_NETWORK.businesses.length} Distritos.</p></div><div class="vt7-profile-section"><div class="panel-head"><h3>Acesso externo</h3><button class="btn" onclick="vt7EditExternal()">Alterar site</button></div><p class="vt7-muted">O botão Abrir Tupperware usa um endereço configurável. Assim o VoeTupper continua funcionando mesmo quando o site externo mudar.</p></div></section>`;
};

if(typeof isSignedIn==='function'&&isSignedIn())render();
