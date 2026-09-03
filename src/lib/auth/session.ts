export type AuthGateState='SIGNED_OUT'|'PASSWORD_CHANGE_REQUIRED'|'MEMBERSHIP_REQUIRED'|'READY';

export type AuthGateFacts={
  authenticated:boolean;
  mustChangePassword:boolean;
  hasMembership:boolean;
};

export function resolveAuthGateState(facts:AuthGateFacts):AuthGateState{
  if(!facts.authenticated)return 'SIGNED_OUT';
  if(facts.mustChangePassword)return 'PASSWORD_CHANGE_REQUIRED';
  if(!facts.hasMembership)return 'MEMBERSHIP_REQUIRED';
  return 'READY';
}
