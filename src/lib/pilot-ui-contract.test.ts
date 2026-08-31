import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');

describe('VoeTupper operational PWA shell', () => {
  it('centers the work queue instead of a decorative dashboard', () => {
    expect(html).toContain('data-ui="work-queue"');
    expect(html).toContain('O que precisa ser resolvido');
    expect(html).toContain('Próxima ação');
    expect(html).toContain('Sem pedido');
    expect(html).toContain('Portal');
    expect(html).toContain('Print');
  });

  it('offers direct operational actions', () => {
    for (const action of ['conferir','portal','print','finalizar','cancelar']) {
      expect(html).toContain(`data-action="${action}"`);
    }
    expect(html).toContain('Tupper.NET');
  });

  it('keeps Vitrine and Semana visible as separate concepts', () => {
    expect(html).toContain('data-cycle="vitrine"');
    expect(html).toContain('data-cycle="semana"');
  });

  it('has a search-first team experience and short intake', () => {
    expect(html).toContain('Pesquisar nome, código ou telefone');
    expect(html).toContain('Resumo / itens');
    expect(html).toContain('Recebi por');
  });

  it('rejects the old AI-template voice', () => {
    for (const copy of ['A gente junto, voa mais alto','Você está voando','Rumo ao próximo nível','Bom dia! 🌸']) {
      expect(html).not.toContain(copy);
    }
  });
});
