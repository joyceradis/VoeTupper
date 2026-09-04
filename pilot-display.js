const VT9_VISIBLE_HANDLE='ritheli.radis';
const VT9_LEGACY_HANDLE='empresaria01-teste-master';
const VT9_DISPLAY_NAME='Ritheli Radis';
const VT9_DISTRICT_LABEL='Distrito Plenitude';
const VT9_REGION_LABEL='Serra / Espírito Santo';
const VT9_APPROVED_LOGO='./logo.svg?v=10';
let vt9ResolvedLogo='';

async function vt9ResolveApprovedLogo(){
  if(vt9ResolvedLogo)return vt9ResolvedLogo;
  try{
    const response=await fetch(VT9_APPROVED_LOGO,{cache:'no-store'});
    if(!response.ok)return'';
    const svg=await response.text();
    const marker='data:image/jpeg;base64,';
    const start=svg.indexOf(marker);
    if(start<0)return'';
    const dataStart=start+marker.length;
    let end=svg.indexOf('"',dataStart);
    if(end<0)end=svg.indexOf("'",dataStart);
    if(end<0)return'';
    const payload=svg.slice(dataStart,end).replace(/\s+/g,'');
    if(payload.length>100)vt9ResolvedLogo=marker+payload;
  }catch{}
  return vt9ResolvedLogo;
}

function vt9ApplyApprovedLogo(){
  const images=document.querySelectorAll('.brand-row>img,.login-brand img');
  if(!images.length)return;
  vt9ResolveApprovedLogo().then(src=>{
    if(!src)return;
    images.forEach(img=>{
      img.onerror=null;
      img.src=src;
      img.style.objectFit='contain';
    });
  });
}

function vt9ApplyPilotIdentity(){
  const handle=document.getElementById('loginHandle');if(handle&&String(handle.value||'').trim().toLowerCase()===VT9_LEGACY_HANDLE)handle.value=VT9_VISIBLE_HANDLE;
  const loginNote=document.querySelector('.login-note');if(loginNote)loginNote.textContent=`${VT9_DISPLAY_NAME} · ${VT9_DISTRICT_LABEL} · ${VT9_REGION_LABEL}`;
  document.querySelectorAll('.workspace-badge strong,.cycle > strong').forEach(el=>{el.textContent=VT9_DISPLAY_NAME});
  document.querySelectorAll('.workspace-badge span').forEach(el=>{el.textContent=`${VT9_DISTRICT_LABEL} · ${VT9_REGION_LABEL}`});
  const brandImg=document.querySelector('.brand-row>img');if(brandImg)brandImg.src='./logo.svg?v=9';
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