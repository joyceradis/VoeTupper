import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('VoeTupper V3 release boundary', () => {
  it('uses V3 as the branch root', () => {
    const page = readFileSync(resolve(process.cwd(), 'src/app/page.tsx'), 'utf8');
    expect(page).toContain('VoeTupperV3');
    expect(page).not.toContain('VoeTupperApp');
  });

  it('keeps prohibited copy out of the V3 interface', () => {
    const files = [
      'VoeTupperV3.tsx', 'components/AccessView.tsx', 'components/HomeView.tsx',
      'components/NetworkView.tsx', 'components/PeopleList.tsx', 'components/LivingNetwork.tsx',
      'components/VitrineRace.tsx', 'components/ProfileView.tsx', 'components/TeamImport.tsx',
    ];
    const copy = files.map(file => readFileSync(resolve(process.cwd(), 'src/features/v3', file), 'utf8')).join('\n');
    expect(copy).not.toContain('—');
    expect(copy).not.toContain('empresaria01-teste');
  });

  it('does not place example people inside the real repository', () => {
    const repository = readFileSync(resolve(process.cwd(), 'src/features/v3/data/supabase-repository.ts'), 'utf8');
    expect(repository).not.toMatch(/Ritheli exemplo|Gerusa exemplo|Marina exemplo/);
  });
});
