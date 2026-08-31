export type WorkspaceRole='owner'|'member';
export type WorkspaceMembership={workspaceId:string;userId:string;role:WorkspaceRole};
export type WorkspaceSheetBinding={workspaceId:string;spreadsheetId:string;templateVersion:string;distribution:'Vitoriaware';state:'Espírito Santo'};
export type WorkspaceProfile={id:string;name:string;region:string;distribution:'Vitoriaware';sheet:WorkspaceSheetBinding};
