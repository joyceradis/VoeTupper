'use client';

import React, { useState } from 'react';
import { parseTeamCsv } from '../import/parse-team';

export function TeamImport({ groups }: { groups: string[] }) {
  const [summary, setSummary] = useState<string | null>(null);
  async function selectFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const parsed = parseTeamCsv(await file.text(), groups);
    setSummary(parsed.errors.length ? `${parsed.rows.length} linhas encontradas. ${parsed.errors.length} precisam de revisão.` : `${parsed.rows.length} pessoas prontas para revisão.`);
  }
  return <article className="v3-import-card">
    <div><p className="v3-eyebrow">EQUIPE REAL</p><h2>Importar equipe</h2><p>Traga uma planilha CSV com nome, função, código, grupo e telefone. Nada é salvo antes da sua revisão.</p></div>
    <label htmlFor="v3-team-file">Escolher arquivo CSV</label>
    <input id="v3-team-file" type="file" accept=".csv,text/csv" onChange={selectFile} />
    {summary ? <p className="v3-import-summary" role="status">{summary}</p> : null}
  </article>;
}
