import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app.css', import.meta.url), 'utf8');
const js = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const hotfix = readFileSync(new URL('../hotfix.js', import.meta.url), 'utf8');
const hotfixCss = readFileSync(new URL('../hotfix.css', import.meta.url), 'utf8');
let product = '';
let productCss = '';
try { product = readFileSync(new URL('../product-v6.js', import.meta.url), 'utf8'); } catch {}
try { productCss = readFileSync(new URL('../product-v6.css', import.meta.url), 'utf8'); } catch {}
const bundle = `${html}\n${css}\n${js}\n${hotfix}\n${hotfixCss}\n${product}\n${productCss}`;

describe('VoeTupper utility-first pilot', () => {
  it('keeps a useful operational contract in the progressive shell', () => {
    expect(html).toContain('O que precisa ser resolvido');
    expect(html).toContain('Próxima ação');
    expect(html).toContain('Sem pedido');
    expect(html).toContain('Portal');
    expect(html).toContain('Print');
    expect(html).toContain('data-cycle="vitrine"');
    expect(html).toContain('data-cycle="semana"');
    expect(js).toContain("week:'36/2026',vitrine:'09/2026'");
    expect(hotfix).toContain("w35.vitrine='09/2026'");
    expect(js).toContain('function closingLabel');
  });

  it('keeps the real operational order workflow across static assets', () => {
    for (const field of ['Recebi por','Resumo / itens','Qtd.','Valor','Pagamento','Portal','Print','Próxima ação']) expect(bundle).toContain(field);
    for (const state of ['RECEBIDO','CONFERIDO','NO PORTAL','PRINT ENVIADO','FINALIZADO','CANCELADO']) expect(js).toContain(state);
    expect(js).toContain('function nextAction');
    expect(js).toContain('function cancelOrder');
    expect(js).toContain('localStorage');
  });

  it('makes the team directory operational for the Vitoriaware workflow', () => {
    for (const copy of ['Copiar código','Copiar senha','H / RECADASTRAR','Líder responsável','Grupo','CPF','Data de nascimento','Copiar dados para cadastro']) {
      expect(product).toContain(copy);
    }
    expect(product).toContain('portalPassword');
    expect(product).toContain('Abrir cadastro oficial');
    expect(product).toContain('Grande Vitória');
    expect(product).toContain('Gerusa');
    expect(product).toContain('Empresária Serra');
    expect(product).toContain('Visão em árvore');
  });

  it('adds first-use onboarding without motivational template filler', () => {
    expect(product).toContain('Primeiros 3 minutos');
    expect(product).toContain('1. Encontre a consultora');
    expect(product).toContain('2. Copie código e senha');
    expect(product).toContain('3. Registre o pedido');
    for (const copy of ['A gente junto, voa mais alto','Você está voando','Seu negócio, do seu jeito','Rumo ao próximo nível','Bom dia! 🌸']) expect(bundle).not.toContain(copy);
  });

  it('keeps restrained pink branding and dense responsive navigation', () => {
    expect(css).toContain('--pink:#e91e63');
    expect(productCss).toContain('.vt6-team-table');
    expect(productCss).toContain('.vt6-secret');
    expect(productCss).toContain('.vt6-network');
    expect(productCss).toContain('@media');
  });

  it('defines the new social navigation without consuming a tab for closing', () => {
    expect(product).toContain("['today','Hoje']");
    expect(product).toContain("['network','Rede']");
    expect(product).toContain("['orders','Pedidos']");
    expect(product).toContain("['profile','Perfil']");
    expect(product).not.toContain("['closing','Fechamento']");
    expect(product).toContain("go('closing')");
  });

  it('supports Orkut-like network surfaces with controlled operational data', () => {
    for (const copy of ['Mural','Ranking','Árvore','Meu perfil','Conquistas']) expect(product).toContain(copy);
    expect(product).toContain("role:'consultant'");
    expect(product).toContain("role==='leader'");
    expect(product).toContain('Ritheli Radis de Souza de Oliveira');
    expect(product).toContain('Distrito Grande Vitória');
    expect(product).toContain('Gerusa');
    expect(product).not.toContain('Vitoriaware</span><strong>Empresária Serra');
  });

  it('treats recruitment and sales as different goals', () => {
    expect(product).toContain('Meta de recrutamento');
    expect(product).toContain("target:45");
    expect(product).toContain("type:'recruitment'");
    expect(product).toContain("type:'sales'");
    expect(product).toContain('Novas consultoras');
  });

  it('uses configurable external access and iPhone-safe bottom navigation', () => {
    expect(product).toContain('Abrir Tupperware');
    expect(product).toContain('portalUrl');
    expect(productCss).toContain('safe-area-inset-bottom');
    expect(productCss).toContain('min-height:44px');
  });

  it('avoids em-dash microcopy in the published static product', () => {
    expect(bundle).not.toContain('—');
  });

  it('loads the product layer after the recovery layer and scripts parse', () => {
    expect(html).toContain('product-v6.css?v=6');
    expect(html).toContain('product-v6.js?v=6');
    expect(html.indexOf('hotfix.js')).toBeLessThan(html.indexOf('product-v6.js'));
    expect(() => new Function(js)).not.toThrow();
    expect(() => new Function(hotfix)).not.toThrow();
    expect(() => new Function(product)).not.toThrow();
  });
});
