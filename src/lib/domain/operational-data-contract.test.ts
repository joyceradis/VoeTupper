import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function read(path:string){
  const url = new URL(`../../../${path}`, import.meta.url);
  return existsSync(url) ? readFileSync(url,'utf8') : '';
}

const schema = read('supabase/migrations/0005_operational_data.sql');
const admin = read('supabase/migrations/0006_admin_permissions.sql');
const seed = read('supabase/seed-operational-pilot.sql');

describe('operational data and import contract', () => {
  it('keeps canonical people separate from memberships and source names', () => {
    expect(schema).toContain('source_member_id');
    expect(schema).toContain('canonical_name');
    expect(schema).toContain('membership_status');
    expect(schema).toContain("add value if not exists 'RECRUIT'");
    expect(schema).toContain('public.member_aliases');
    expect(schema).toContain('normalized_variant');
    expect(schema).toContain('confirmed_by_person_id');
  });

  it('models periods and performance at district, group or member level', () => {
    expect(schema).toContain('public.periods');
    expect(schema).toContain('public.weekly_performance');
    expect(schema).toContain("aggregation_level in ('district','group','member')");
    expect(schema).toContain('person_id uuid references public.people');
    expect(schema).toContain('total_sales numeric(14,2) generated always as (veteran_sales + recruit_sales) stored');
    expect(schema).toContain("detail_status in ('fully_detailed','partially_detailed','aggregate_only')");
  });

  it('preserves unknown numeric facts as null instead of silently inventing zero', () => {
    expect(schema).toContain('veteran_sales numeric(14,2) check(veteran_sales is null or veteran_sales >= 0)');
    expect(schema).toContain('recruit_sales numeric(14,2) check(recruit_sales is null or recruit_sales >= 0)');
    expect(schema).not.toContain('veteran_sales numeric(14,2) not null default 0');
    expect(schema).not.toContain('recruit_sales numeric(14,2) not null default 0');
    expect(schema).toContain('order_difference integer generated always as (calculated_order_count - expected_order_count) stored');
    expect(schema).toContain('item_difference integer generated always as (calculated_item_quantity - expected_item_quantity) stored');
    expect(schema).toContain('sales_difference numeric(14,2) generated always as (calculated_total_sales - expected_total_sales) stored');
    expect(schema).not.toContain('coalesce(calculated_total_sales,0)-coalesce(expected_total_sales,0)');
  });

  it('keeps a temporary identity candidate key in staging rather than using names as primary keys', () => {
    expect(schema).toContain('identity_candidate_key text');
    expect(schema).toContain('district + normalized name + group');
    expect(schema).toContain('mapped_person_id uuid references public.people');
  });

  it('supports staged imports, quality issues and reconciliation before commit', () => {
    for (const table of ['import_batches','import_rows','import_issues','reconciliations']) {
      expect(schema).toContain(`public.${table}`);
    }
    expect(schema).toContain('raw_name text');
    expect(schema).toContain('raw_payload jsonb');
    expect(schema).toContain("status in ('preview','pending_review','ready','committed','rejected')");
    expect(schema).toContain('expected_total_sales');
    expect(schema).toContain('calculated_total_sales');
    expect(schema).toContain('sales_difference');
  });

  it('keeps recognition independent from current activity', () => {
    expect(schema).toContain('public.recognitions');
    expect(schema).toContain('position integer');
    expect(schema).toContain('period_label text');
    expect(schema).toContain('source text');
  });

  it('reserves identity, membership and imports for distribution/business-owner admins', () => {
    expect(admin).toContain('can_admin_scope');
    expect(admin).toContain("viewer.role = 'DISTRIBUTION'");
    expect(admin).toContain("viewer.role = 'BUSINESS_OWNER'");
    expect(admin).toContain('memberships_admin_write');
    expect(admin).toContain('import_batches_admin');
    expect(admin).toContain('weekly_performance_admin_write');
    expect(admin).not.toContain("viewer.role = 'LEADER' and public.can_admin_scope");
  });

  it('seeds only supplied pilot facts and does not invent missing identities', () => {
    expect(seed).toContain('Distrito Plenitude');
    expect(seed).toContain('pending_review');
    expect(seed).toContain('Vitoriaware');
    for (const group of ['Chama Viva','Charme','Chefas','Equipe Excelência','Esperança','Estrela do Sucesso','Fenomenal','Fidelidade','Force Active','Grandes Conquistas','Joia Rara','Mania de Vencer','Mima','Tropical','Tupper Amigas','Yeshua']) {
      expect(seed).toContain(group);
    }
    for (const weeklyComponents of [
      '131,1840,102810.40,2479.50',
      '50,766,36763.60,2001.30',
      '70,1099,50397.40,3258.20',
      '100,1332,71577.80,3687.30',
      '47,516,32557.70,802.20'
    ]) expect(seed).toContain(weeklyComponents);
    expect(seed).toContain("'total_sales',306335.40");
    expect(seed).toContain('5572.50');
    expect(seed).toContain('partial_name');
    expect(seed).not.toMatch(/@[a-z0-9.-]+\.[a-z]{2,}/i);
    expect(seed).not.toContain("legal_name,'JOENI FERNANDA CALDEIRA RA'");
  });
});