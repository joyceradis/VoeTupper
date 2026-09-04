import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
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
   expect(sw).toContain('operational-import.js?v=1');
   expect(sw).toContain('operational-import-csv.js?v=1');
   expect(sw).toContain('operational-import-review.js?v=1');
   expect(sw).toContain('operational-import.css?v=1');
   expect(sw).not.toContain('/api/');
 });
 it('ships installable PNG icons at the declared dimensions',()=>{
   expect(manifest.icons).toEqual([
     {src:'logo-192.png?v=10',sizes:'192x192',type:'image/png',purpose:'any'},
     {src:'logo-512.png?v=10',sizes:'512x512',type:'image/png',purpose:'any'},
   ]);
   for(const [filename,size] of [['logo-192.png',192],['logo-512.png',512]] as const){
     const path=join(process.cwd(),filename);
     expect(existsSync(path),`${filename} should exist`).toBe(true);
     const png=readFileSync(path);
     expect([...png.subarray(0,8)]).toEqual([137,80,78,71,13,10,26,10]);
     expect(png.readUInt32BE(16)).toBe(size);
     expect(png.readUInt32BE(20)).toBe(size);
   }
 });
});
