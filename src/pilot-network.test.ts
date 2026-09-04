import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const pilotNetwork = readFileSync(new URL('../pilot-network.js', import.meta.url), 'utf8');
const pilotDisplay = readFileSync(new URL('../pilot-display.js', import.meta.url), 'utf8');
const logo512 = new URL('../logo-512.png', import.meta.url);

describe('Grupo Fenomenal pilot network', () => {
  it('models the approved pilot hierarchy without creating a fake consultant', () => {
    expect(pilotNetwork).toContain("name:'Ritheli Radis'");
    expect(pilotNetwork).toContain("district:'Plenitude'");
    expect(pilotNetwork).toContain("group:'Fenomenal'");
    expect(pilotNetwork).toContain("leader:'Ritheli Radis'");
    expect(pilotNetwork).toContain('Grupo Fenomenal');
    expect(pilotNetwork).toContain("id:'pilot-ritheli-leader'");
    expect(pilotNetwork).toContain('return [vt10PilotLeader()]');
  });

  it('assigns only missing network metadata and preserves existing local records', () => {
    expect(pilotNetwork).toContain('leader:c.leader||VT10_PILOT.leader');
    expect(pilotNetwork).toContain('group:c.group||VT10_PILOT.group');
    expect(pilotNetwork).toContain('...c');
    expect(pilotNetwork).not.toContain('localStorage.clear');
    expect(pilotNetwork).not.toContain('removeItem');
  });

  it('loads the pilot layer before the visual compatibility layer', () => {
    expect(html).toContain('pilot-network.js?v=1');
    expect(html.indexOf('network-es.js')).toBeLessThan(html.indexOf('pilot-network.js'));
    expect(html.indexOf('pilot-network.js')).toBeLessThan(html.indexOf('pilot-display.js'));
    expect(() => new Function(pilotNetwork)).not.toThrow();
  });

  it('does not commit the sample credential material', () => {
    for (const secret of ['09365268745','familiaamor234','175773Jr%']) {
      expect(pilotNetwork).not.toContain(secret);
      expect(pilotDisplay).not.toContain(secret);
      expect(html).not.toContain(secret);
    }
  });

  it('uses the approved Voe Tupper artwork in the site logo asset', () => {
    expect(existsSync(logo512)).toBe(true);
    const logo = readFileSync(logo512);
    expect([...logo.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(logo.readUInt32BE(16)).toBe(512);
    expect(logo.readUInt32BE(20)).toBe(512);
    expect(html).toContain('logo-512.png?v=10');
  });
});
