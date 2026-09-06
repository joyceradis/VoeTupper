import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { V3StatusView } from './VoeTupperV3';

describe('VoeTupper V3 composition', () => {
  it('explains when real access is not configured and offers only the explicit demo', () => {
    const html = renderToStaticMarkup(<V3StatusView kind="configuration-required" />);

    expect(html).toContain('Acesso real em preparação');
    expect(html).toContain('Abrir demonstração');
    expect(html).not.toContain('Ritheli exemplo');
    expect(html).not.toContain('—');
  });
});
