import { describe, expect, it } from 'vitest';
import { parseTeamCsv } from './parse-team';

describe('V3 team import', () => {
  it('normalizes a semicolon-separated team export', () => {
    const result = parseTeamCsv('nome;função;código;grupo;telefone\nAna;Líder;2001;Aurora;(27) 99999-0000', ['Aurora']);

    expect(result.rows[0]).toEqual({ name: 'Ana', role: 'LEADER', businessCode: '2001', group: 'Aurora', phone: '27999990000' });
    expect(result.errors).toEqual([]);
  });

  it('flags duplicate codes and unknown groups before saving', () => {
    const result = parseTeamCsv('nome,função,código,grupo\nAna,Consultora,1001,Aurora\nBia,Consultora,1001,Outro', ['Aurora']);

    expect(result.errors).toContainEqual(expect.objectContaining({ row: 3, code: 'DUPLICATE_CODE' }));
    expect(result.errors).toContainEqual(expect.objectContaining({ row: 3, code: 'UNKNOWN_GROUP' }));
  });
});
