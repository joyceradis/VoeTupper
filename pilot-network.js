const VT10_PILOT={
  name:'Ritheli Radis',
  district:'Plenitude',
  districtLabel:'Distrito Plenitude',
  region:'Serra / Espírito Santo',
  group:'Fenomenal',
  leader:'Ritheli Radis'
};

function vt10ApplyPilotNetwork(){
  state.workspace={
    ...state.workspace,
    district:VT10_PILOT.district,
    districtManager:VT10_PILOT.name,
    businessArea:VT10_PILOT.region,
    ownerName:VT10_PILOT.name,
    name:VT10_PILOT.name,
    region:`${VT10_PILOT.districtLabel} · ${VT10_PILOT.region}`
  };

  state.consultants=state.consultants.map(c=>({
    ...c,
    leader:c.leader||VT10_PILOT.leader,
    group:c.group||VT10_PILOT.group,
    district:c.district||VT10_PILOT.district,
    businessArea:c.businessArea||VT10_PILOT.region
  }));
  save();
}

function vt10PilotLeader(){
  return {id:'pilot-ritheli-leader',name:VT10_PILOT.leader,role:'leader',group:VT10_PILOT.group,status:'ATIVA'};
}

vt10ApplyPilotNetwork();

vt7Leaders=function(){return [vt10PilotLeader()]};
vt7LeaderMembers=function(leader){
  if(String(leader?.name||'').trim().toLowerCase()!==VT10_PILOT.leader.toLowerCase())return [];
  return state.consultants.map(vt6Normalize).filter(c=>c.role!=='leader');
};

vt7NetworkSnapshot=function(){
  const active=vt7ActiveConsultants(),recruitment=vt7Goal('recruitment');
  return `<section class="panel vt7-home-network"><div class="panel-head"><div><h2>Sua rede</h2><small>${VT10_PILOT.districtLabel} · ${VT10_PILOT.region}</small></div><button class="btn" onclick="go('network')">Abrir Rede</button></div><div class="vt7-network-stats"><div><strong>1</strong><span>Líder</span></div><div><strong>${active.length}</strong><span>Consultoras ativas</span></div><div><strong>${vt7GoalCurrent(recruitment)}</strong><span>Novas no ciclo</span></div></div><div class="vt7-owner-path"><span>Distribuição ES</span><b>Gerusa</b><i>›</i><span>${VT10_PILOT.districtLabel}</span><b>${VT10_PILOT.name}</b><i>›</i><span>Grupo</span><b>${VT10_PILOT.group}</b></div></section>`;
};

vt6Tree=function(){
  const consultants=vt7Consultants();
  return `<div class="vt6-network vt7-tree vt8-state-tree"><div class="vt6-network-root"><span>Espírito Santo</span><strong>Gerusa</strong><small>Distribuição ES</small></div><div class="vt8-business-tree"><details class="vt8-business-node current" open><summary><span>Distrito</span><strong>${VT10_PILOT.district}</strong><small>${VT10_PILOT.name} · Empresária</small><b>aberto</b></summary><div class="vt8-current-branch"><details class="vt7-tree-leader" open><summary><span>Líder</span><strong>${VT10_PILOT.leader}</strong><b>${consultants.length}</b></summary><div class="vt7-tree-note"><strong>Grupo Fenomenal</strong><span>${consultants.length} consultoras vinculadas</span></div><div class="vt6-people">${consultants.map(p=>`<button onclick="vt7OpenMemberProfile('${p.id}')"><span>${esc(p.name)}</span><small>${esc(p.group||VT10_PILOT.group)}</small></button>`).join('')}</div></details></div></details></div></div>`;
};

if(typeof profileView==='function'){
  const vt10BaseProfileView=profileView;
  profileView=function(){
    const html=vt10BaseProfileView();
    return html.replace(/Empresária · Distrito Serra · Espírito Santo/g,`Empresária · ${VT10_PILOT.districtLabel} · ${VT10_PILOT.region}`);
  };
}

if(typeof render==='function')render();
