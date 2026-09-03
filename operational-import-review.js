function vtImportCorrection(index){
  if(!vtImportSession.corrections.has(index))vtImportSession.corrections.set(index,{canonical_name:null,group:null,role:null,identity_action:'review'});
  return vtImportSession.corrections.get(index);
}
window.vtImportApplyCorrection=function(index,key,value){
  const current=vtImportCorrection(index);current[key]=value===''?null:value;vtImportSession.corrections.set(index,current);
};
function vtImportRowsNeedingReview(){
  const rows=new Set(vtImportSession.issues.filter(i=>i.row).map(i=>i.row-2));
  return [...rows].filter(i=>i>=0&&i<vtImportSession.rows.length).sort((a,b)=>a-b);
}
function vtImportReviewTable(){
  const indexes=vtImportRowsNeedingReview();
  if(!indexes.length)return `<section class="vt-import-section"><h3>Correções antes da gravação</h3><div class="vt-import-empty"><strong>Nenhuma correção obrigatória</strong><p>O lote não apresentou nome incompleto, grupo desconhecido ou duplicidade na prévia.</p></div></section>`;
  return `<section class="vt-import-section"><h3>Correções antes da gravação</h3><p>O valor bruto nunca é substituído. As correções alimentam os campos canônicos do lote administrativo.</p><div class="vt-import-table"><table><thead><tr><th>Linha</th><th>Nome bruto</th><th>Nome canônico</th><th>Grupo</th><th>Papel</th><th>Identidade</th></tr></thead><tbody>${indexes.map(index=>{
    const row=vtImportSession.rows[index],c=vtImportCorrection(index),rawName=vtMapped(row,'name')||'',rawGroup=vtMapped(row,'group')||'';
    const duplicate=vtImportSession.issues.some(i=>i.row===index+2&&i.type==='duplicate_member');
    return `<tr><td>${index+2}</td><td>${vtImportEsc(rawName)}</td><td><input value="${vtImportEsc(c.canonical_name||'')}" placeholder="deixe vazio se incerto" oninput="vtImportApplyCorrection(${index},'canonical_name',this.value)"></td><td><select onchange="vtImportApplyCorrection(${index},'group',this.value)"><option value="">${vtImportEsc(rawGroup||'não informado')}</option>${VT_IMPORT_GROUPS.map(g=>`<option ${c.group===g?'selected':''}>${vtImportEsc(g)}</option>`).join('')}</select></td><td><select onchange="vtImportApplyCorrection(${index},'role',this.value)"><option value="">não alterar</option><option value="CONSULTANT" ${c.role==='CONSULTANT'?'selected':''}>Consultora</option><option value="RECRUIT" ${c.role==='RECRUIT'?'selected':''}>Recruta</option><option value="LEADER" ${c.role==='LEADER'?'selected':''}>Líder</option></select></td><td>${duplicate?`<select onchange="vtImportApplyCorrection(${index},'identity_action',this.value)"><option value="review" ${c.identity_action==='review'?'selected':''}>revisar</option><option value="keep_separate" ${c.identity_action==='keep_separate'?'selected':''}>manter separadas</option><option value="same_person_confirmed" ${c.identity_action==='same_person_confirmed'?'selected':''}>confirmar mesma pessoa</option></select>`:'sem conflito'}</td></tr>`
  }).join('')}</tbody></table></div><small>Confirmar “mesma pessoa” não faz merge automático no frontend; apenas registra a decisão para o backend administrativo.</small></section>`;
}
function vtImportUnresolvedIssues(){
  return vtImportSession.issues.filter(issue=>{
    if(!issue.row)return ['missing_period','total_mismatch','expected_mismatch'].includes(issue.type);
    const index=issue.row-2,c=vtImportCorrection(index);
    if(issue.type==='partial_name')return !c.canonical_name;
    if(issue.type==='unknown_group')return !c.group||!vtKnownGroup(c.group);
    if(issue.type==='duplicate_member')return !['keep_separate','same_person_confirmed'].includes(c.identity_action);
    return issue.type==='total_mismatch';
  });
}
const vtImportBodyBase=vtImportBody;
vtImportBody=function(){
  if(vtImportSession.step!==3)return vtImportBodyBase();
  return `${vtImportIssues()}${vtImportTotals()}${vtImportReviewTable()}<div class="modal-actions"><button class="btn" onclick="vtImportSession.step=2;vtRenderImportModal()">Voltar</button><button class="btn primary" onclick="vtPrepareImport()">Preparar confirmação</button></div>`;
};
window.vtPrepareImport=function(){
  vtAnalyzeImport();
  const unresolved=vtImportUnresolvedIssues();
  vtImportSession.preparedPayload={
    period:{...vtImportSession.period},file_name:vtImportSession.fileName||null,mapping:{...vtImportSession.mapping},
    row_count:vtImportSession.rows.length,totals:{...vtImportSession.metrics},issues:vtImportSession.issues.map(i=>({...i})),
    unresolved_issues:unresolved.map(i=>({...i})),
    rows:vtImportSession.rows.map((row,index)=>{
      const c=vtImportSession.corrections.get(index)||{};
      return{
        raw_name:vtMapped(row,'name')||null,
        canonical_name:c.canonical_name||null,
        raw_group_name:vtMapped(row,'group')||null,
        corrected_group:c.group||null,
        corrected_role:c.role||null,
        identity_action:c.identity_action||null,
        raw_payload:{...row}
      };
    }),
    status:unresolved.length?'pending_review':'ready'
  };
  vtImportSession.step=4;vtRenderImportModal();
};
