function vtDetectDelimiter(text,fileType){
  if(fileType==='tsv')return '\t';
  const line=String(text||'').split(/\r?\n/).find(x=>x.trim())||'';
  const counts={';':0,',':0,'\t':0};let quoted=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='"'){quoted=!quoted;continue}
    if(!quoted&&Object.prototype.hasOwnProperty.call(counts,ch))counts[ch]++;
  }
  return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||';';
}
function vtParseDelimited(text,fileType){
  const delimiter=vtDetectDelimiter(text,fileType),rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i],next=text[i+1];
    if(ch==='"'&&quoted&&next==='"'){cell+='"';i++;continue}
    if(ch==='"'){quoted=!quoted;continue}
    if(!quoted&&ch===delimiter){row.push(cell);cell='';continue}
    if(!quoted&&(ch==='\n'||ch==='\r')){
      if(ch==='\r'&&next==='\n')i++;
      row.push(cell);cell='';if(row.some(x=>String(x).trim()!==''))rows.push(row);row=[];continue;
    }
    cell+=ch;
  }
  row.push(cell);if(row.some(x=>String(x).trim()!==''))rows.push(row);
  if(!rows.length)return{headers:[],rows:[],delimiter};
  const headers=rows.shift().map((h,i)=>String(h).trim()||`Coluna ${i+1}`);
  return{headers,rows:rows.map(cols=>Object.fromEntries(headers.map((h,i)=>[h,cols[i]??'']))),delimiter};
}
window.vtParseDelimited=vtParseDelimited;
window.vtHandleImportFile=async function(input){
  const file=input.files?.[0];if(!file)return;
  vtImportSession.fileName=file.name;vtImportSession.fileType=file.name.split('.').pop()?.toLowerCase()||null;
  if(!['csv','txt','tsv'].includes(vtImportSession.fileType)){
    vtImportSession.headers=[];vtImportSession.rows=[];vtImportSession.mapping={};
    vtImportSession.issues=[{type:'backend_required',row:null,label:'Arquivo',message:'Planilhas XLS/XLSX serão processadas pelo backend seguro; o frontend não lê nem persiste esses dados.'}];
    vtImportSession.step=2;vtRenderImportModal();return;
  }
  const parsed=vtParseDelimited(await file.text(),vtImportSession.fileType);
  vtImportSession.headers=parsed.headers;vtImportSession.rows=parsed.rows;vtImportSession.mapping=vtInferMapping(parsed.headers);
  vtImportSession.step=2;vtAnalyzeImport();vtRenderImportModal();
};
