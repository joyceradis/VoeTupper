import { describe, expect, it } from 'vitest';
import { buildProvisioningPlan } from './plan';

describe('workspace provisioning',()=>{
 it('creates a unique workspace title and never reuses the master binding',()=>{
   const plan=buildProvisioningPlan({workspaceId:'ws-002',workspaceName:'Empresária Nova',templateSpreadsheetId:'template-1'});
   expect(plan.copySourceSpreadsheetId).toBe('template-1');
   expect(plan.destinationTitle).toContain('Empresária Nova');
   expect(plan.bindSpreadsheetId).toBeNull();
   expect(plan.config.Workspace).toBe('Empresária Nova');
   expect(plan.config.Distribuição).toBe('Vitoriaware / Grande Vitória');
 });
});
