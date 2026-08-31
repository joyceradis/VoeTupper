const HOTFIX_VERSION='2026-08-31.1';
const HOTFIX_TEAM_KEY='voetupper-team-import-key-v2';

// A operação real informou Vitrine 09 para a semana vigente. Vitrine e semana
// são dimensões distintas; não inferir vitrine apenas pelo mês civil.
try {
  if (Array.isArray(weeks)) {
    const w35=weeks.find(w=>w.week==='35/2026');
    if(w35) w35.vitrine='09/2026';
  }
} catch(e){ console.error('VoeTupper cycle patch failed',e); }

function hotfixB64urlBytes(value){
  const pad='='.repeat((4-value.length%4)%4);
  const bin=atob(value.replace(/-/g,'+').replace(/_/g,'/')+pad);
  return Uint8Array.from(bin,c=>c.charCodeAt(0));
}

function getTeamImportKey(){
  const match=location.hash.match(/(?:^#|&)team=([^&]+)/);
  if(match){
    const key=decodeURIComponent(match[1]);
    sessionStorage.setItem(HOTFIX_TEAM_KEY,key);
    return key;
  }
  return sessionStorage.getItem(HOTFIX_TEAM_KEY)||sessionStorage.getItem('voetupper-team-import-key-v1');
}

async function hotfixDecryptTeam(keyText){
  const response=await fetch('./team.enc.json?v=4',{cache:'no-store'});
  if(!response.ok) throw new Error(`Equipe indisponível (${response.status})`);
  const payload=await response.json();
  const key=await crypto.subtle.importKey('raw',hotfixB64urlBytes(keyText),{name:'AES-GCM'},false,['decrypt']);
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:hotfixB64urlBytes(payload.iv),additionalData:new TextEncoder().encode(payload.aad)},key,hotfixB64urlBytes(payload.ciphertext));
  return JSON.parse(new TextDecoder().decode(plain));
}

function hotfixMergeConsultants(incoming){
  const existing=new Set(state.consultants.map(c=>`${String(c.code||'').trim()}|${String(c.name||'').trim().toLowerCase()}`));
  let added=0;
  for(const c of incoming){
    const identity=`${String(c.code||'').trim()}|${String(c.name||'').trim().toLowerCase()}`;
    if(existing.has(identity)) continue;
    state.consultants.push({...c,phone:c.phone||'',leader:c.leader||''});
    existing.add(identity); added++;
  }
  return added;
}

async function recoverTeamImport(){
  const key=getTeamImportKey();
  if(!key || typeof isSignedIn!=='function' || !isSignedIn()) return false;
  // Não confie no marcador se a equipe estiver vazia: versões anteriores podiam
  // marcar uma tentativa incompleta como concluída.
  if(state.consultants.length>0 && !location.hash.includes('team=')) return true;
  try{
    const data=await hotfixDecryptTeam(key);
    if(!data || !Array.isArray(data.consultants) || data.consultants.length<1) throw new Error('Payload de equipe vazio');
    const added=hotfixMergeConsultants(data.consultants);
    save();
    localStorage.setItem('voetupper-team-imported-v2','1');
    sessionStorage.removeItem(HOTFIX_TEAM_KEY);
    sessionStorage.removeItem('voetupper-team-import-key-v1');
    // Só remove a chave depois de persistir os dados com sucesso.
    history.replaceState(null,'',location.pathname+location.search);
    render();
    setTimeout(()=>alert(`${state.consultants.length} consultoras disponíveis na equipe${added?` · ${added} importadas agora`:''}.`),40);
    return true;
  }catch(err){
    console.error('VoeTupper team recovery failed',err);
    return false;
  }
}

// Diretório mais denso e útil que a antiga caixa vazia.
try{
  teamView=function(){
    const active=state.consultants.filter(c=>c.status!=='INATIVA').length;
    const review=state.consultants.filter(c=>String(c.status||'').toUpperCase()==='REVISAR'||String(c.review||'').toUpperCase()==='REVISAR').length;
    return `<section class="panel team-panel"><div class="team-titlebar"><div><div class="eyebrow">EQUIPE VITORIAWARE</div><h2>${state.consultants.length} consultoras <span>${active} ativas</span></h2></div><button class="btn primary" onclick="openPerson()">+ Consultora</button></div><div class="team-kpis"><div><strong>${active}</strong><span>Ativas</span></div><div><strong>${stats().noOrder}</strong><span>Sem pedido na semana</span></div><div><strong>${review}</strong><span>Revisar cadastro</span></div></div><div class="team-toolbar"><input class="search" id="teamSearch" placeholder="Buscar por nome, código ou telefone" oninput="renderTeamRows(this.value)"></div><div class="team-columns"><span>Consultora</span><span>Código</span><span>Situação</span><span></span></div><div id="teamRows">${teamRows('')}</div></section>`;
  };
  teamRows=function(q){
    const needle=q.trim().toLowerCase();
    const list=state.consultants.filter(c=>!needle||[c.name,c.code,c.phone].some(v=>(v||'').toLowerCase().includes(needle)));
    return list.length?list.map(c=>`<div class="team-row"><div class="team-person"><span class="avatar">${esc(initials(c.name))}</span><div><strong>${esc(c.name)}</strong>${c.leader?`<small>${esc(c.leader)}</small>`:''}</div></div><span class="team-code">${esc(c.code||'—')}</span><span><b class="state-pill ${String(c.status||'').toLowerCase()}">${esc(c.status||'ATIVA')}</b></span><div class="team-actions">${c.phone?`<a class="mini" href="https://wa.me/55${c.phone.replace(/\D/g,'')}" target="_blank" rel="noopener">WhatsApp</a>`:''}<button class="mini" onclick="openOrderForConsultant('${c.id}')">Pedido</button></div></div>`).join(''):`<div class="queue-empty"><strong>Nenhuma consultora encontrada.</strong>Revise a busca.</div>`;
  };
  window.openOrderForConsultant=function(id){openOrder();setTimeout(()=>{const el=document.getElementById('oConsultant');if(el){el.value=id;}},0)};
}catch(e){console.error('VoeTupper directory patch failed',e)}

// Tenta imediatamente e novamente após login/boot.
recoverTeamImport();
let hotfixAttempts=0;
const hotfixTimer=setInterval(async()=>{
  hotfixAttempts++;
  if(await recoverTeamImport() || hotfixAttempts>120) clearInterval(hotfixTimer);
},500);
