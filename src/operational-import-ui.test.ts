import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../index.html', import.meta.url),'utf8');
const js = readFileSync(new URL('../operational-import.js', import.meta.url),'utf8');
const csv = readFileSync(new URL('../operational-import-csv.js', import.meta.url),'utf8');
const review = readFileSync(new URL('../operational-import-review.js', import.meta.url),'utf8');

describe('safe operational import UI', () => {
  it('loads the admin import modules without persisting uploaded rows locally', () => {
    expect(html).toContain('operational-import.js');
    expect(html).toContain('operational-import-csv.js');
    expect(html).toContain('operational-import-review.js');
    for (const source of [js,csv,review]) {
      expect(source).not.toContain('localStorage.setItem');
      expect(source).not.toContain('sessionStorage.setItem');
    }
  });

  it('keeps all static import scripts syntactically valid', () => {
    for (const source of [js,csv,review]) expect(()=>new Function(source)).not.toThrow();
  });

  it('implements the four-step preview workflow', () => {
    for (const copy of ['1. Arquivo','2. Conferência','3. Pendências','4. Confirmar importação']) {
      expect(js).toContain(copy);
    }
    for (const capability of ['Mapeamento de colunas','Possíveis duplicidades','Nomes incompletos','Grupos desconhecidos','Comparação dos totais','Relatório de erros','Histórico de importações']) {
      expect(js).toContain(capability);
    }
  });

  it('never auto-merges identities or invents missing values', () => {
    expect(js).toContain('Confirmação administrativa obrigatória');
    expect(js).toContain('null');
    expect(js).not.toContain('autoMerge');
    expect(js).not.toContain('total+=(vo||0)+(rr||0)');
    expect(js).toContain('else if(vo!==null&&rr!==null)');
    expect(js).toContain('total+=vo+rr');
    expect(js).toContain("return'não informado'");
    expect(review).toContain('same_person_confirmed');
    expect(review).toContain('keep_separate');
    expect(review).toContain('não faz merge automático');
  });

  it('allows administrative correction of canonical name, group and role before submit', () => {
    expect(review).toContain('canonical_name');
    expect(review).toContain('corrected_group');
    expect(review).toContain('corrected_role');
    expect(review).toContain('vtImportApplyCorrection');
  });

  it('detects one delimiter per file so Brazilian decimal commas remain intact', () => {
    expect(csv).toContain('vtDetectDelimiter');
    expect(csv).toContain("if(fileType==='tsv')return '\\t'");
    expect(csv).toContain('ch===delimiter');
    expect(csv).not.toContain("ch===','||ch===';'");
  });
});