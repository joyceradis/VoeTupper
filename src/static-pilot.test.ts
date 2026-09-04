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
    expect(html).toContain('O que precisa ser resolvido'); expect(html).toContain('Próxima ação'); expect(html).toContain('Sem pedido'); expect(html).toContain('Portal'); expect(html).toContain('Print');
    expect(js).toContain("week:'36/2026',vitrine:'09/2026'"); expect(hotfix).toContain("w35.vitrine='09/2026'"); expect(js).toContain('function closingLabel');
  });
  it('preserves pilot auth and browser storage compatibility', () => {
    expect(js).toContain("const STATE_KEY='voetupper-vitoriaware-state-v1'"); expect(js).toContain("const AUTH_KEY='voetupper-vitoriaware-auth-v1'"); expect(js).toContain("const SESSION_KEY='voetupper-vitoriaware-session-v1'"); expect(js).toContain("const MASTER_HANDLE='empresaria01-teste-master'");
    expect(pilotDisplay).toContain("VT9_VISIBLE_HANDLE='ritheli.radis'"); expect(pilotDisplay).not.toContain('localStorage');
  });
  it('keeps consultant portal credentials protected but operational', () => {
    expect(product).toContain('portalPassword'); expect(product).toContain('Mostrar'); expect(product).toContain('Copiar senha'); expect(product).toContain('Copiar código');
  });
  it('models Grupo Fenomenal with Ritheli as leader', () => {
    for (const copy of ['Ritheli Radis','Grupo Fenomenal','Fenomenal']) expect(bundle).toContain(copy);
    expect(network).toContain('vt8RitheliBranch');
  });
  it('renders consultant cards with canonical identity, status, code, hidden portal password and closing value', () => {
    expect(network).toContain("'114440':{name:'Adriana Vieira',status:'INATIVA'}");
    for (const copy of ['Código','Senha do portal','Fechamento','ATIVA','INATIVA','DADOS A CONFERIR']) expect(network).toContain(copy);
    expect(network).toContain('vt10ConsultantCard');
    expect(network).toContain('vt10StatusClass');
    expect(network).not.toContain("<small>${esc(p.group||'Revendedora / Consultora')}</small>");
  });
  it('separates linked people from active and inactive counts', () => {
    expect(network).toContain('vinculadas'); expect(network).toContain('ativas'); expect(network).toContain('inativa');
    expect(network).toContain("status!=='INATIVA'");
  });
  it('uses the approved logo consistently and cache-busts the sidebar asset', () => {
    expect(html).toContain('logo.svg?v=9');
    expect(product).toContain('logo.svg?v=9');
    expect(networkCss).toContain('.brand-row>img');
  });
  it('keeps restrained pink branding and responsive social navigation', () => {
    expect(css).toContain('--pink:#e91e63'); expect(networkCss).toContain('.vt7-mobile-nav'); expect(networkCss).toContain('@media');
  });
  it('avoids em-dash microcopy in the active progressive product', () => { expect(activeProduct).not.toContain('—'); });
  it('scripts parse', () => {
    expect(() => new Function(js)).not.toThrow(); expect(() => new Function(hotfix)).not.toThrow(); expect(() => new Function(product)).not.toThrow(); expect(() => new Function(network)).not.toThrow(); expect(() => new Function(pilotDisplay)).not.toThrow();
  });
});
