export type PasswordValidation={ok:true;message:null}|{ok:false;message:string};

export function validateNewPassword(password:string,confirmation:string):PasswordValidation{
  if(password.length<8)return {ok:false,message:'Use pelo menos 8 caracteres.'};
  if(password!==confirmation)return {ok:false,message:'As senhas não conferem.'};
  return {ok:true,message:null};
}
