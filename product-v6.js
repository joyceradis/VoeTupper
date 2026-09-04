const VT6_ONBOARDING_KEY='voetupper-v6-onboarding-seen';
const VT6_DEFAULT_EXTERNAL_URL='https://portal.tupperware.com.br/pt-BR';
const VT6_REGISTRATION_URL='https://portal.tupperware.com.br/pt-BR';
const VT6_OWNER_NAME='Ritheli Radis de Souza de Oliveira';
const VT6_TREE_LABEL='Visão em árvore';
let vt6TeamMode='list';
let vt7NetworkMode='wall';

function vt6Normalize(c){
  return {
    ...c,
    phone:c.phone||'',
    cpf:c.cpf||'',
    birthDate:c.birthDate||'',
    email:c.email||'',
    portalPassword:c.portalPassword||'',
    district:c.district||'Grande Vitória',
    businessArea:c.businessArea||'Serra / Espírito Santo',
    leader:c.leader||'',
    group:c.group||'',
    role:c.role==='leader'?'leader':'consultant',
    registrationStatus:c.registrationStatus||((String(c.status||'').toUpperCase()==='INATIVA')?'H / RECADASTRAR':'ATIVA'),
    dataStatus:c.dataStatus||'',
    note:c.note||''
  };
}

state.workspace={
  district:'Grande Vitória',
  districtManager:'Gerusa',
  distribution:'Vitoriaware',
  businessArea:'Serra / Espírito Santo',
  ownerName:VT6_OWNER_NAME,
  ...state.workspace,
  name:'Empresária Serra',
  region:'Serra / Espírito Santo'
};
state.social={portalUrl:VT6_DEFAULT_EXTERNAL_URL,...(state.social||{})};
if(!Array.isArray(state.goals)){
  state.goals=[
    {id:'sales',type:'sales',label:'Vendas',target:Number(state.workspace.goal)||0,current:null,unit:'BRL'},
    {id:'recruitment',type:'recruitment',label:'Novas consultoras',target:45,current:0,unit:'people'}
  ];
}else{
  const sales=state.goals.find(g=>g.id==='sales');
  const recruitment=state.goals.find(g=>g.id==='recruitment');
  if(!sales)state.goals.unshift({id:'sales',type:'sales',label:'Vendas',target:Number(state.workspace.goal)||0,current:null,unit:'BRL'});
  if(!recruitment)state.goals.push({id:'recruitment',type:'recruitment',label:'Novas consultoras',target:45,current:0,unit:'people'});
}
state.consultants=state.consultants.map(vt6Normalize);
save();

hotfixMergeConsultants=function(incoming){
  let changed=0;
  for(const raw of incoming){
    const incomingC=vt6Normalize(raw);
    const idx=state.consultants.findIndex(c=>(incomingC.id&&c.id===incomingC.id)||(incomingC.code&&c.code===incomingC.code&&String(c.name||'').toLowerCase()===String(incomingC.name||'').toLowerCase()));
    if(idx<0){state.consultants.push(incomingC);changed++;continue}
    const current=vt6Normalize(state.consultants[idx]);
    const preserve=(key)=>current[key]||incomingC[key]||'';
    state.consultants[idx]={...incomingC,...current,
      portalPassword:incomingC.portalPassword||current.portalPassword||'',
      dataStatus:incomingC.dataStatus||current.dataStatus||'',
      note:incomingC.note||current.note||'',
      cpf:preserve('cpf'),birthDate:preserve('birthDate'),email:preserve('email'),phone:preserve('phone'),
      leader:preserve('leader'),group:preserve('group'),district:preserve('district'),businessArea:preserve('businessArea'),
      role:current.role||incomingC.role||'consultant'
    };
    changed++;
  }
  return changed;
};

