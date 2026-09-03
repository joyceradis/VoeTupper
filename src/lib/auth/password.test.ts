import { describe, expect, it } from 'vitest';
import { validateNewPassword } from './password';

describe('first access password validation',()=>{
  it('rejects passwords shorter than eight characters',()=>{
    expect(validateNewPassword('Abc123!','Abc123!')).toEqual({ok:false,message:'Use pelo menos 8 caracteres.'});
  });

  it('rejects different confirmation values',()=>{
    expect(validateNewPassword('NovaSenha123!','OutraSenha123!')).toEqual({ok:false,message:'As senhas não conferem.'});
  });

  it('accepts a matching password with eight or more characters',()=>{
    expect(validateNewPassword('NovaSenha123!','NovaSenha123!')).toEqual({ok:true,message:null});
  });
});
