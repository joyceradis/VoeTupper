const VT8_ES_NETWORK={
  root:'Espírito Santo',
  distribution:{name:'Gerusa',role:'Distribuição ES'},
  businesses:[
    {id:'norte',name:'Giseli Aguilar',district:'Norte',region:'Norte do estado'},
    {id:'noroeste',name:'Adriana Junta',district:'Noroeste',region:'Noroeste'},
    {id:'serra',name:'Ritheli Radis',district:'Plenitude',region:'Serra',current:true},
    {id:'vitoria',name:'Tatiana Madeira',district:'Vitória',region:'Vitória'},
    {id:'vilavelha-sul',name:'Adriana Maia',district:'Vila Velha e Sul',region:'Vila Velha e sul do estado'},
    {id:'cariacica',name:'Vanessa Luciana',district:'Cariacica',region:'Cariacica'}
  ]
};
const VT10_PILOT_CORRECTIONS={'114440':{name:'Adriana Vieira',status:'INATIVA'}};

function vt10ApplyPilotCorrections(){
  const adriana=state.consultants.find(c=>String(c.code||'')==='1144440'||/^adriana\s+v\.?$/i.test(String(c.name||'').trim()));
  if(adriana){adriana.name=VT10_PILOT_CORRECTIONS['114440'].name;adriana.code='114440';adriana.status='INATIVA';adriana.registrationStatus='INATIVA';}
  for(const c of state.consultants){
    if(c.role==='leader')continue;
    if(!c.leader)c.leader='Ritheli Radis';
    if(!c.group)c.group='Fenomenal';
  }
  save();
}
vt10ApplyPilotCorrections();

const vt8CurrentDistrict=VT8_ES_NETWORK.businesses.find(b=>b.current);
if(vt8CurrentDistrict){
  state.workspace={...state.workspace,district:'Plenitude',districtManager:'Ritheli Radis',distribution:'Espírito Santo',distributionManager:VT8_ES_NETWORK.distribution.name,businessArea:'Serra / Espírito Santo',name:'Ritheli Radis',region:'Distrito Plenitude · Serra / Espírito Santo'};
  save();
}

function vt10StatusClass(c){
  const status=String(c.status||c.registrationStatus||'').toUpperCase();
  if(status==='INATIVA'||status.includes('RECADASTRAR'))return'inactive';
  if(status.includes('CONFERIR')||status.includes('REVISAR')||String(c.dataStatus||'').toUpperCase().includes('CONFERIR'))return'review';
  return'active';
}
function vt10StatusLabel(c){const cls=vt10StatusClass(c);return cls==='inactive'?'INATIVA':cls==='review'?'DADOS A CONFERIR':'ATIVA'}
function vt10ConsultantClosing(c){return currentOrders().filter(o=>o.consultantId===c.id&&!o.cancelled).reduce((sum,o)=>sum+(Number(o.amount)||0),0)}
function vt10ConsultantCard(c){
  const statusClass=vt10StatusClass(c),statusLabel=vt10StatusLabel(c),closing=vt10ConsultantClosing(c);
  return `<article class="vt10-consultant-card" onclick="vt7OpenMemberProfile('${c.id}')"><div class="vt10-consultant-main"><div><strong>${esc(c.name)}</strong><span class="vt10-status ${statusClass}"><i></i>${statusLabel}</span></div><small>Código <b>${esc(c.code||'não informado')}</b></small><small class="vt10-password">Senha do portal ${vt6Secret(c)}</small></div><div class="vt10-closing"><span>Fechamento</span><strong>${fmtMoney(closing)}</strong></div></article>`;
}
function vt10FenomenalSummary(members){
  const active=members.filter(c=>vt10StatusClass(c)==='active').length,inactive=members.filter(c=>vt10StatusClass(c)==='inactive').length;
  return `<div class="vt10-group-summary"><div><span>Grupo</span><strong>Grupo Fenomenal</strong></div><div><b>${members.length}</b><small>vinculadas</small></div><div><b>${active}</b><small>ativas</small></div><div><b>${inactive}</b><small>${inactive===1?'inativa':'inativas'}</small></div></div>`;
}

function vt8StateNetwork(){return `<section class="vt8-state-network"><div class="vt8-state-head"><div><span>Rede Espírito Santo</span><strong>Distritos e Empresárias</strong></div><small>${esc(VT8_ES_NETWORK.distribution.name)} · ${esc(VT8_ES_NETWORK.distribution.role)}</small></div><div class="vt8-business-grid">${VT8_ES_NETWORK.businesses.map(b=>`<button class="vt8-business-card ${b.current?'current':''}" onclick="vt8OpenBusinessProfile('${b.id}')"><span class="avatar">${esc(vt7Initials(b.name))}</span><div><strong>${esc(b.name)}</strong><small>Empresária · Distrito ${esc(b.district)}${b.current?' · Serra':''}</small></div>${b.current?'<b>Você está aqui</b>':'<i>Ver perfil</i>'}</button>`).join('')}</div></section>`}

function vt8RitheliBranch(){
  const members=vt7Consultants();
  return `<details class="vt7-tree-leader vt10-fenomenal" open><summary><span>Líder</span><strong>Ritheli Radis</strong><b>${members.length}</b></summary>${vt10FenomenalSummary(members)}<div class="vt10-consultant-list">${members.map(vt10ConsultantCard).join('')}</div></details>`;
}

