import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../index.html', import.meta.url),'utf8');
const js = readFileSync(new URL('../operational-import.js', import.meta.url),'utf8');
const csv = readFileSync(new URL('../operational-import-csv.js', import.meta.url),'utf8');

describe('safe operational import UI', () => {
  it('loads the admin import module without persisting uploaded rows locally', () => {
    expect(html).toContain('operational-import.js');
    expect(html).toContain('operational-import-csv.js');
    expect(js).not.toContain('localStorage.setItem');
    expect(js).not.toContain('sessionStorage.setItem');
    expect(csv).not.toContain('localStorage.setItem');
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
  });

  it('detects one delimiter per file so Brazilian decimal commas remain intact', () => {
    expect(csv).toContain('vtDetectDelimiter');
    expect(csv).toContain("if(fileType==='tsv')return '\\t'");
    expect(csv).toContain('ch===delimiter');
    expect(csv).not.toContain("ch===','||ch===';'");
  });
});
