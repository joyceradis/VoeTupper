import { describe, expect, it } from 'vitest';
import { resolveAuthGateState } from './session';

describe('authentication gate',()=>{
  it('requires login when there is no authenticated session',()=>{
    expect(resolveAuthGateState({authenticated:false,mustChangePassword:false,hasMembership:false})).toBe('SIGNED_OUT');
  });

  it('forces password change before entering the app',()=>{
    expect(resolveAuthGateState({authenticated:true,mustChangePassword:true,hasMembership:true})).toBe('PASSWORD_CHANGE_REQUIRED');
  });

  it('blocks an authenticated account without a current network membership',()=>{
    expect(resolveAuthGateState({authenticated:true,mustChangePassword:false,hasMembership:false})).toBe('MEMBERSHIP_REQUIRED');
  });

  it('opens the app only when authentication and membership are ready',()=>{
    expect(resolveAuthGateState({authenticated:true,mustChangePassword:false,hasMembership:true})).toBe('READY');
  });
});
