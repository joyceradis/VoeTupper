import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app.css', import.meta.url), 'utf8');
const js = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const hotfix = readFileSync(new URL('../hotfix.js', import.meta.url), 'utf8');
const hotfixCss = readFileSync(new URL('../hotfix.css', import.meta.url), 'utf8');
const product = readFileSync(new URL('../product-v6.js', import.meta.url), 'utf8');
const productCss = readFileSync(new URL('../product-v6.css', import.meta.url), 'utf8');
const network = readFileSync(new URL('../network-es.js', import.meta.url), 'utf8');
const networkCss = readFileSync(new URL('../network-es.css', import.meta.url), 'utf8');
const pilotDisplay = readFileSync(new URL('../pilot-display.js', import.meta.url), 'utf8');
const bundle = `${html}\n${css}\n${js}\n${hotfix}\n${hotfixCss}\n${product}\n${productCss}\n${network}\n${networkCss}\n${pilotDisplay}`;
const activeProduct = `${html}\n${product}\n${network}\n${pilotDisplay}`;

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

  it('renames only the visible pilot identity while preserving browser storage and password compatibility', () => {
    expect(js).toContain("const STATE_KEY='voetupper-vitoriaware-state-v1'");
    expect(js).toContain("const AUTH_KEY='voetupper-vitoriaware-auth-v1'");
    expect(js).toContain("const SESSION_KEY='voetupper-vitoriaware-session-v1'");
    expect(js).toContain("const MASTER_HANDLE='empresaria01-teste-master'");
    expect(js).toContain('hashSecret(password,current.salt)');
    expect(html).toContain('pilot-display.js?v=1');
    expect(pilotDisplay).toContain("VT9_VISIBLE_HANDLE='ritheli.radis'");
    expect(pilotDisplay).toContain("VT9_LEGACY_HANDLE='empresaria01-teste-master'");
    expect(pilotDisplay).toContain("VT9_DISPLAY_NAME='Ritheli Radis'");
    expect(pilotDisplay).toContain("VT9_DISTRICT_LABEL='Distrito Plenitude'");
    expect(pilotDisplay).not.toContain('localStorage');
    expect(pilotDisplay).not.toContain('sessionStorage');
    expect(js).not.toContain('localStorage.removeItem(STATE_KEY)');
    expect(js).not.toContain('localStorage.removeItem(AUTH_KEY)');
  });

  it('makes the team directory operational for the local workflow', () => {
    for (const copy of ['Copiar código','Copiar senha','H / RECADASTRAR','Líder responsável','Grupo','CPF','Data de nascimento','Copiar dados para cadastro']) expect(product).toContain(copy);
    expect(product).toContain('portalPassword');
    expect(product).toContain('Abrir cadastro oficial');
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

  it('keeps restrained pink branding and responsive social navigation', () => {
    expect(css).toContain('--pink:#e91e63');
    expect(productCss).toContain('.vt6-team-table');
    expect(productCss).toContain('.vt6-secret');
    expect(productCss).toContain('.vt6-network');
    expect(networkCss).toContain('.vt7-mobile-nav');
    expect(networkCss).toContain('@media');
  });

  it('defines the new social navigation without consuming a tab for closing', () => {
    expect(product).toContain("['today','Hoje']");
    expect(product).toContain("['network','Rede']");
    expect(product).toContain("['orders','Pedidos']");
    expect(product).toContain("['profile','Perfil']");
    expect(product).not.toContain("['closing','Fechamento']");
    expect(product).toContain("go('closing')");
  });

  it('supports profile, wall, ranking, tree and achievements', () => {
    for (const copy of ['Mural','Ranking','Árvore','MEU PERFIL','Conquistas']) expect(product).toContain(copy);
    expect(product).toContain("role:'consultant'");
    expect(product).toContain("role==='leader'");
    expect(product).toContain('Ritheli Radis de Souza de Oliveira');
    expect(network).toContain('Espírito Santo');
    expect(network).toContain('Gerusa');
  });

  it('maps the five ES regional business areas without inventing lower teams', () => {
    for (const person of ['Giseli Aguilar','Adriana Junta','Ritheli Radis','Tatiana Madeira','Adriana Maia']) expect(network).toContain(person);
    for (const area of ['Norte do estado','Noroeste','Serra','Vitória','Vila Velha e sul do estado']) expect(network).toContain(area);
    expect(network).toContain('VT8_ES_NETWORK');
    expect(network).toContain('current:true');
    expect(network).toContain('dados confirmados');
  });

  it('treats recruitment and sales as different goals', () => {
    expect(product).toContain('Meta de recrutamento');
    expect(product).toContain('target:45');
    expect(product).toContain("type:'recruitment'");
    expect(product).toContain("type:'sales'");
    expect(product).toContain('Novas consultoras');
  });

  it('uses configurable external access and iPhone-safe bottom navigation', () => {
    expect(product).toContain('Abrir Tupperware');
    expect(product).toContain('portalUrl');
    expect(networkCss).toContain('safe-area-inset-bottom');
    expect(networkCss).toContain('min-height:44px');
  });

  it('avoids em-dash microcopy in the active progressive product', () => {
    expect(activeProduct).not.toContain('—');
  });

  it('loads v7 progressive layers after recovery and scripts parse', () => {
    expect(html).toContain('product-v6.css?v=7');
    expect(html).toContain('network-es.css?v=7');
    expect(html).toContain('product-v6.js?v=7');
    expect(html).toContain('network-es.js?v=7');
    expect(html.indexOf('hotfix.js')).toBeLessThan(html.indexOf('product-v6.js'));
    expect(html.indexOf('product-v6.js')).toBeLessThan(html.indexOf('network-es.js'));
    expect(html.indexOf('network-es.js')).toBeLessThan(html.indexOf('pilot-display.js'));
    expect(() => new Function(js)).not.toThrow();
    expect(() => new Function(hotfix)).not.toThrow();
    expect(() => new Function(product)).not.toThrow();
    expect(() => new Function(network)).not.toThrow();
    expect(() => new Function(pilotDisplay)).not.toThrow();
  });
});
