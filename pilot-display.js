const VT9_VISIBLE_HANDLE='ritheli.radis';
const VT9_LEGACY_HANDLE='empresaria01-teste-master';
const VT9_DISPLAY_NAME='Ritheli Radis';
const VT9_DISTRICT_LABEL='Distrito Plenitude';
const VT9_REGION_LABEL='Serra / Espírito Santo';

function vt9ApplyPilotIdentity(){
  const handle=document.getElementById('loginHandle');
  if(handle&&String(handle.value||'').trim().toLowerCase()===VT9_LEGACY_HANDLE)handle.value=VT9_VISIBLE_HANDLE;

  const loginNote=document.querySelector('.login-note');
  if(loginNote)loginNote.textContent=`${VT9_DISPLAY_NAME} · ${VT9_DISTRICT_LABEL} · ${VT9_REGION_LABEL}`;

  document.querySelectorAll('.workspace-badge strong,.cycle > strong').forEach(el=>{el.textContent=VT9_DISPLAY_NAME});
  document.querySelectorAll('.workspace-badge span').forEach(el=>{el.textContent=`${VT9_DISTRICT_LABEL} · ${VT9_REGION_LABEL}`});

  const brandContext=document.querySelector('.brand-name small');
  if(brandContext)brandContext.textContent=`${VT9_DISTRICT_LABEL} · Serra`;

  const networkSmall=document.querySelector('.vt7-home-network .panel-head small');
  if(networkSmall)networkSmall.textContent=`${VT9_DISTRICT_LABEL} · ${VT9_REGION_LABEL}`;

  const ownerPath=document.querySelector('.vt7-owner-path');
  if(ownerPath){
    const spans=ownerPath.querySelectorAll('span');
    if(spans[1])spans[1].textContent=VT9_DISTRICT_LABEL;
  }

  const currentCard=document.querySelector('.vt8-business-card.current small');
  if(currentCard)currentCard.textContent=`Empresária · ${VT9_DISTRICT_LABEL} · Serra`;

  const currentTree=document.querySelector('.vt8-business-node.current summary strong');
  if(currentTree)currentTree.textContent='Plenitude';

  const profileTitle=document.querySelector('.vt7-profile-hero h2');
  if(profileTitle)profileTitle.textContent=VT9_DISPLAY_NAME;
  const profileContext=document.querySelector('.vt7-profile-hero p');
  if(profileContext)profileContext.textContent=`Empresária · ${VT9_DISTRICT_LABEL} · Serra · Espírito Santo`;

  const modalTitle=document.querySelector('.vt7-member-title h2');
  const modalContext=document.querySelector('.vt7-member-title p');
  if(modalTitle&&modalContext&&modalTitle.textContent?.includes('Ritheli'))modalContext.textContent=`Empresária · ${VT9_DISTRICT_LABEL} · Serra`;
}

document.addEventListener('submit',event=>{
  if(event.target?.id!=='loginForm')return;
  const handle=document.getElementById('loginHandle');
  if(!handle)return;
  if(String(handle.value||'').trim().toLowerCase()===VT9_VISIBLE_HANDLE)handle.value=VT9_LEGACY_HANDLE;
  setTimeout(vt9ApplyPilotIdentity,0);
},true);

if(typeof render==='function'){
  const vt9BaseRender=render;
  render=function(){
    vt9BaseRender();
    vt9ApplyPilotIdentity();
  };
}

vt9ApplyPilotIdentity();
