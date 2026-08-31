import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app.css', import.meta.url), 'utf8');
const js = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const hotfix = readFileSync(new URL('../hotfix.js', import.meta.url), 'utf8');
const hotfixCss = readFileSync(new URL('../hotfix.css', import.meta.url), 'utf8');
const bundle = `${html}\n${css}\n${js}\n${hotfix}\n${hotfixCss}`;

describe('VoeTupper utility-first pilot', () => {
  it('keeps a useful operational contract in the progressive shell', () => {
    expect(html).toContain('O que precisa ser resolvido');
    expect(html).toContain('Próxima ação');
    expect(html).toContain('Sem pedido');
    expect(html).toContain('Portal');
    expect(html).toContain('Print');
    expect(html).toContain('data-cycle="vitrine"');
    expect(html).toContain('data-cycle="semana"');
    expect(js).toContain("week:'35/2026',vitrine:'08/2026'");
    expect(js).toContain("week:'36/2026',vitrine:'09/2026'");
    expect(hotfix).toContain("w35.vitrine='09/2026'");
    expect(js).toContain('function closingLabel');
  });

  it('keeps the real operational order workflow across static assets', () => {
    for (const field of ['Recebi por','Resumo / itens','Qtd.','Valor','Pagamento','Portal','Print','Próxima ação']) {
      expect(bundle).toContain(field);
    }
    for (const state of ['RECEBIDO','CONFERIDO','NO PORTAL','PRINT ENVIADO','FINALIZADO','CANCELADO']) {
      expect(js).toContain(state);
    }
    expect(js).toContain('function nextAction');
    expect(js).toContain('function cancelOrder');
    expect(js).toContain('localStorage');
    for (const action of ['conferir','portal','print','finalizar','cancelar']) {
      expect(bundle).toContain(`data-action="${action}"`);
    }
  });

  it('removes AI-looking motivational filler and oversized hero copy', () => {
    for (const copy of ['A gente junto, voa mais alto','Você está voando','Seu negócio, do seu jeito','Rumo ao próximo nível','Bom dia! 🌸']) {
      expect(bundle).not.toContain(copy);
    }
  });

  it('keeps restrained pink branding and responsive navigation', () => {
    expect(css).toContain('--pink:#e91e63');
    expect(html).toContain('VoeTupper');
    expect(css).toContain('.sidebar');
    expect(css).toContain('.mobile-nav');
    expect(hotfixCss).toContain('.team-columns');
    expect(hotfixCss).toContain('.team-kpis');
    expect(js).toContain('function nav()');
  });

  it('loads versioned recovery assets and both scripts parse', () => {
    expect(html).toContain('src="./app.js?v=4"');
    expect(html).toContain('src="./hotfix.js?v=4"');
    expect(html).toContain('href="./hotfix.css?v=4"');
    expect(hotfix).toContain('Só remove a chave depois de persistir os dados com sucesso.');
    expect(() => new Function(js)).not.toThrow();
    expect(() => new Function(hotfix)).not.toThrow();
  });
});
