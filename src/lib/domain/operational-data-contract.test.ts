import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function read(path:string){
  const url = new URL(`../../../${path}`, import.meta.url);
  return existsSync(url) ? readFileSync(url,'utf8') : '';
}

const schema = read('supabase/migrations/0005_operational_data.sql');
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

  it('seeds only supplied pilot facts and does not invent missing identities', () => {
    expect(seed).toContain('Distrito Plenitude');
    expect(seed).toContain('Vitoriaware');
    for (const group of ['Chama Viva','Charme','Chefas','Equipe Excelência','Esperança','Estrela do Sucesso','Fenomenal','Fidelidade','Force Active','Grandes Conquistas','Joia Rara','Mania de Vencer','Mima','Tropical','Tupper Amigas','Yeshua']) {
      expect(seed).toContain(group);
    }
    for (const total of ['33359.90','75265.10','53655.60','38764.90','105289.90']) expect(seed).toContain(total);
    expect(seed).toContain('5572.50');
    expect(seed).toContain('partial_name');
    expect(seed).not.toMatch(/@[a-z0-9.-]+\.[a-z]{2,}/i);
    expect(seed).not.toContain("legal_name,'JOENI FERNANDA CALDEIRA RA'");
  });
});
