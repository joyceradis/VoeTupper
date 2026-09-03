import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const network = readFileSync(new URL('../network-es.js', import.meta.url),'utf8');
const product = readFileSync(new URL('../product-v6.js', import.meta.url),'utf8');

describe('ES network hierarchy', () => {
  it('represents Gerusa as Distribuição ES and maps six districts', () => {
    expect(network).toContain("role:'Distribuição ES'");
    expect(network).not.toContain("role:'Distrito'");
    expect(network).toContain("name:'Gerusa'");

    for (const person of ['Giseli Aguilar','Adriana Junta','Ritheli Radis','Tatiana Madeira','Adriana Maia','Vanessa Luciana']) {
      expect(network).toContain(person);
    }

    for (const district of ['Norte','Noroeste','Serra','Vitória','Vila Velha e Sul','Cariacica']) {
      expect(network).toContain(`district:'${district}'`);
    }
  });

  it('uses Serra as the current district and keeps the state distribution explicit', () => {
    expect(product).toContain("district:'Serra'");
    expect(product).toContain("distribution:'Espírito Santo'");
    expect(product).toContain("distributionManager:'Gerusa'");
    expect(network).toContain('6 Distritos');
    expect(network).not.toContain('Gerusa · Distrito');
  });
});
