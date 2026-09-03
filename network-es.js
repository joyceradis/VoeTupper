const VT8_ES_NETWORK={
  root:'Espírito Santo',
  district:{name:'Gerusa',role:'Distrito'},
  businesses:[
    {id:'norte',name:'Giseli Aguilar',region:'Norte do estado'},
    {id:'noroeste',name:'Adriana Junta',region:'Noroeste'},
    {id:'serra',name:'Ritheli Radis',region:'Serra',current:true},
    {id:'vitoria',name:'Tatiana Madeira',region:'Vitória'},
    {id:'vilavelha-sul',name:'Adriana Maia',region:'Vila Velha e Sul do estado'}
  ]
};

function vt8StateNetwork(){
  return `<section class="vt8-state-network"><div class="vt8-state-head"><div><span>Rede Espírito Santo</span><strong>Empresárias por região</strong></div><small>Gerusa · Distrito</small></div><div class="vt8-business-grid">${VT8_ES_NETWORK.businesses.map(b=>`<button class="vt8-business-card ${b.current?'current':''}" onclick="vt8OpenBusinessProfile('${b.id}')"><span class="avatar">${esc(vt7Initials(b.name))}</span><div><strong>${esc(b.name)}</strong><small>Empresária · ${esc(b.region)}</small></div>${b.current?'<b>Você está aqui</b>':'<i>Ver perfil</i>'}</button>`).join('')}</div></section>`;
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
  return `<div class="vt6-network vt7-tree vt8-state-tree"><div class="vt6-network-root"><span>${esc(VT8_ES_NETWORK.root)}</span><strong>${esc(VT8_ES_NETWORK.district.name)}</strong><small>${esc(VT8_ES_NETWORK.district.role)}</small></div><div class="vt8-business-tree">${VT8_ES_NETWORK.businesses.map(b=>b.current?`<details class="vt8-business-node current" open><summary><span>Empresária</span><strong>${esc(b.name)}</strong><small>${esc(b.region)}</small><b>aberta</b></summary><div class="vt8-current-branch">${vt8RitheliBranch()}</div></details>`:`<button class="vt8-business-node" onclick="vt8OpenBusinessProfile('${b.id}')"><span>Empresária</span><strong>${esc(b.name)}</strong><small>${esc(b.region)}</small><i>Ver perfil</i></button>`).join('')}</div></div>`;
};

window.vt8OpenBusinessProfile=function(id){
  const b=VT8_ES_NETWORK.businesses.find(x=>x.id===id);if(!b)return;
  const isCurrent=!!b.current;
  modal=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><section class="modal vt7-member-profile"><div class="modal-head"><div class="vt7-member-title"><span class="avatar">${esc(vt7Initials(b.name))}</span><div><div class="eyebrow">PERFIL DA REDE</div><h2>${esc(b.name)}</h2><p>Empresária · ${esc(b.region)}</p></div></div><button class="icon-close" onclick="closeModal()">×</button></div><div class="vt7-profile-section"><h3>Rede</h3><p>${isCurrent?'Esta é a operação Serra. Líderes e revendedoras aparecem conforme os vínculos forem confirmados.':'A região está identificada na rede estadual. Líderes, revendedoras e indicadores só serão exibidos quando houver dados confirmados.'}</p></div><div class="modal-actions">${isCurrent?'<button class="btn" onclick="closeModal();go(\'profile\')">Abrir meu perfil</button>':''}<button class="btn primary" onclick="closeModal()">Fechar</button></div></section></div>`;
  render();
};

networkView=function(){
  const n=vt6Counts();
  return `<section class="panel vt7-network-page"><div class="vt7-network-hero"><div><div class="eyebrow">REDE · ESPÍRITO SANTO</div><h2>Gente, metas e movimento</h2><p>Veja o que está acontecendo, acompanhe sua região e navegue pela rede.</p></div><button class="btn" onclick="vt6ShowOnboarding()">Tutorial</button></div><div class="vt7-network-kpis"><div><strong>${VT8_ES_NETWORK.businesses.length}</strong><span>Empresárias mapeadas</span></div><div><strong>${vt7Leaders().length}</strong><span>Líderes na Serra</span></div><div><strong>${n.active}</strong><span>Pessoas ativas na Serra</span></div></div>${vt8StateNetwork()}${vt7NetworkTabs()}<div class="vt7-network-body">${vt7NetworkBody()}</div></section>`;
};

vt7NetworkSnapshot=function(){
  const leaders=vt7Leaders(),active=vt7ActiveConsultants(),recruitment=vt7Goal('recruitment');
  return `<section class="panel vt7-home-network"><div class="panel-head"><div><h2>Sua rede</h2><small>Serra, Espírito Santo</small></div><button class="btn" onclick="go('network')">Abrir Rede</button></div><div class="vt7-network-stats"><div><strong>${leaders.length}</strong><span>Líderes</span></div><div><strong>${active.length}</strong><span>Consultoras ativas</span></div><div><strong>${vt7GoalCurrent(recruitment)}</strong><span>Novas no ciclo</span></div></div><div class="vt7-owner-path"><span>Espírito Santo</span><b>Gerusa · Distrito</b><i>›</i><span>Serra</span><b>Ritheli Radis</b></div></section>`;
};

if(typeof isSignedIn==='function'&&isSignedIn())render();
