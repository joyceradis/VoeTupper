const VT6_ONBOARDING_KEY='voetupper-v6-onboarding-seen';
const VT6_REGISTRATION_URL='https://portal.tupperware.com.br/pt-BR';
let vt6TeamMode='list';

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
  ...state.workspace,
  name:'Empresária Serra',
  region:'Serra / Espírito Santo'
};
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
      leader:preserve('leader'),group:preserve('group'),district:preserve('district'),businessArea:preserve('businessArea')
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
  const hidden=el.textContent==='••••••••';el.textContent=hidden?(c.portalPassword||'—'):'••••••••';btn.textContent=hidden?'Ocultar':'Mostrar';
};

function vt6RegistrationClass(c){const s=String(c.registrationStatus||'').toUpperCase();if(s.includes('H'))return'h';if(s.includes('REVISAR'))return'review';if(s.includes('NOVO'))return'new';return'active'}
function vt6NetworkText(c){return [c.group,c.leader].filter(Boolean).join(' · ')||'Grupo e líder não informados'}

teamRows=function(q){
  const needle=(q||'').trim().toLowerCase();
  const list=state.consultants.map(vt6Normalize).filter(c=>!needle||[c.name,c.code,c.phone,c.leader,c.group,c.registrationStatus].some(v=>String(v||'').toLowerCase().includes(needle)));
  if(!list.length)return '<div class="queue-empty"><strong>Nenhuma consultora encontrada.</strong> Tente outro nome, código, líder ou grupo.</div>';
  return `<div class="vt6-team-table"><div class="vt6-team-head"><span>Consultora</span><span>Código</span><span>Senha</span><span>Cadastro</span><span>Grupo / líder</span><span>Ações</span></div>${list.map(c=>`<div class="vt6-team-row" onclick="openConsultantCard('${c.id}')"><div class="vt6-person"><span class="avatar">${esc(initials(c.name))}</span><div><strong>${esc(c.name)}</strong><small>${esc(c.phone||c.note||'')}</small></div></div><div class="vt6-copy"><b>${esc(c.code||'—')}</b>${c.code?`<button class="vt6-icon" onclick="event.stopPropagation();vt6Copy('${vt6EscapeAttr(c.code)}','Código')">Copiar código</button>`:''}</div><div class="vt6-secret-cell">${vt6Secret(c)}</div><div><span class="vt6-reg ${vt6RegistrationClass(c)}">${esc(c.registrationStatus)}</span></div><div class="vt6-network-text">${esc(vt6NetworkText(c))}</div><div class="vt6-actions"><button class="mini" onclick="event.stopPropagation();openOrderForConsultant('${c.id}')">Pedido</button><button class="mini" onclick="event.stopPropagation();openConsultantCard('${c.id}')">Ficha</button></div></div>`).join('')}</div>`;
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
teamView=function(){
  const n=vt6Counts();
  return `<section class="panel vt6-team-panel"><div class="vt6-team-top"><div><div class="eyebrow">REDE · VITORIAWARE</div><h2>Equipe Serra</h2><p>Encontre a pessoa, copie o acesso e resolva o pedido sem procurar em notas ou conversas.</p></div><div class="vt6-top-actions"><button class="btn" onclick="vt6ShowOnboarding()">Tutorial</button><button class="btn primary" onclick="openConsultantCard()">+ Consultora</button></div></div><div class="vt6-kpis"><button onclick="vt6SetTeamFilter('')"><strong>${n.active}</strong><span>Ativas</span></button><button onclick="vt6SetTeamFilter('H / RECADASTRAR')"><strong>${n.h}</strong><span>H / recadastrar</span></button><button onclick="vt6SetTeamFilter('REVISAR')"><strong>${n.review}</strong><span>Revisar dados</span></button><button onclick="vt6SetMode('tree')"><strong>${n.grouped}</strong><span>Com grupo/líder</span></button></div><div class="vt6-toolbar"><div class="vt6-search"><input class="search" id="teamSearch" placeholder="Buscar nome, código, líder, grupo ou telefone" oninput="renderTeamRows(this.value)"></div><div class="vt6-segment"><button class="${vt6TeamMode==='list'?'selected':''}" onclick="vt6SetMode('list')">Lista</button><button class="${vt6TeamMode==='tree'?'selected':''}" onclick="vt6SetMode('tree')">Visão em árvore</button></div></div><div id="teamRows">${vt6TeamMode==='tree'?vt6Tree():teamRows('')}</div></section>`;
};
window.vt6SetTeamFilter=function(q){vt6TeamMode='list';render();setTimeout(()=>{const input=document.getElementById('teamSearch');if(input){input.value=q;renderTeamRows(q)}},0)};
window.vt6SetMode=function(mode){vt6TeamMode=mode;render()};

function vt6Tree(){
  const byLeader={};
  state.consultants.map(vt6Normalize).forEach(c=>{const leader=c.leader||'Sem líder definida';const group=c.group||'Sem grupo definido';byLeader[leader]??={};byLeader[leader][group]??=[];byLeader[leader][group].push(c)});
  return `<div class="vt6-network"><div class="vt6-network-root"><span>Distrito Grande Vitória</span><strong>Gerusa</strong></div><div class="vt6-network-branch"><span>Vitoriaware</span><strong>Empresária Serra</strong></div>${Object.entries(byLeader).map(([leader,groups])=>`<details open><summary><span>Líder</span><strong>${esc(leader)}</strong><b>${Object.values(groups).flat().length}</b></summary>${Object.entries(groups).map(([group,people])=>`<div class="vt6-group"><div><span>Grupo</span><strong>${esc(group)}</strong></div><div class="vt6-people">${people.map(p=>`<button onclick="openConsultantCard('${p.id}')"><span>${esc(p.name)}</span><small>${esc(p.code||'sem código')}</small></button>`).join('')}</div></div>`).join('')}</details>`).join('')}</div>`;
}

function vt6NetworkSnapshot(){
  const n=vt6Counts();
  return `<section class="panel vt6-home-network"><div class="panel-head"><div><h2>Rede</h2><small>Distrito → Empresária → Líder → Consultora</small></div><button class="btn" onclick="go('team');setTimeout(()=>vt6SetMode('tree'),0)">Abrir árvore</button></div><div class="vt6-path"><div><span>Distrito</span><strong>Grande Vitória</strong><small>Gerusa</small></div><i>›</i><div><span>Operação</span><strong>Vitoriaware</strong><small>Empresária Serra</small></div><i>›</i><div><span>Equipe</span><strong>${n.active} ativas</strong><small>${n.h} H / recadastrar · ${n.review} revisar</small></div></div></section>`;
}
today=function(){return`${quickActions()}<div class="section-label">O que precisa ser resolvido</div><div class="ops-grid">${queuePanel()}${summaryPanel()}</div><div class="lower-grid">${recentOrders()}${vt6NetworkSnapshot()}</div>`};

window.openConsultantCard=function(id=''){
  const existing=state.consultants.find(c=>c.id===id);const c=vt6Normalize(existing||{id:'',name:'',code:'',status:'ATIVA',registrationStatus:'NOVO CADASTRO'});
  modal=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><section class="modal vt6-card"><div class="modal-head"><div><div class="eyebrow">FICHA DA CONSULTORA</div><h2>${existing?esc(c.name):'Nova consultora'}</h2><p>${existing?esc(vt6NetworkText(c)):'Cadastre somente o necessário para operar e recadastrar.'}</p></div><button class="icon-close" onclick="closeModal()">×</button></div><form id="consultantForm" onsubmit="saveConsultantCard(event,'${vt6EscapeAttr(c.id)}')"><div class="vt6-form-section"><h3>Acesso ao Tupper.NET</h3><div class="form-grid"><div class="field"><label>Código</label><div class="input-copy"><input id="cCode" value="${vt6EscapeAttr(c.code)}"><button type="button" onclick="vt6Copy(document.getElementById('cCode').value,'Código')">Copiar código</button></div></div><div class="field"><label>Senha</label><div class="input-copy"><input id="cPassword" type="password" value="${vt6EscapeAttr(c.portalPassword)}"><button type="button" onclick="const x=document.getElementById('cPassword');x.type=x.type==='password'?'text':'password'">Mostrar</button><button type="button" onclick="vt6Copy(document.getElementById('cPassword').value,'Senha')">Copiar senha</button></div></div></div><div class="vt6-credential-note">Piloto local: a credencial fica neste navegador e não é publicada em texto aberto no repositório.</div></div><div class="vt6-form-section"><h3>Dados para cadastro / recadastro</h3><div class="form-grid"><div class="field wide"><label>Nome</label><input id="cName" value="${vt6EscapeAttr(c.name)}" required></div><div class="field"><label>CPF</label><input id="cCpf" inputmode="numeric" value="${vt6EscapeAttr(c.cpf)}" placeholder="Somente números"></div><div class="field"><label>Data de nascimento</label><input id="cBirth" type="date" value="${vt6EscapeAttr(c.birthDate)}"></div><div class="field"><label>Telefone / WhatsApp</label><input id="cPhone" value="${vt6EscapeAttr(c.phone)}"></div><div class="field"><label>E-mail</label><input id="cEmail" type="email" value="${vt6EscapeAttr(c.email)}"></div><div class="field"><label>Cadastro no portal</label><select id="cReg"><option ${c.registrationStatus==='ATIVA'?'selected':''}>ATIVA</option><option ${String(c.registrationStatus).includes('H')?'selected':''}>H / RECADASTRAR</option><option ${String(c.registrationStatus).includes('REVISAR')?'selected':''}>REVISAR</option><option ${c.registrationStatus==='NOVO CADASTRO'?'selected':''}>NOVO CADASTRO</option></select></div></div><div class="vt6-form-actions"><button type="button" class="btn" onclick="vt6CopyRegistrationData('${vt6EscapeAttr(c.id)}')">Copiar dados para cadastro</button><button type="button" class="btn" onclick="window.open(VT6_REGISTRATION_URL,'_blank')">Abrir cadastro oficial</button></div></div><div class="vt6-form-section"><h3>Rede</h3><div class="form-grid"><div class="field"><label>Distrito</label><input id="cDistrict" value="${vt6EscapeAttr(c.district)}"></div><div class="field"><label>Área da Empresária</label><input id="cBusinessArea" value="${vt6EscapeAttr(c.businessArea)}"></div><div class="field"><label>Grupo</label><input id="cGroup" value="${vt6EscapeAttr(c.group)}" placeholder="Nome do grupo"></div><div class="field"><label>Líder responsável</label><input id="cLeader" value="${vt6EscapeAttr(c.leader)}" placeholder="Nome da líder"></div><div class="field"><label>Situação na equipe</label><select id="cStatus"><option ${c.status==='ATIVA'?'selected':''}>ATIVA</option><option ${c.status==='INATIVA'?'selected':''}>INATIVA</option><option ${c.status==='REVISAR'?'selected':''}>REVISAR</option></select></div><div class="field wide"><label>Observação</label><input id="cNote" value="${vt6EscapeAttr(c.note)}"></div></div></div><div class="modal-actions">${existing?`<button type="button" class="btn" onclick="openOrderForConsultant('${c.id}');closeModal()">Novo pedido</button>`:''}<button class="btn primary">Salvar ficha</button></div></form></section></div>`;render();
};
window.saveConsultantCard=function(e,id){
  e.preventDefault();const data={
    name:document.getElementById('cName').value.trim(),code:document.getElementById('cCode').value.trim(),portalPassword:document.getElementById('cPassword').value,
    cpf:document.getElementById('cCpf').value.replace(/\D/g,''),birthDate:document.getElementById('cBirth').value,email:document.getElementById('cEmail').value.trim(),phone:document.getElementById('cPhone').value.trim(),
    registrationStatus:document.getElementById('cReg').value,district:document.getElementById('cDistrict').value.trim(),businessArea:document.getElementById('cBusinessArea').value.trim(),group:document.getElementById('cGroup').value.trim(),leader:document.getElementById('cLeader').value.trim(),status:document.getElementById('cStatus').value,note:document.getElementById('cNote').value.trim()
  };
  if(id){const i=state.consultants.findIndex(c=>c.id===id);state.consultants[i]={...state.consultants[i],...data}}else state.consultants.push({...data,id:crypto.randomUUID()});save();modal=null;view='team';render();toast('Ficha salva');
};
window.vt6CopyRegistrationData=function(id){
  const c=vt6Normalize(state.consultants.find(x=>x.id===id)||{});const lines=[`Nome: ${c.name||''}`,`CPF: ${c.cpf||''}`,`Data de nascimento: ${c.birthDate||''}`,`Telefone: ${c.phone||''}`,`E-mail: ${c.email||''}`,`Grupo: ${c.group||''}`,`Líder responsável: ${c.leader||''}`];vt6Copy(lines.join('\n'),'Dados para cadastro');
};

window.vt6ShowOnboarding=function(){
  modal=`<div class="modal-backdrop"><section class="modal vt6-onboarding"><div class="eyebrow">PRIMEIRO ACESSO</div><h2>Primeiros 3 minutos</h2><p>O VoeTupper existe para tirar trabalho manual, não para criar outro sistema para preencher.</p><div class="vt6-onboarding-steps"><div><b>1</b><span><strong>1. Encontre a consultora</strong><small>Busque pelo nome ou código. A ficha concentra acesso, cadastro e responsável.</small></span></div><div><b>2</b><span><strong>2. Copie código e senha</strong><small>Use os botões ao lado dos dados e abra o Tupper.NET sem voltar para notas ou WhatsApp.</small></span></div><div><b>3</b><span><strong>3. Registre o pedido</strong><small>O pedido entra na fila e mostra a próxima ação: conferir, portal, print e finalizar.</small></span></div></div><div class="modal-actions"><button class="btn" onclick="vt6FinishOnboarding();go('team')">Ver equipe</button><button class="btn primary" onclick="vt6FinishOnboarding()">Começar</button></div></section></div>`;render();
};
window.vt6FinishOnboarding=function(){localStorage.setItem(VT6_ONBOARDING_KEY,'1');modal=null;render()};

const vt6OriginalRender=render;
render=function(){vt6OriginalRender();document.querySelectorAll('.sync').forEach(el=>el.innerHTML='<strong>Piloto Vitoriaware</strong><br>Serra · Espírito Santo');};
if(isSignedIn()){render();if(!localStorage.getItem(VT6_ONBOARDING_KEY))setTimeout(()=>vt6ShowOnboarding(),250)}