function vt6Copy(value,label){
  if(!value){toast(`${label} não informado`);return}
  copyValue(value,label);
}
function vt6EscapeAttr(value=''){return esc(value).replace(/`/g,'&#96;')}
function vt6Secret(c){
  if(!c.portalPassword)return '<span class="vt6-empty">não cadastrada</span>';
  return `<span class="vt6-secret" id="secret-${c.id}">••••••••</span><button class="vt6-icon" title="Mostrar senha" onclick="event.stopPropagation();vt6ToggleSecret('${c.id}',this)">Mostrar</button><button class="vt6-icon" title="Copiar senha" onclick="event.stopPropagation();vt6Copy(state.consultants.find(x=>x.id==='${c.id}')?.portalPassword,'Senha')">Copiar senha</button>`;
}
window.vt6ToggleSecret=function(id,btn){
  const c=state.consultants.find(x=>x.id===id);const el=document.getElementById(`secret-${id}`);if(!c||!el)return;
  const hidden=el.textContent==='••••••••';el.textContent=hidden?(c.portalPassword||'Não informada'):'••••••••';btn.textContent=hidden?'Ocultar':'Mostrar';
};

function vt6RegistrationClass(c){const s=String(c.registrationStatus||'').toUpperCase();if(s.includes('H'))return'h';if(s.includes('REVISAR'))return'review';if(s.includes('NOVO'))return'new';return'active'}
function vt6NetworkText(c){return [c.group,c.leader].filter(Boolean).join(' · ')||'Grupo e líder não informados'}
function vt7RoleLabel(c){return c.role==='leader'?'Líder':'Revendedora / Consultora'}
function vt7Goal(id){return state.goals.find(g=>g.id===id)||null}
function vt7GoalCurrent(goal){if(!goal)return 0;if(goal.type==='sales')return stats().revenue;return Number(goal.current)||0}
function vt7GoalPct(goal){const target=Number(goal?.target)||0;if(!target)return 0;return Math.max(0,Math.min(100,Math.round(vt7GoalCurrent(goal)/target*100)))}
function vt7Leaders(){return state.consultants.map(vt6Normalize).filter(c=>c.role==='leader')}
function vt7Consultants(){return state.consultants.map(vt6Normalize).filter(c=>c.role!=='leader')}
function vt7ActiveConsultants(){return vt7Consultants().filter(c=>c.status!=='INATIVA')}
function vt7LeaderMembers(leader){const key=String(leader.name||'').trim().toLowerCase();return vt7Consultants().filter(c=>String(c.leader||'').trim().toLowerCase()===key)}
function vt7LeaderOrders(leader){const ids=new Set(vt7LeaderMembers(leader).map(c=>c.id));ids.add(leader.id);return currentOrders().filter(o=>ids.has(o.consultantId)&&!o.cancelled)}
function vt7LeaderMetrics(leader){const orders=vt7LeaderOrders(leader);return{orders:orders.length,revenue:orders.reduce((s,o)=>s+(Number(o.amount)||0),0),active:vt7LeaderMembers(leader).filter(c=>c.status!=='INATIVA').length}}
function vt7Initials(name){return initials(name||'?')}

function vt7Icon(name){
  const paths={
    today:'<path d="M3 11.5 12 4l9 7.5V21h-6v-6H9v6H3z"/>',
    network:'<circle cx="12" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M10 9.5 7.5 14M14 9.5l2.5 4.5"/>',
    orders:'<path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    profile:'<circle cx="12" cy="8" r="4"/><path d="M4.5 21c.7-4.3 3.2-6.5 7.5-6.5s6.8 2.2 7.5 6.5"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.today}</svg>`;
}

function vt7Nav(){
  return [['today','Hoje'],['network','Rede'],['orders','Pedidos'],['profile','Perfil']].map(([id,label])=>`<button class="${view===id?'active':''}" onclick="go('${id}')" aria-label="${label}">${vt7Icon(id)}<span>${label}</span></button>`).join('');
}
nav=vt7Nav;

shell=function(content){
  const c=activeCycle();
  return `<div class="app-shell vt7-shell"><aside class="sidebar"><div class="brand-row"><img src="./logo-512.png?v=10" alt="Voe Tupper"><div class="brand-name">VoeTupper<small>rede Serra</small></div></div><div class="workspace-badge"><strong>${esc(state.workspace.name)}</strong><span>${esc(state.workspace.region)}</span></div><nav class="nav">${vt7Nav()}</nav><div class="sidebar-foot"><button class="btn" onclick="signOut()">Sair</button></div></aside><main class="main"><header class="topbar vt7-topbar"><img class="mobile-brand-logo" src="./logo-192.png?v=10" alt=""><div class="cycle"><strong>${esc(state.workspace.name)}</strong><span class="cycle-chip" data-cycle="vitrine">Vitrine ${c.vitrine}</span><span class="cycle-chip" data-cycle="semana">Semana ${c.week}</span><span class="cycle-chip alert">${closingLabel(c)}</span></div><div class="top-actions"><button class="btn secondary-desktop" id="installBtn" onclick="installApp()">Instalar</button><button class="btn primary" onclick="openOrder()">+ Novo pedido</button></div></header><div class="content vt7-content">${content}</div></main><nav class="mobile-nav vt7-mobile-nav">${vt7Nav()}</nav>${modal||''}</div>`;
};

quickActions=function(){
  const s=stats();
  return `<div class="quick-actions vt7-quick-actions"><button class="quick" onclick="openOrder()"><div><strong>+ Novo pedido</strong><span>Registrar agora</span></div><b class="arrow">›</b></button><button class="quick" onclick="go('closing')"><div><strong>Fechamento</strong><span>${s.pending} pendência${s.pending===1?'':'s'}</span></div><b class="arrow">›</b></button><button class="quick" onclick="vt7OpenExternal()"><div><strong>Abrir Tupperware</strong><span>Acesso externo</span></div><b class="arrow">↗</b></button><button class="quick" onclick="go('network')"><div><strong>Rede</strong><span>Mural, ranking e árvore</span></div><b class="arrow">›</b></button></div>`;
};
window.vt7OpenExternal=function(){window.open(state.social.portalUrl||VT6_DEFAULT_EXTERNAL_URL,'_blank','noopener')};
window.vt7EditExternal=function(){const next=prompt('Endereço do site usado pela equipe:',state.social.portalUrl||VT6_DEFAULT_EXTERNAL_URL);if(next===null)return;const clean=next.trim();if(!/^https:\/\//i.test(clean))return alert('Use um endereço iniciado por https://');state.social.portalUrl=clean;save();toast('Acesso atualizado')};

function vt7CompactQueue(){
  const p=pendingOrders();
  if(!p.length)return `<section class="panel vt7-ok"><div><span class="vt7-ok-dot">✓</span><div><strong>Tudo certo por enquanto</strong><small>Nenhum pedido pendente.</small></div></div></section>`;
  return queuePanel();
}

function vt7GoalCard(goal){
  const current=vt7GoalCurrent(goal),pct=vt7GoalPct(goal),target=Number(goal.target)||0;
  const isMoney=goal.type==='sales';
  const currentText=isMoney?fmtMoney(current):`${current}`;
  const targetText=target?(isMoney?fmtMoney(target):`${target}`):'Defina a meta';
  const label=goal.type==='recruitment'?'Meta de recrutamento':`Meta de ${String(goal.label||'vendas').toLowerCase()}`;
  const remaining=Math.max(0,target-current);
  const helper=!target?'Meta ainda não definida':remaining<=0?'Meta atingida':isMoney?`Faltam ${fmtMoney(remaining)}`:`Faltam ${remaining} pessoas`;
  return `<article class="vt7-goal-card"><div class="vt7-goal-head"><div><span>${esc(label)}</span><strong>${esc(goal.label)}</strong></div><button class="mini" onclick="vt7EditGoal('${goal.id}')">Editar</button></div><div class="vt7-goal-numbers"><strong>${currentText}</strong><span>de ${targetText}</span></div><div class="progress"><i style="width:${pct}%"></i></div><div class="vt7-goal-foot"><span>${helper}</span><b>${target?`${pct}%`:''}</b></div></article>`;
}
window.vt7EditGoal=function(id){
  const goal=vt7Goal(id);if(!goal)return;
  const rawTarget=prompt(goal.type==='sales'?'Meta de vendas (R$):':'Meta de recrutamento (pessoas):',String(Number(goal.target)||''));if(rawTarget===null)return;
  const target=Number(String(rawTarget).replace(/\./g,'').replace(',','.'));if(!Number.isFinite(target)||target<0)return alert('Meta inválida.');goal.target=target;
  if(goal.type==='recruitment'){
    const rawCurrent=prompt('Quantas novas consultoras já foram recrutadas neste ciclo?',String(Number(goal.current)||0));if(rawCurrent===null)return;
    const current=Number(rawCurrent);if(!Number.isFinite(current)||current<0)return alert('Progresso inválido.');goal.current=current;
  }else state.workspace.goal=target;
  save();render();
};

function vt7GoalsPanel(){return `<section class="panel vt7-goals"><div class="panel-head"><div><h2>Metas do ciclo</h2><small>Venda e crescimento são objetivos diferentes.</small></div></div><div class="vt7-goal-grid">${state.goals.map(vt7GoalCard).join('')}</div></section>`}

function vt7NetworkSnapshot(){
  const leaders=vt7Leaders(),active=vt7ActiveConsultants(),recruitment=vt7Goal('recruitment');
  return `<section class="panel vt7-home-network"><div class="panel-head"><div><h2>Sua rede</h2><small>Serra, Espírito Santo</small></div><button class="btn" onclick="go('network')">Abrir Rede</button></div><div class="vt7-network-stats"><div><strong>${leaders.length}</strong><span>Líderes</span></div><div><strong>${active.length}</strong><span>Consultoras ativas</span></div><div><strong>${vt7GoalCurrent(recruitment)}</strong><span>Novas no ciclo</span></div></div><div class="vt7-owner-path"><span>Distrito Grande Vitória</span><b>Gerusa</b><i>›</i><span>Serra</span><b>${esc(state.workspace.ownerName||VT6_OWNER_NAME)}</b></div></section>`;
}

function vt7RecentOrders(){const rows=currentOrders().slice().reverse().slice(0,4);if(!rows.length)return `<section class="panel vt7-recent-empty"><div class="panel-head"><h2>Pedidos recentes</h2><button class="btn" onclick="go('orders')">Ver pedidos</button></div><p>Nenhum pedido registrado nesta semana.</p></section>`;return recentOrders()}

function vt7CommunityCards(){
  const leaders=vt7Leaders().length,active=vt7ActiveConsultants().length,recruited=vt7GoalCurrent(vt7Goal('recruitment'));
  return `<div class="vt7-communities"><article><span>Grupo</span><strong>Equipe Serra</strong><small>${active+leaders} pessoas cadastradas</small></article><article><span>Grupo</span><strong>Líderes Serra</strong><small>${leaders} líderes confirmadas</small></article><article><span>Grupo</span><strong>Novas consultoras</strong><small>${recruited} neste ciclo</small></article></div>`;
}

function vt7WallEvents(){
  const events=[];const sales=vt7Goal('sales'),recruitment=vt7Goal('recruitment'),s=stats();
  if(vt7GoalPct(sales)>=100&&Number(sales?.target)>0)events.push({icon:'★',title:'Meta de vendas atingida',text:'A Serra completou a meta de vendas do ciclo.'});
  if(vt7GoalPct(recruitment)>=100&&Number(recruitment?.target)>0)events.push({icon:'🌱',title:'Meta de recrutamento atingida',text:`A rede chegou a ${vt7GoalCurrent(recruitment)} novas consultoras.`});
  if(s.done>0)events.push({icon:'✓',title:'Pedidos concluídos',text:`${s.done} pedido${s.done===1?' foi concluído':'s foram concluídos'} nesta semana.`});
  if(currentOrders().length>0)events.push({icon:'●',title:'A rede está em movimento',text:`${currentOrders().length} pedido${currentOrders().length===1?' entrou':'s entraram'} na operação desta semana.`});
  if(vt7Leaders().length>0)events.push({icon:'♢',title:'Rede organizada',text:`${vt7Leaders().length} líder${vt7Leaders().length===1?' está':'es estão'} identificada${vt7Leaders().length===1?'':'s'} na Serra.`});
  return events.slice(0,5);
}
function vt7Wall(){
  const events=vt7WallEvents();
  return `<div class="vt7-wall">${events.length?events.map(e=>`<article class="vt7-wall-item"><span>${e.icon}</span><div><strong>${esc(e.title)}</strong><p>${esc(e.text)}</p></div></article>`).join(''):`<div class="vt7-network-empty"><strong>Seu mural começa aqui</strong><p>Pedidos, metas, novas consultoras e conquistas vão aparecer automaticamente conforme a rede for sendo atualizada.</p></div>`}${vt7CommunityCards()}</div>`;
}

function vt7Ranking(){
  const rows=vt7Leaders().map(l=>({leader:l,...vt7LeaderMetrics(l)})).filter(x=>x.orders>0||x.revenue>0).sort((a,b)=>b.revenue-a.revenue||b.orders-a.orders);
  if(!rows.length)return `<div class="vt7-network-empty"><strong>Ainda não há dados suficientes para o ranking</strong><p>Marque as líderes na ficha e registre pedidos das equipes. O ranking aparece sozinho.</p></div>`;
  const top=Math.max(1,rows[0].revenue||rows[0].orders);
  return `<div class="vt7-ranking">${rows.map((row,index)=>{const score=row.revenue?Math.round(row.revenue/top*100):Math.round(row.orders/Math.max(1,rows[0].orders)*100);return `<button onclick="vt7OpenMemberProfile('${row.leader.id}')"><span class="vt7-position">${index+1}</span><span class="avatar">${esc(vt7Initials(row.leader.name))}</span><div><strong>${esc(row.leader.name)}</strong><small>${row.active} consultoras ativas · ${row.orders} pedidos</small></div><div class="vt7-rank-score"><strong>${score}%</strong><small>do maior resultado</small></div></button>`}).join('')}</div>`;
}

function vt6Tree(){
  const leaders=vt7Leaders();const consultants=vt7Consultants();
  const assigned=new Set();
  const leaderHtml=leaders.map(leader=>{const members=vt7LeaderMembers(leader);members.forEach(m=>assigned.add(m.id));return `<details class="vt7-tree-leader" open><summary onclick="event.stopPropagation();vt7OpenMemberProfile('${leader.id}')"><span>Líder</span><strong>${esc(leader.name)}</strong><b>${members.length}</b></summary>${members.length?`<div class="vt6-people">${members.map(p=>`<button onclick="vt7OpenMemberProfile('${p.id}')"><span>${esc(p.name)}</span><small>${esc(p.group||'Revendedora / Consultora')}</small></button>`).join('')}</div>`:`<div class="vt7-tree-note">Nenhuma revendedora vinculada a esta líder.</div>`}</details>`}).join('');
  const unassigned=consultants.filter(c=>!assigned.has(c.id));
  return `<div class="vt6-network vt7-tree"><div class="vt6-network-root"><span>Distrito Grande Vitória</span><strong>Gerusa</strong></div><div class="vt6-network-branch"><span>Serra</span><strong>${esc(state.workspace.ownerName||VT6_OWNER_NAME)}</strong><small>Empresária</small></div>${leaderHtml||'<div class="vt7-tree-note"><strong>Nenhuma líder identificada ainda.</strong><span>Abra uma ficha e marque o papel na rede como Líder.</span></div>'}${unassigned.length?`<details class="vt7-tree-unassigned"><summary><span>Sem líder confirmada</span><strong>Revendedoras / Consultoras</strong><b>${unassigned.length}</b></summary><div class="vt6-people">${unassigned.map(p=>`<button onclick="vt7OpenMemberProfile('${p.id}')"><span>${esc(p.name)}</span><small>${esc(p.group||'Vínculo a definir')}</small></button>`).join('')}</div></details>`:''}</div>`;
}

function vt7NetworkTabs(){return `<div class="vt7-network-tabs"><button class="${vt7NetworkMode==='wall'?'selected':''}" onclick="vt7SetNetworkMode('wall')">Mural</button><button class="${vt7NetworkMode==='ranking'?'selected':''}" onclick="vt7SetNetworkMode('ranking')">Ranking</button><button class="${vt7NetworkMode==='tree'?'selected':''}" onclick="vt7SetNetworkMode('tree')">Árvore</button></div>`}
window.vt7SetNetworkMode=function(mode){vt7NetworkMode=mode;render()};
function vt7NetworkBody(){if(vt7NetworkMode==='ranking')return vt7Ranking();if(vt7NetworkMode==='tree')return vt6Tree();return vt7Wall()}
function networkView(){
  const n=vt6Counts();
  return `<section class="panel vt7-network-page"><div class="vt7-network-hero"><div><div class="eyebrow">REDE · SERRA</div><h2>Gente, metas e movimento</h2><p>Veja o que está acontecendo, acompanhe as líderes e navegue pela sua rede.</p></div><button class="btn" onclick="vt6ShowOnboarding()">Tutorial</button></div><div class="vt7-network-kpis"><div><strong>${vt7Leaders().length}</strong><span>Líderes</span></div><div><strong>${n.active}</strong><span>Pessoas ativas</span></div><div><strong>${vt7GoalCurrent(vt7Goal('recruitment'))}</strong><span>Novas no ciclo</span></div></div>${vt7NetworkTabs()}<div class="vt7-network-body">${vt7NetworkBody()}</div></section>`;
}

function vt7Achievements(){
  const items=[];const sales=vt7Goal('sales'),recruitment=vt7Goal('recruitment');
  if(vt7GoalPct(sales)>=100&&Number(sales?.target)>0)items.push('Meta de vendas atingida');
  if(vt7GoalPct(recruitment)>=100&&Number(recruitment?.target)>0)items.push('Meta de recrutamento atingida');
  if(vt7Leaders().length>=1)items.push('Rede com liderança identificada');
  if(currentOrders().filter(o=>o.finalized&&!o.cancelled).length>=1)items.push('Fechamento em movimento');
  return items;
}
function profileView(){
  const achievements=vt7Achievements();
  return `<section class="panel vt7-profile-page"><div class="vt7-profile-hero"><span class="vt7-profile-avatar">${esc(vt7Initials(state.workspace.ownerName||VT6_OWNER_NAME))}</span><div><div class="eyebrow">MEU PERFIL</div><h2>${esc(state.workspace.ownerName||VT6_OWNER_NAME)}</h2><p>Empresária Serra · Distrito Grande Vitória</p></div></div><div class="vt7-profile-stats"><div><strong>${vt7Leaders().length}</strong><span>Líderes</span></div><div><strong>${vt7ActiveConsultants().length}</strong><span>Consultoras ativas</span></div><div><strong>${currentOrders().length}</strong><span>Pedidos na semana</span></div></div><div class="vt7-profile-section"><div class="panel-head"><h3>Metas</h3></div><div class="vt7-goal-grid">${state.goals.map(vt7GoalCard).join('')}</div></div><div class="vt7-profile-section"><div class="panel-head"><h3>Conquistas</h3></div>${achievements.length?`<div class="vt7-badges">${achievements.map(x=>`<span>★ ${esc(x)}</span>`).join('')}</div>`:'<p class="vt7-muted">As conquistas aparecem conforme a rede registra resultados reais.</p>'}</div><div class="vt7-profile-section"><div class="panel-head"><h3>Acesso externo</h3><button class="btn" onclick="vt7EditExternal()">Alterar site</button></div><p class="vt7-muted">O botão Abrir Tupperware usa um endereço configurável. Assim o VoeTupper continua funcionando mesmo quando o site externo mudar.</p></div></section>`;
}

window.vt7OpenMemberProfile=function(id){
  const c=state.consultants.map(vt6Normalize).find(x=>x.id===id);if(!c)return;
  const metrics=c.role==='leader'?vt7LeaderMetrics(c):null;
  modal=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><section class="modal vt7-member-profile"><div class="modal-head"><div class="vt7-member-title"><span class="avatar">${esc(vt7Initials(c.name))}</span><div><div class="eyebrow">PERFIL DA REDE</div><h2>${esc(c.name)}</h2><p>${esc(vt7RoleLabel(c))} · Serra</p></div></div><button class="icon-close" onclick="closeModal()">×</button></div><div class="vt7-member-summary">${c.role==='leader'?`<div><strong>${metrics.active}</strong><span>Consultoras ativas</span></div><div><strong>${metrics.orders}</strong><span>Pedidos na semana</span></div>`:`<div><strong>${esc(c.registrationStatus)}</strong><span>Cadastro</span></div><div><strong>${esc(c.group||'A definir')}</strong><span>Grupo</span></div>`}</div><div class="vt7-profile-section"><h3>Rede</h3><p>${esc(c.role==='leader'?'Líder da Serra':vt6NetworkText(c))}</p></div><div class="modal-actions"><button class="btn" onclick="closeModal();openConsultantCard('${c.id}')">Abrir ficha operacional</button><button class="btn primary" onclick="closeModal()">Fechar</button></div></section></div>`;render();
};

teamRows=function(q){
  const needle=(q||'').trim().toLowerCase();
  const list=state.consultants.map(vt6Normalize).filter(c=>!needle||[c.name,c.code,c.phone,c.leader,c.group,c.registrationStatus,vt7RoleLabel(c)].some(v=>String(v||'').toLowerCase().includes(needle)));
  if(!list.length)return '<div class="queue-empty"><strong>Nenhuma consultora encontrada.</strong> Tente outro nome, código, líder ou grupo.</div>';
  return `<div class="vt6-team-table"><div class="vt6-team-head"><span>Consultora</span><span>Código</span><span>Senha</span><span>Cadastro</span><span>Grupo / líder</span><span>Ações</span></div>${list.map(c=>`<div class="vt6-team-row" onclick="openConsultantCard('${c.id}')"><div class="vt6-person"><span class="avatar">${esc(vt7Initials(c.name))}</span><div><strong>${esc(c.name)}</strong><small>${esc(vt7RoleLabel(c))}</small></div></div><div class="vt6-copy"><b>${esc(c.code||'Não informado')}</b>${c.code?`<button class="vt6-icon" onclick="event.stopPropagation();vt6Copy('${vt6EscapeAttr(c.code)}','Código')">Copiar código</button>`:''}</div><div class="vt6-secret-cell">${vt6Secret(c)}</div><div><span class="vt6-reg ${vt6RegistrationClass(c)}">${esc(c.registrationStatus)}</span></div><div class="vt6-network-text">${esc(vt6NetworkText(c))}</div><div class="vt6-actions"><button class="mini" onclick="event.stopPropagation();vt7OpenMemberProfile('${c.id}')">Perfil</button><button class="mini" onclick="event.stopPropagation();openConsultantCard('${c.id}')">Ficha</button></div></div>`).join('')}</div>`;
};
window.renderTeamRows=function(q){const el=document.getElementById('teamRows');if(el)el.innerHTML=teamRows(q)};

function vt6Counts(){
  const all=state.consultants.map(vt6Normalize);return{
    total:all.length,
    active:all.filter(c=>c.status!=='INATIVA').length,
    h:all.filter(c=>String(c.registrationStatus).includes('H')).length,
    review:all.filter(c=>String(c.registrationStatus).includes('REVISAR')||c.dataStatus==='REVISAR').length,
    grouped:all.filter(c=>c.group||c.leader).length
  };
}
teamView=function(){return networkView()};
window.vt6SetTeamFilter=function(q){vt6TeamMode='list';render();setTimeout(()=>{const input=document.getElementById('teamSearch');if(input){input.value=q;renderTeamRows(q)}},0)};
window.vt6SetMode=function(mode){if(mode==='tree'){vt7NetworkMode='tree';view='network';render();return}vt6TeamMode=mode;render()};

window.openConsultantCard=function(id=''){
  const existing=state.consultants.find(c=>c.id===id);const c=vt6Normalize(existing||{id:'',name:'',code:'',status:'ATIVA',registrationStatus:'NOVO CADASTRO',role:'consultant'});
  modal=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><section class="modal vt6-card"><div class="modal-head"><div><div class="eyebrow">FICHA DA CONSULTORA</div><h2>${existing?esc(c.name):'Nova consultora'}</h2><p>${existing?esc(vt6NetworkText(c)):'Cadastre somente o necessário para operar e recadastrar.'}</p></div><button class="icon-close" onclick="closeModal()">×</button></div><form id="consultantForm" onsubmit="saveConsultantCard(event,'${vt6EscapeAttr(c.id)}')"><div class="vt6-form-section"><h3>Acesso ao Tupper.NET</h3><div class="form-grid"><div class="field"><label>Código</label><div class="input-copy"><input id="cCode" value="${vt6EscapeAttr(c.code)}"><button type="button" onclick="vt6Copy(document.getElementById('cCode').value,'Código')">Copiar código</button></div></div><div class="field"><label>Senha</label><div class="input-copy"><input id="cPassword" type="password" value="${vt6EscapeAttr(c.portalPassword)}"><button type="button" onclick="const x=document.getElementById('cPassword');x.type=x.type==='password'?'text':'password'">Mostrar</button><button type="button" onclick="vt6Copy(document.getElementById('cPassword').value,'Senha')">Copiar senha</button></div></div></div><div class="vt6-credential-note">Piloto local: a credencial fica neste navegador e não é publicada em texto aberto no repositório.</div></div><div class="vt6-form-section"><h3>Dados para cadastro / recadastro</h3><div class="form-grid"><div class="field wide"><label>Nome</label><input id="cName" value="${vt6EscapeAttr(c.name)}" required></div><div class="field"><label>CPF</label><input id="cCpf" inputmode="numeric" value="${vt6EscapeAttr(c.cpf)}" placeholder="Somente números"></div><div class="field"><label>Data de nascimento</label><input id="cBirth" type="date" value="${vt6EscapeAttr(c.birthDate)}"></div><div class="field"><label>Telefone / WhatsApp</label><input id="cPhone" value="${vt6EscapeAttr(c.phone)}"></div><div class="field"><label>E-mail</label><input id="cEmail" type="email" value="${vt6EscapeAttr(c.email)}"></div><div class="field"><label>Cadastro no portal</label><select id="cReg"><option ${c.registrationStatus==='ATIVA'?'selected':''}>ATIVA</option><option ${String(c.registrationStatus).includes('H')?'selected':''}>H / RECADASTRAR</option><option ${String(c.registrationStatus).includes('REVISAR')?'selected':''}>REVISAR</option><option ${c.registrationStatus==='NOVO CADASTRO'?'selected':''}>NOVO CADASTRO</option></select></div></div><div class="vt6-form-actions"><button type="button" class="btn" onclick="vt6CopyRegistrationData('${vt6EscapeAttr(c.id)}')">Copiar dados para cadastro</button><button type="button" class="btn" onclick="window.open(VT6_REGISTRATION_URL,'_blank')">Abrir cadastro oficial</button></div></div><div class="vt6-form-section"><h3>Rede</h3><div class="form-grid"><div class="field"><label>Papel na rede</label><select id="cRole"><option value="consultant" ${c.role!=='leader'?'selected':''}>Revendedora / Consultora</option><option value="leader" ${c.role==='leader'?'selected':''}>Líder</option></select></div><div class="field"><label>Distrito</label><input id="cDistrict" value="${vt6EscapeAttr(c.district)}"></div><div class="field"><label>Área da Empresária</label><input id="cBusinessArea" value="${vt6EscapeAttr(c.businessArea)}"></div><div class="field"><label>Grupo</label><input id="cGroup" value="${vt6EscapeAttr(c.group)}" placeholder="Nome do grupo"></div><div class="field"><label>Líder responsável</label><input id="cLeader" value="${vt6EscapeAttr(c.leader)}" placeholder="Nome da líder"></div><div class="field"><label>Situação na equipe</label><select id="cStatus"><option ${c.status==='ATIVA'?'selected':''}>ATIVA</option><option ${c.status==='INATIVA'?'selected':''}>INATIVA</option><option ${c.status==='REVISAR'?'selected':''}>REVISAR</option></select></div><div class="field wide"><label>Observação</label><input id="cNote" value="${vt6EscapeAttr(c.note)}"></div></div></div><div class="modal-actions">${existing?`<button type="button" class="btn" onclick="openOrderForConsultant('${c.id}');closeModal()">Novo pedido</button>`:''}<button class="btn primary">Salvar ficha</button></div></form></section></div>`;render();
};
window.saveConsultantCard=function(e,id){
  e.preventDefault();const data={
    name:document.getElementById('cName').value.trim(),code:document.getElementById('cCode').value.trim(),portalPassword:document.getElementById('cPassword').value,
    cpf:document.getElementById('cCpf').value.replace(/\D/g,''),birthDate:document.getElementById('cBirth').value,email:document.getElementById('cEmail').value.trim(),phone:document.getElementById('cPhone').value.trim(),
    registrationStatus:document.getElementById('cReg').value,role:document.getElementById('cRole').value,district:document.getElementById('cDistrict').value.trim(),businessArea:document.getElementById('cBusinessArea').value.trim(),
    group:document.getElementById('cGroup').value.trim(),leader:document.getElementById('cLeader').value.trim(),status:document.getElementById('cStatus').value,note:document.getElementById('cNote').value.trim()
  };
  if(id){const i=state.consultants.findIndex(c=>c.id===id);state.consultants[i]={...state.consultants[i],...data}}else state.consultants.push({...data,id:crypto.randomUUID()});
  save();modal=null;view='network';render();toast('Ficha salva');
};

window.vt6CopyRegistrationData=function(id){
  const c=state.consultants.find(x=>x.id===id);if(!c)return toast('Salve a ficha primeiro');
  const text=[`Nome: ${c.name||''}`,`CPF: ${c.cpf||''}`,`Nascimento: ${c.birthDate||''}`,`Telefone: ${c.phone||''}`,`E-mail: ${c.email||''}`,`Código: ${c.code||''}`].join('\n');
  copyValue(text,'Dados para cadastro');
};

window.vt7ImportTeamPrompt=async function(){
  if(typeof hotfixDecryptTeam!=='function')return alert('Importação segura indisponível neste navegador.');
  const key=prompt('Cole o código de importação da equipe:');if(!key)return;
  try{const data=await hotfixDecryptTeam(key.trim());if(!data||!Array.isArray(data.consultants))throw new Error('Base vazia');hotfixMergeConsultants(data.consultants);save();render();toast('Equipe importada')}catch(err){console.error(err);alert('Não foi possível importar a equipe com esse código.')}
};

function vt7EmptyTeamNotice(){if(state.consultants.length)return'';return `<section class="panel vt7-import"><div><strong>Equipe ainda não carregada neste aparelho</strong><p>Os dados operacionais ficam protegidos. Importe a equipe com o código seguro ou cadastre as pessoas manualmente.</p></div><div><button class="btn primary" onclick="vt7ImportTeamPrompt()">Importar equipe</button><button class="btn" onclick="openConsultantCard()">Cadastrar pessoa</button></div></section>`}
today=function(){return `${vt7EmptyTeamNotice()}${quickActions()}<div class="section-label">Hoje</div>${vt7CompactQueue()}${vt7GoalsPanel()}${vt7NetworkSnapshot()}${vt7RecentOrders()}`};

render=function(){
  if(!isSignedIn()){renderLogin();return}
  if(view==='team')view='network';
  const content=view==='today'?today():view==='network'?networkView():view==='orders'?ordersView():view==='profile'?profileView():view==='closing'?closingView():today();
  document.getElementById('root').innerHTML=shell(content);
  if(!installPrompt){const b=document.getElementById('installBtn');if(b)b.style.display='none'}
};
go=function(v){view=v==='team'?'network':v;modal=null;render()};

window.vt6ShowOnboarding=function(){
  modal=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><section class="modal vt6-onboarding"><div class="modal-head"><div><div class="eyebrow">PRIMEIROS 3 MINUTOS</div><h2>Primeiros 3 minutos</h2><p>O básico para operar sem procurar informação em várias conversas.</p></div><button class="icon-close" onclick="closeModal()">×</button></div><div class="vt6-onboarding-steps"><div><b>1</b><span><strong>1. Encontre a consultora</strong><small>Use Rede, busca ou árvore.</small></span></div><div><b>2</b><span><strong>2. Copie código e senha</strong><small>Use a ficha operacional somente quando precisar acessar o sistema externo.</small></span></div><div><b>3</b><span><strong>3. Registre o pedido</strong><small>O fechamento passa a acompanhar a próxima ação.</small></span></div></div><button class="btn primary full" onclick="localStorage.setItem(VT6_ONBOARDING_KEY,'1');closeModal()">Entendi</button></section></div>`;render();
};

if(!localStorage.getItem(VT6_ONBOARDING_KEY)&&isSignedIn())setTimeout(()=>vt6ShowOnboarding(),450);
