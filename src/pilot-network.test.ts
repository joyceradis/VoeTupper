import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const product = readFileSync(new URL('../product-v6.js', import.meta.url), 'utf8');
const network = readFileSync(new URL('../network-es.js', import.meta.url), 'utf8');
const pilot = readFileSync(new URL('../pilot-display.js', import.meta.url), 'utf8');
const logo = readFileSync(new URL('../logo.svg', import.meta.url), 'utf8');

describe('Grupo Fenomenal pilot network', () => {
  it('models the pilot identity and hierarchy at the source', () => {
    expect(network).toContain("name:'Ritheli Radis'");
    expect(network).toContain("district:'Plenitude'");
    expect(network).toContain("group:'Fenomenal'");
    expect(network).toContain("leader:'Ritheli Radis'");
    expect(network).toContain('Grupo Fenomenal');
    expect(network).not.toContain("name:`Empresária ${vt8CurrentDistrict.district}`");
  });

  it('assigns unlinked pilot consultants to Ritheli and Grupo Fenomenal without exposing credentials', () => {
    expect(product).toContain("leader:c.leader||'Ritheli Radis'");
    expect(product).toContain("group:c.group||'Fenomenal'");
    expect(product).not.toContain('09365268745');
    expect(network).not.toContain('09365268745');
    expect(pilot).not.toContain('09365268745');
  });

  it('uses the approved Voe Tupper artwork in the site logo asset', () => {
    expect(logo).toContain('data:image/jpeg;base64,');
    expect(logo).toContain('aria-label="Voe Tupper"');
  });
});
