import { describe, expect, it } from 'vitest';
import { buildTodaySummary } from './dashboard';
import type { Consultant, Order, Week } from './types';
const week:Week={id:'w1',label:'35/2026',campaignId:'c1',closesAt:'2026-08-31T23:59:00-03:00',teamGoal:1000,status:'ACTIVE'};
const consultants:Consultant[]=[{id:'a',name:'Ana',status:'ACTIVE'},{id:'b',name:'Bia',status:'ACTIVE'}];
const orders:Order[]=[{id:'o1',consultantId:'a',weekId:'w1',source:'TEXT',summary:'Pedido',amount:300,stage:'COMPLETED',createdAt:'2026-08-30'},{id:'o2',consultantId:'b',weekId:'w1',source:'AUDIO',summary:'Pedido',amount:200,stage:'ORGANIZED',createdAt:'2026-08-30'}];
describe('today summary',()=>{it('derives action metrics without duplicated stored totals',()=>{const s=buildTodaySummary({week,orders,consultants,offers:[]});expect(s.pendingCount).toBe(1);expect(s.portalPendingCount).toBe(1);expect(s.noOrderCount).toBe(1);expect(s.realized).toBe(500);expect(s.progress).toBe(.5);});});
