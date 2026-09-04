const VT9_VISIBLE_HANDLE='ritheli.radis';
const VT9_LEGACY_HANDLE='empresaria01-teste-master';
const VT9_DISPLAY_NAME='Ritheli Radis';
const VT9_DISTRICT_LABEL='Distrito Plenitude';
const VT9_REGION_LABEL='Serra / Espírito Santo';
const VT9_APPROVED_LOGO='./logo-512.png?v=10';

function vt9ApplyApprovedLogo(){
  document.querySelectorAll('.brand-row>img,.login-brand img').forEach(img=>{
    if(img.getAttribute('src')!==VT9_APPROVED_LOGO)img.src=VT9_APPROVED_LOGO;
    img.onerror=null;
    img.style.objectFit='contain';
  });
}

function vt9ApplyPilotIdentity(){
  const handle=document.getElementById('loginHandle');if(handle&&String(handle.value||'').trim().toLowerCase()===VT9_LEGACY_HANDLE)handle.value=VT9_VISIBLE_HANDLE;
  const loginNote=document.querySelector('.login-note');if(loginNote)loginNote.textContent=`${VT9_DISPLAY_NAME} · ${VT9_DISTRICT_LABEL} · ${VT9_REGION_LABEL}`;
  document.querySelectorAll('.workspace-badge strong,.cycle > strong').forEach(el=>{el.textContent=VT9_DISPLAY_NAME});
  document.querySelectorAll('.workspace-badge span').forEach(el=>{el.textContent=`${VT9_DISTRICT_LABEL} · ${VT9_REGION_LABEL}`});
  vt9ApplyApprovedLogo();
  const networkSmall=document.querySelector('.vt7-home-network .panel-head small');if(networkSmall)networkSmall.textContent=`${VT9_DISTRICT_LABEL} · ${VT9_REGION_LABEL}`;
  const currentCard=document.querySelector('.vt8-business-card.current small');if(currentCard)currentCard.textContent=`Empresária · ${VT9_DISTRICT_LABEL} · Serra`;
  const profileTitle=document.querySelector('.vt7-profile-hero h2');if(profileTitle)profileTitle.textContent=VT9_DISPLAY_NAME;
  const profileContext=document.querySelector('.vt7-profile-hero p');if(profileContext)profileContext.textContent=`Empresária · ${VT9_DISTRICT_LABEL} · Serra · Espírito Santo`;
  document.querySelectorAll('.vt7-quick-actions .quick').forEach(button=>{
    const title=button.querySelector('strong');
    if(!title||!['Abrir Tupperware','Tupper.NET'].includes(title.textContent.trim()))return;
    title.textContent='Tupper.NET';
    const subtitle=button.querySelector('span');if(subtitle)subtitle.textContent='Abrir portal de pedidos';
  });
  if(state?.social&&typeof PORTAL_URL!=='undefined'&&state.social.portalUrl!==PORTAL_URL){state.social.portalUrl=PORTAL_URL;save()}
}

document.addEventListener('submit',event=>{if(event.target?.id!=='loginForm')return;const handle=document.getElementById('loginHandle');if(!handle)return;if(String(handle.value||'').trim().toLowerCase()===VT9_VISIBLE_HANDLE)handle.value=VT9_LEGACY_HANDLE;setTimeout(vt9ApplyPilotIdentity,0)},true);
if(typeof render==='function'){const vt9BaseRender=render;render=function(){vt9BaseRender();vt9ApplyPilotIdentity()}}
vt9ApplyPilotIdentity();
