import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('GitHub repository home', () => {
  it('presents V3 as the current release with the live site and technical evidence', () => {
    const readme = readFileSync(resolve(process.cwd(), 'README.md'), 'utf8');

    expect(readme).toContain('# VoeTupper');
    expect(readme).toContain('Sales-network CRM built with Next.js, React, TypeScript and Supabase');
    expect(readme).toContain('https://voetupper-serra-v3.joyceradis.chatgpt.site/?demo=1');
    expect(readme).toContain('## O que este repositório demonstra');
    expect(readme).toContain('Next.js 15');
    expect(readme).not.toContain('# VoeTupper V2');
  });

  it('runs verification for the V3 branch', () => {
    const workflow = readFileSync(resolve(process.cwd(), '.github/workflows/ci.yml'), 'utf8');
    expect(workflow).toContain('feat/voetupper-v3');
  });
});
