import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const network = readFileSync(new URL('../network-es.js', import.meta.url),'utf8');

describe('ES network hierarchy', () => {
  it('represents Gerusa as Distribuição ES and maps six districts', () => {
    expect(network).toContain("distribution:{name:'Gerusa',role:'Distribuição ES'}");
    expect(network).not.toContain("role:'Distrito'");

    for (const person of ['Giseli Aguilar','Adriana Junta','Ritheli Radis','Tatiana Madeira','Adriana Maia','Vanessa Luciana']) {
      expect(network).toContain(person);
    }

    const districts = ['Norte','Noroeste','Plenitude','Vitória','Vila Velha e Sul','Cariacica'];
    for (const district of districts) expect(network).toContain(`district:'${district}'`);

    const businessDistricts = [...network.matchAll(/\{id:'[^']+',name:'[^']+',district:'([^']+)',region:/g)].map((match) => match[1]);
    expect(businessDistricts).toEqual(districts);
    expect(network).toContain("{id:'serra',name:'Ritheli Radis',district:'Plenitude',region:'Serra',current:true}");
  });

  it('normalizes the pilot workspace to Distrito Plenitude in Serra under the state distribution', () => {
    expect(network).toContain("district:'Plenitude'");
    expect(network).toContain("region:'Serra'");
    expect(network).toContain("distribution:'Espírito Santo'");
    expect(network).toContain('distributionManager:VT8_ES_NETWORK.distribution.name');
    expect(network).toContain('<span>Distritos</span>');
    expect(network).not.toContain('Gerusa · Distrito');
  });
});
