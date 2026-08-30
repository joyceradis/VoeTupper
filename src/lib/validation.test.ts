import { describe,expect,it } from 'vitest';
import { consultantInput,orderInput } from './validation';
describe('input boundaries',()=>{it('rejects portal password fields',()=>{expect(consultantInput.safeParse({name:'Ana',status:'ACTIVE',password:'secret'}).success).toBe(false)});it('requires only useful order fields',()=>{expect(orderInput.safeParse({consultantId:'c1',weekId:'w1',source:'TEXT',summary:'2 potes'}).success).toBe(true)});});
