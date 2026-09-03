const VT_IMPORT_GROUPS=['Chama Viva','Charme','Chefas','Equipe Excelência','Esperança','Estrela do Sucesso','Fenomenal','Fidelidade','Force Active','Grandes Conquistas','Joia Rara','Mania de Vencer','Mima','Tropical','Tupper Amigas','Yeshua'];
const VT_IMPORT_FIELDS=[
  ['name','Nome da pessoa'],['group','Grupo'],['role','Papel'],['orders','Pedidos'],['items','Quantidade'],
  ['veteran','Vendas veteranas'],['recruit','Vendas recrutas'],['total','Vendas totais']
];
let vtImportSession=null;

function vtImportEmpty(){return{
  step:1,fileName:null,fileType:null,headers:[],rows:[],mapping:{},issues:[],metrics:null,
  period:{week:null,year:null},expected:{orders:null,items:null,veteran:null,recruit:null,total:null},
  corrections:new Map(),preparedPayload:null
}}
function vtNorm(v=''){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ')}
function vtNum(v){if(v===null||v===undefined||String(v).trim()==='')return null;let s=String(v).trim().replace(/R\$\s?/gi,'').replace(/\s/g,'');if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');else if(s.includes(','))s=s.replace(',','.');const n=Number(s.replace(/[^0-9.-]/g,''));return Number.isFinite(n)?n:null}
function vtImportEsc(v=''){return typeof esc==='function'?esc(String(v)):String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function vtCsvParse(text){
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i],next=text[i+1];
    if(ch==='"'&&quoted&&next==='"'){cell+='"';i++;continue}
    if(ch==='"'){quoted=!quoted;continue}
    if(!quoted&&(ch===','||ch===';'||ch==='\t')){row.push(cell);cell='';continue}
    if(!quoted&&(ch==='\n'||ch==='\r')){if(ch==='\r'&&next==='\n')i++;row.push(cell);cell='';if(row.some(x=>String(x).trim()!==''))rows.push(row);row=[];continue}
    cell+=ch;
  }
  row.push(cell);if(row.some(x=>String(x).trim()!==''))rows.push(row);
  if(!rows.length)return{headers:[],rows:[]};
  const headers=rows.shift().map((h,i)=>String(h).trim()||`Coluna ${i+1}`);
  return{headers,rows:rows.map(cols=>Object.fromEntries(headers.map((h,i)=>[h,cols[i]??''])))}
}
function vtInferMapping(headers){
  const map={},patterns={
    name:['nome','consultora','membro','pessoa'],group:['grupo','equipe'],role:['papel','cargo','funcao','função'],
    orders:['pedido','pedidos'],items:['quantidade','itens','qtd'],veteran:['veterana','veteranas','veteran_sales'],
    recruit:['recruta','recrutas','recruit_sales'],total:['total','vendas totais','total_sales']
  };
  for(const [key,terms] of Object.entries(patterns)){
    const found=headers.find(h=>terms.some(t=>vtNorm(h).includes(vtNorm(t))));if(found)map[key]=found;
  }
  return map;
}
function vtMapped(row,key){const h=vtImportSession?.mapping?.[key];return h?row[h]:null}
function vtNameLooksPartial(name){const s=String(name||'').trim();if(!s)return true;const parts=s.split(/\s+/);return parts.length<2||parts.at(-1).length<=2}
function vtKnownGroup(name){const n=vtNorm(name);return VT_IMPORT_GROUPS.find(g=>vtNorm(g)===n)||null}
function vtAnalyzeImport(){
  const s=vtImportSession,issues=[],seen=new Map();let orders=0,items=0,veteran=0,recruit=0,total=0;
  const measured={orders:false,items:false,veteran:false,recruit:false,total:false};
  s.rows.forEach((row,index)=>{
    const rawName=vtMapped(row,'name'),rawGroup=vtMapped(row,'group');
    const name=rawName?String(rawName).trim():null,group=rawGroup?String(rawGroup).trim():null;
    const key=name&&group?`${vtNorm(name)}|${vtNorm(group)}`:null;
    if(key){if(seen.has(key))issues.push({type:'duplicate_member',row:index+2,label:'Possíveis duplicidades',message:`Possível duplicidade com a linha ${seen.get(key)}. Confirmação administrativa obrigatória.`});else seen.set(key,index+2)}
    if(name&&vtNameLooksPartial(name))issues.push({type:'partial_name',row:index+2,label:'Nomes incompletos',message:'Nome possivelmente truncado. Manter canonical_name = null até confirmação.'});
    if(group&&!vtKnownGroup(group))issues.push({type:'unknown_group',row:index+2,label:'Grupos desconhecidos',message:`Grupo “${group}” não reconhecido. Não será criado automaticamente.`});
    const vo=vtNum(vtMapped(row,'veteran')),rr=vtNum(vtMapped(row,'recruit')),tt=vtNum(vtMapped(row,'total'));
    if(vo!==null&&rr!==null&&tt!==null&&Math.abs((vo+rr)-tt)>0.009)issues.push({type:'total_mismatch',row:index+2,label:'Comparação dos totais',message:'Total informado difere de veteranas + recrutas.'});
    const o=vtNum(vtMapped(row,'orders')),it=vtNum(vtMapped(row,'items'));
    if(o!==null){orders+=o;measured.orders=true}if(it!==null){items+=it;measured.items=true}if(vo!==null){veteran+=vo;measured.veteran=true}if(rr!==null){recruit+=rr;measured.recruit=true}if(tt!==null){total+=tt;measured.total=true}else if(vo!==null&&rr!==null){total+=vo+rr;measured.total=true}
  });
  if(!s.period.week||!s.period.year)issues.push({type:'missing_period',row:null,label:'Período',message:'Semana e ano precisam ser informados antes da importação.'});
  const calc={orders:measured.orders?orders:null,items:measured.items?items:null,veteran:measured.veteran?veteran:null,recruit:measured.recruit?recruit:null,total:measured.total?total:null};
  const expected=s.expected;
  for(const k of ['orders','items','veteran','recruit','total'])if(expected[k]!==null){
    if(calc[k]===null)issues.push({type:'expected_mismatch',row:null,label:'Comparação dos totais',message:`${k}: não há valor calculável para comparar com o total transcrito.`});
    else if(Math.abs(calc[k]-expected[k])>0.009)issues.push({type:'expected_mismatch',row:null,label:'Comparação dos totais',message:`${k}: calculado ${calc[k].toFixed(2)} ≠ transcrito ${Number(expected[k]).toFixed(2)}.`});
  }
  s.issues=issues;s.metrics=calc;return s;
}
function vtImportSetMapping(key,value){vtImportSession.mapping[key]=value||null;vtAnalyzeImport();vtRenderImportModal()}
function vtImportSetPeriod(key,value){vtImportSession.period[key]=value?Number(value):null;vtAnalyzeImport();vtRenderImportModal()}
function vtImportSetExpected(key,value){vtImportSession.expected[key]=value===''?null:vtNum(value);vtAnalyzeImport();vtRenderImportModal()}
function vtImportLoadPilotReference(){
  vtImportSession.period={week:36,year:2026};
  vtImportSession.expected={orders:47,items:516,veteran:32557.70,recruit:802.20,total:33359.90};
  vtAnalyzeImport();vtRenderImportModal();
}
async function vtHandleImportFile(input){
  const file=input.files?.[0];if(!file)return;vtImportSession.fileName=file.name;vtImportSession.fileType=file.name.split('.').pop()?.toLowerCase()||null;
  if(vtImportSession.fileType!=='csv'&&vtImportSession.fileType!=='txt'&&vtImportSession.fileType!=='tsv'){
    vtImportSession.headers=[];vtImportSession.rows=[];vtImportSession.mapping={};vtImportSession.issues=[{type:'backend_required',row:null,label:'Arquivo',message:'Planilhas XLS/XLSX serão processadas pelo backend seguro; o frontend não lê nem persiste esses dados.'}];vtImportSession.step=2;vtRenderImportModal();return;
  }
  const parsed=vtCsvParse(await file.text());vtImportSession.headers=parsed.headers;vtImportSession.rows=parsed.rows;vtImportSession.mapping=vtInferMapping(parsed.headers);vtImportSession.step=2;vtAnalyzeImport();vtRenderImportModal();
}
function vtImportSteps(){return `<div class="vt-import-steps"><span class="${vtImportSession.step===1?'active':''}">1. Arquivo</span><span class="${vtImportSession.step===2?'active':''}">2. Conferência</span><span class="${vtImportSession.step===3?'active':''}">3. Pendências</span><span class="${vtImportSession.step===4?'active':''}">4. Confirmar importação</span></div>`}
function vtImportMap(){return `<section class="vt-import-section"><h3>Mapeamento de colunas</h3><div class="vt-import-map">${VT_IMPORT_FIELDS.map(([key,label])=>`<label><span>${label}</span><select onchange="vtImportSetMapping('${key}',this.value)"><option value="">não informado</option>${vtImportSession.headers.map(h=>`<option ${vtImportSession.mapping[key]===h?'selected':''}>${vtImportEsc(h)}</option>`).join('')}</select></label>`).join('')}</div></section>`}
function vtImportExpected(){const e=vtImportSession.expected,p=vtImportSession.period;return `<section class="vt-import-section"><div class="vt-import-section-head"><h3>Comparação dos totais</h3><button class="mini" onclick="vtImportLoadPilotReference()">Usar referência 36/2026</button></div><div class="vt-import-map"><label><span>Semana</span><input type="number" min="1" max="53" value="${p.week??''}" onchange="vtImportSetPeriod('week',this.value)"></label><label><span>Ano</span><input type="number" value="${p.year??''}" onchange="vtImportSetPeriod('year',this.value)"></label>${[['orders','Pedidos'],['items','Itens'],['veteran','Veteranas'],['recruit','Recrutas'],['total','Total']].map(([k,l])=>`<label><span>${l}</span><input value="${e[k]??''}" onchange="vtImportSetExpected('${k}',this.value)"></label>`).join('')}</div></section>`}
function vtImportPreview(){
  if(!vtImportSession.rows.length)return `<div class="vt-import-empty"><strong>${vtImportEsc(vtImportSession.fileName||'Nenhum arquivo')}</strong><p>${vtImportSession.issues[0]?.message||'Envie um CSV para gerar a pré-visualização dos registros.'}</p></div>`;
  const cols=vtImportSession.headers.slice(0,6);return `<section class="vt-import-section"><h3>Pré-visualização dos registros</h3><div class="vt-import-table"><table><thead><tr>${cols.map(h=>`<th>${vtImportEsc(h)}</th>`).join('')}</tr></thead><tbody>${vtImportSession.rows.slice(0,8).map(r=>`<tr>${cols.map(h=>`<td>${vtImportEsc(r[h]??'')}</td>`).join('')}</tr>`).join('')}</tbody></table></div><small>${vtImportSession.rows.length} linhas lidas apenas em memória.</small></section>`
}
function vtImportIssues(){
  const issues=vtImportSession.issues;const groups={};for(const i of issues)(groups[i.label]??=[]).push(i);
  const wanted=['Possíveis duplicidades','Nomes incompletos','Grupos desconhecidos','Comparação dos totais'];
  return `<section class="vt-import-section"><h3>Relatório de erros</h3>${wanted.map(label=>{const arr=groups[label]||[];return `<div class="vt-import-issue ${arr.length?'warn':'ok'}"><strong>${label}</strong><span>${arr.length?`${arr.length} ocorrência${arr.length===1?'':'s'}`:'nenhuma ocorrência'}</span>${arr.slice(0,4).map(x=>`<small>${x.row?`Linha ${x.row}: `:''}${vtImportEsc(x.message)}</small>`).join('')}</div>`}).join('')}${issues.filter(i=>!wanted.includes(i.label)).map(i=>`<div class="vt-import-issue warn"><strong>${vtImportEsc(i.label)}</strong><small>${vtImportEsc(i.message)}</small></div>`).join('')}</section>`
}
function vtImportMetric(value,money=false){if(value===null||value===undefined)return'não informado';if(money)return typeof fmtMoney==='function'?fmtMoney(value):Number(value).toFixed(2);return value}
function vtImportTotals(){const m=vtImportSession.metrics;if(!m)return'';return `<div class="vt-import-totals"><div><strong>${vtImportMetric(m.orders)}</strong><span>pedidos</span></div><div><strong>${vtImportMetric(m.items)}</strong><span>itens</span></div><div><strong>${vtImportMetric(m.veteran,true)}</strong><span>veteranas</span></div><div><strong>${vtImportMetric(m.recruit,true)}</strong><span>recrutas</span></div><div><strong>${vtImportMetric(m.total,true)}</strong><span>total</span></div></div>`}
function vtPrepareImport(){
  vtAnalyzeImport();const blocking=vtImportSession.issues.some(i=>['missing_period','total_mismatch','expected_mismatch','unknown_group','duplicate_member'].includes(i.type));
  vtImportSession.preparedPayload={
    period:{...vtImportSession.period},file_name:vtImportSession.fileName||null,mapping:{...vtImportSession.mapping},
    row_count:vtImportSession.rows.length,totals:{...vtImportSession.metrics},issues:vtImportSession.issues.map(i=>({...i})),
    rows:vtImportSession.rows.map(row=>({raw_name:vtMapped(row,'name')||null,raw_group_name:vtMapped(row,'group')||null,raw_payload:{...row}})),
    status:blocking?'pending_review':'ready'
  };vtImportSession.step=4;vtRenderImportModal();
}
async function vtConfirmImport(){
  if(!vtImportSession.preparedPayload)return vtPrepareImport();
  if(typeof window.vtSubmitOperationalImport!=='function')return alert('Prévia concluída. A gravação real só será liberada quando o backend autenticado estiver conectado. Nenhum dado deste arquivo foi salvo no navegador.');
  await window.vtSubmitOperationalImport(vtImportSession.preparedPayload);
}
function vtImportHistory(){return `<section class="vt-import-section"><h3>Histórico de importações</h3><div class="vt-import-empty"><p>O histórico será carregado do backend autenticado por import_batch_id. Nada é armazenado localmente.</p></div></section>`}
function vtImportBody(){
  if(vtImportSession.step===1)return `<section class="vt-import-section"><h3>1. Arquivo</h3><p>CSV é pré-visualizado localmente, somente em memória. XLS/XLSX fica reservado ao backend seguro.</p><label class="vt-import-drop"><input type="file" accept=".csv,.txt,.tsv,.xls,.xlsx" onchange="vtHandleImportFile(this)"><strong>Selecionar CSV ou planilha</strong><span>O arquivo não é gravado no navegador.</span></label></section>${vtImportHistory()}`;
  if(vtImportSession.step===2)return `${vtImportExpected()}${vtImportMap()}${vtImportPreview()}${vtImportTotals()}<div class="modal-actions"><button class="btn" onclick="vtImportSession.step=1;vtRenderImportModal()">Voltar</button><button class="btn primary" onclick="vtAnalyzeImport();vtImportSession.step=3;vtRenderImportModal()">Revisar pendências</button></div>`;
  if(vtImportSession.step===3)return `${vtImportIssues()}${vtImportTotals()}<section class="vt-import-section"><h3>Correções antes da gravação</h3><p>Nome, grupo e papel serão corrigidos no lote administrativo. Nenhuma identidade é mesclada automaticamente. <strong>Confirmação administrativa obrigatória.</strong></p></section><div class="modal-actions"><button class="btn" onclick="vtImportSession.step=2;vtRenderImportModal()">Voltar</button><button class="btn primary" onclick="vtPrepareImport()">Preparar confirmação</button></div>`;
  const p=vtImportSession.preparedPayload;return `<section class="vt-import-section"><h3>4. Confirmar importação</h3><div class="vt-import-confirm"><strong>${p?.status==='ready'?'Lote pronto':'Lote requer revisão'}</strong><p>${p?.row_count||0} registros preparados. Valores desconhecidos permanecem como <code>null</code>. Nenhuma pessoa fictícia é criada para fechar totais agregados.</p></div></section>${vtImportIssues()}<div class="modal-actions"><button class="btn" onclick="vtImportSession.step=3;vtRenderImportModal()">Voltar</button><button class="btn primary" onclick="vtConfirmImport()">Confirmar no backend</button></div>`;
}
function vtRenderImportModal(){
  modal=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><section class="modal vt-import-modal"><div class="modal-head"><div><div class="eyebrow">ADMIN · IMPORTAÇÃO</div><h2>Importar resultados</h2><p>Prévia, qualidade dos dados e conciliação antes de qualquer gravação.</p></div><button class="icon-close" onclick="closeModal()">×</button></div>${vtImportSteps()}${vtImportBody()}</section></div>`;render();
}
window.vtOpenOperationalImport=function(){vtImportSession=vtImportEmpty();vtRenderImportModal()};
window.vtHandleImportFile=vtHandleImportFile;window.vtImportSetMapping=vtImportSetMapping;window.vtImportSetPeriod=vtImportSetPeriod;window.vtImportSetExpected=vtImportSetExpected;window.vtImportLoadPilotReference=vtImportLoadPilotReference;window.vtPrepareImport=vtPrepareImport;window.vtConfirmImport=vtConfirmImport;window.vtRenderImportModal=vtRenderImportModal;

if(typeof profileView==='function'){
  const vtBaseProfileView=profileView;
  profileView=function(){return `${vtBaseProfileView()}<section class="panel vt-import-entry"><div><div class="eyebrow">ADMINISTRAÇÃO</div><h2>Importação e conciliação</h2><p>Pré-visualize arquivos, confira duplicidades, nomes incompletos, grupos e totais antes de gravar.</p></div><button class="btn primary" onclick="vtOpenOperationalImport()">Importar resultados</button></section>`}
}
if(typeof isSignedIn==='function'&&isSignedIn())render();