vt6Tree=function(){return `<div class="vt6-network vt7-tree vt8-state-tree"><div class="vt6-network-root"><span>${esc(VT8_ES_NETWORK.root)}</span><strong>${esc(VT8_ES_NETWORK.distribution.name)}</strong><small>${esc(VT8_ES_NETWORK.distribution.role)}</small></div><div class="vt8-business-tree">${VT8_ES_NETWORK.businesses.map(b=>b.current?`<details class="vt8-business-node current" open><summary><span>Distrito</span><strong>${esc(b.district)}</strong><small>${esc(b.name)} · Empresária</small><b>aberto</b></summary><div class="vt8-current-branch">${vt8RitheliBranch()}</div></details>`:`<button class="vt8-business-node" onclick="vt8OpenBusinessProfile('${b.id}')"><span>Distrito</span><strong>${esc(b.district)}</strong><small>${esc(b.name)} · Empresária</small><i>Ver perfil</i></button>`).join('')}</div></div>`}

window.vt8OpenBusinessProfile=function(id){const b=VT8_ES_NETWORK.businesses.find(x=>x.id===id);if(!b)return;modal=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><section class="modal vt7-member-profile"><div class="modal-head"><div class="vt7-member-title"><span class="avatar">${esc(vt7Initials(b.name))}</span><div><div class="eyebrow">PERFIL DA REDE</div><h2>${esc(b.name)}</h2><p>Empresária · Distrito ${esc(b.district)}</p></div></div><button class="icon-close" onclick="closeModal()">×</button></div><div class="vt7-profile-section"><h3>Rede</h3><p>${b.current?'Grupo Fenomenal e consultoras vinculadas ao Distrito Plenitude.':'O Distrito está identificado na rede estadual. Dados operacionais aparecem quando confirmados.'}</p></div><div class="modal-actions"><button class="btn primary" onclick="closeModal()">Fechar</button></div></section></div>`;render()}

networkView=function(){const n=vt6Counts();return `<section class="panel vt7-network-page"><div class="vt7-network-hero"><div><div class="eyebrow">REDE · ESPÍRITO SANTO</div><h2>Gente, metas e movimento</h2><p>Veja o que está acontecendo, acompanhe seu Distrito e navegue pela rede.</p></div><button class="btn" onclick="vt6ShowOnboarding()">Tutorial</button></div><div class="vt7-network-kpis"><div><strong>${VT8_ES_NETWORK.businesses.length}</strong><span>Distritos</span></div><div><strong>1</strong><span>Líder no Grupo Fenomenal</span></div><div><strong>${vt7ActiveConsultants().length}</strong><span>Consultoras ativas</span></div></div>${vt8StateNetwork()}${vt7NetworkTabs()}<div class="vt7-network-body">${vt7NetworkBody()}</div></section>`}

vt7NetworkSnapshot=function(){const members=vt7Consultants(),active=members.filter(c=>vt10StatusClass(c)==='active'),inactive=members.filter(c=>vt10StatusClass(c)==='inactive');return `<section class="panel vt7-home-network"><div class="panel-head"><div><h2>Sua rede</h2><small>Distrito Plenitude · Serra / Espírito Santo</small></div><button class="btn" onclick="go('network')">Abrir Rede</button></div><div class="vt7-network-stats"><div><strong>${members.length}</strong><span>Vinculadas</span></div><div><strong>${active.length}</strong><span>Consultoras ativas</span></div><div><strong>${inactive.length}</strong><span>Inativas</span></div></div><div class="vt7-owner-path"><span>Distribuição ES</span><b>${esc(VT8_ES_NETWORK.distribution.name)}</b><i>›</i><span>Distrito Plenitude</span><b>Ritheli Radis · Grupo Fenomenal</b></div></section>`}

profileView=function(){const achievements=vt7Achievements();return `<section class="panel vt7-profile-page"><div class="vt7-profile-hero"><span class="vt7-profile-avatar">${esc(vt7Initials(state.workspace.ownerName||VT6_OWNER_NAME))}</span><div><div class="eyebrow">MEU PERFIL</div><h2>Ritheli Radis</h2><p>Empresária · Distrito Plenitude · Serra · Espírito Santo</p></div></div><div class="vt7-profile-stats"><div><strong>1</strong><span>Grupo liderado</span></div><div><strong>${vt7ActiveConsultants().length}</strong><span>Consultoras ativas</span></div><div><strong>${currentOrders().length}</strong><span>Pedidos na semana</span></div></div><div class="vt7-profile-section"><div class="panel-head"><h3>Metas</h3></div><div class="vt7-goal-grid">${state.goals.map(vt7GoalCard).join('')}</div></div><div class="vt7-profile-section"><div class="panel-head"><h3>Conquistas</h3></div>${achievements.length?`<div class="vt7-badges">${achievements.map(x=>`<span>★ ${esc(x)}</span>`).join('')}</div>`:'<p class="vt7-muted">As conquistas aparecem conforme a rede registra resultados reais.</p>'}</div></section>`}

if(typeof isSignedIn==='function'&&isSignedIn())render();
