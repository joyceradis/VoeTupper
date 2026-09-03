const regionalAreas=[
  {id:'norte',owner:'Giseli Aguilar',area:'Norte do estado'},
  {id:'noroeste',owner:'Adriana Junta',area:'Noroeste'},
  {id:'serra',owner:'Ritheli Radis',fullOwner:'Ritheli Radis de Souza de Oliveira',area:'Serra',current:true},
  {id:'vitoria',owner:'Tatiana Madeira',area:'Vitória'},
  {id:'vila-velha-sul',owner:'Adriana Maia',area:'Vila Velha e sul do estado'}
];

state.social={
  ...(state.social||{}),
  upperNetworkName:'Espírito Santo',
  upperNetworkManager:'Gerusa',
  regionalAreas:Array.isArray(state.social?.regionalAreas)&&state.social.regionalAreas.length
    ? state.social.regionalAreas
    : regionalAreas
};
save();

function vt7RegionalAreas(){return state.social.regionalAreas||regionalAreas}
function vt7CurrentArea(){return vt7RegionalAreas().find(x=>x.current)||vt7RegionalAreas().find(x=>x.id==='serra')}
function vt7RegionalOwner(area){return area.fullOwner||area.owner}

window.vt7OpenRegionalProfile=function(id){
  const area=vt7RegionalAreas().find(x=>x.id===id);if(!area)return;
  const current=!!area.current;
  modal=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><section class="modal vt7-region-profile"><div class="modal-head"><div class="vt7-member-title"><span class="avatar">${esc(vt7Initials(area.owner))}</span><div><div class="eyebrow">PERFIL REGIONAL</div><h2>${esc(area.owner)}</h2><p>${esc(area.area)} · Espírito Santo</p></div></div><button class="icon-close" onclick="closeModal()">×</button></div>${current?`<div class="vt7-member-summary"><div><strong>${vt7Leaders().length}</strong><span>Líderes identificadas</span></div><div><strong>${vt7ActiveConsultants().length}</strong><span>Consultoras ativas</span></div></div><div class="vt7-profile-section"><h3>Sua área</h3><p>Esta é a área administrada neste piloto. A árvore interna mostra líderes e revendedoras vinculadas.</p></div>`:`<div class="vt7-profile-section"><h3>Visibilidade regional</h3><p>Este perfil mostra somente a responsável e a região. Dados internos, vendas, contatos e composição da equipe não são compartilhados nesta conta.</p></div>`}<div class="modal-actions">${current?`<button class="btn" onclick="closeModal();vt7SetNetworkMode('tree')">Abrir árvore da Serra</button>`:''}<button class="btn primary" onclick="closeModal()">Fechar</button></div></section></div>`;render();
};

function vt7RegionalDirectory(){
  return `<div class="vt7-region-list">${vt7RegionalAreas().map(area=>`<button class="vt7-region-card ${area.current?'current':''}" onclick="vt7OpenRegionalProfile('${area.id}')"><span class="avatar">${esc(vt7Initials(area.owner))}</span><div><strong>${esc(area.owner)}</strong><small>${esc(area.area)}</small></div>${area.current?'<b>Sua área</b>':'<b>Ver perfil</b>'}</button>`).join('')}</div>`;
}

const vt7BaseCommunityCards=vt7CommunityCards;
vt7CommunityCards=function(){
  return `${vt7BaseCommunityCards()}<div class="vt7-state-community"><div><span>Rede estadual</span><strong>Empresárias ES</strong><small>${vt7RegionalAreas().length} perfis regionais</small></div><button class="btn" onclick="vt7SetNetworkMode('tree')">Ver rede</button></div>`;
};

vt6Tree=function(){
  const leaders=vt7Leaders();
  const consultants=vt7Consultants();
  const assigned=new Set();
  const leaderHtml=leaders.map(leader=>{
    const members=vt7LeaderMembers(leader);members.forEach(m=>assigned.add(m.id));
    return `<details class="vt7-tree-leader" open><summary onclick="event.stopPropagation();vt7OpenMemberProfile('${leader.id}')"><span>Líder</span><strong>${esc(leader.name)}</strong><b>${members.length}</b></summary>${members.length?`<div class="vt6-people">${members.map(p=>`<button onclick="vt7OpenMemberProfile('${p.id}')"><span>${esc(p.name)}</span><small>${esc(p.group||'Revendedora / Consultora')}</small></button>`).join('')}</div>`:`<div class="vt7-tree-note">Nenhuma revendedora vinculada a esta líder.</div>`}</details>`;
  }).join('');
  const unassigned=consultants.filter(c=>!assigned.has(c.id));
  const current=vt7CurrentArea();
  const currentBranch=`<details class="vt7-region-branch current" open><summary onclick="event.stopPropagation();vt7OpenRegionalProfile('${current.id}')"><span>${esc(current.area)}</span><strong>${esc(current.owner)}</strong><b>Você</b></summary><div class="vt7-current-region"><div class="vt6-network-branch"><span>Empresária Serra</span><strong>${esc(vt7RegionalOwner(current))}</strong><small>Área Serra</small></div>${leaderHtml||'<div class="vt7-tree-note"><strong>Nenhuma líder identificada ainda.</strong><span>Abra uma ficha e marque o papel na rede como Líder.</span></div>'}${unassigned.length?`<details class="vt7-tree-unassigned"><summary><span>Sem líder confirmada</span><strong>Revendedoras / Consultoras</strong><b>${unassigned.length}</b></summary><div class="vt6-people">${unassigned.map(p=>`<button onclick="vt7OpenMemberProfile('${p.id}')"><span>${esc(p.name)}</span><small>${esc(p.group||'Vínculo a definir')}</small></button>`).join('')}</div></details>`:''}</div></details>`;
  const otherBranches=vt7RegionalAreas().filter(area=>!area.current).map(area=>`<button class="vt7-region-branch" onclick="vt7OpenRegionalProfile('${area.id}')"><span>${esc(area.area)}</span><strong>${esc(area.owner)}</strong><b>Perfil</b></button>`).join('');
  return `<div class="vt6-network vt7-tree vt7-state-tree"><div class="vt6-network-root"><span>Rede Espírito Santo</span><strong>Gerusa</strong></div><div class="vt7-state-intro"><strong>Empresárias e regiões</strong><span>Perfis do mesmo nível aparecem lado a lado. Só a Serra abre os dados internos nesta conta.</span></div>${currentBranch}${otherBranches}</div>`;
};

const vt7BaseNetworkView=networkView;
networkView=function(){
  const base=vt7BaseNetworkView();
  if(vt7NetworkMode!=='wall')return base;
  return base.replace('</section>',`<div class="vt7-regional-section"><div class="panel-head"><div><h3>Empresárias no Espírito Santo</h3><small>Perfis regionais da rede</small></div></div>${vt7RegionalDirectory()}</div></section>`);
};
