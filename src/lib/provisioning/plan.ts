export type ProvisioningInput={workspaceId:string;workspaceName:string;templateSpreadsheetId:string;role?:'EMPRESÁRIA'|'LÍDER'};
export function buildProvisioningPlan(input:ProvisioningInput){
 const role=input.role??'EMPRESÁRIA';
 return{
  workspaceId:input.workspaceId,
  copySourceSpreadsheetId:input.templateSpreadsheetId,
  destinationTitle:`VoeTupper — ${input.workspaceName} — Vitoriaware`,
  bindSpreadsheetId:null as string|null,
  config:{Produto:'VoeTupper','Versão template':'Vitoriaware Template 1.0',Distribuição:'Vitoriaware / Grande Vitória',Estado:'Espírito Santo',Workspace:input.workspaceName,'Papel principal':role}
 };
}
