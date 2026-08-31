import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const manifest=JSON.parse(readFileSync(join(process.cwd(),'manifest.webmanifest'),'utf8'));
const html=readFileSync(join(process.cwd(),'index.html'),'utf8');

describe('PWA static contract',()=>{
 it('is scoped to the GitHub Pages application path',()=>{
   expect(manifest.start_url).toBe('./');
   expect(manifest.scope).toBe('./');
   expect(manifest.display).toBe('standalone');
   expect(manifest.theme_color).toBe('#e91e63');
 });
 it('registers a service worker without caching private API data',()=>{
   expect(html).toContain('app.js');
   const sw=readFileSync(join(process.cwd(),'sw.js'),'utf8');
   expect(sw).toContain('CACHE_NAME');
   expect(sw).toContain("request.method!=='GET'");
   expect(sw).not.toContain('/api/');
 });
});
