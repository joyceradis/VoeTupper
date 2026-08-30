import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

describe('VoeTupper utility-first pilot', () => {
  it('renders useful operational information without depending on JavaScript', () => {
    expect(html).toContain('Vitrine 08/2026');
    expect(html).toContain('Semana 35/2026');
    expect(html).toContain('FECHAMENTO HOJE');
    expect(html).toContain('O que precisa ser resolvido');
    expect(html).toContain('Pedidos pendentes');
    expect(html).toContain('Portal');
    expect(html).toContain('Print');
    expect(html).toContain('Faturamento');
    expect(html).toContain('Meta');
    expect(html).toContain('Ação agora');
  });

  it('keeps the real operational order workflow', () => {
    for (const field of ['Recebi por','Resumo / itens','Qtd.','Valor','Pagamento','Conferido','Portal','Print','Finalizado','Cancelado','Próxima ação']) {
      expect(html).toContain(field);
    }
    expect(html).toContain('function nextAction');
    expect(html).toContain('function cancelOrder');
    expect(html).toContain('localStorage');
  });

  it('removes AI-looking motivational filler and oversized hero copy', () => {
    expect(html).not.toContain('A gente junto, voa mais alto');
    expect(html).not.toContain('Você está voando');
    expect(html).not.toContain('Seu negócio, do seu jeito');
    expect(html).not.toContain('Rumo ao próximo nível');
  });

  it('keeps restrained pink branding and responsive navigation', () => {
    expect(html).toContain('--pink:#e91e63');
    expect(html).toContain('VoeTupper');
    expect(html).toContain('class="sidebar"');
    expect(html).toContain('class="mobileNav"');
  });

  it('has JavaScript that parses before first interaction', () => {
    const match = html.match(/<script>([\s\S]*?)<\/script>/);
    expect(match?.[1]).toBeTruthy();
    expect(() => new Function(match![1])).not.toThrow();
  });
});
