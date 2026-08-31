import { describe, expect, it } from 'vitest';
import { isUnsafePassword, normalizeHandle } from './model';

describe('authentication model',()=>{
 it('normalizes operational handles',()=>expect(normalizeHandle(' Empresaria01-Teste-Master ')).toBe('empresaria01-teste-master'));
 it('rejects CPF/phone-like numeric secrets',()=>{
   expect(isUnsafePassword('27999999999')).toBe(true);
   expect(isUnsafePassword('12345678901')).toBe(true);
   expect(isUnsafePassword('Senha@forte2026')).toBe(false);
 });
});
