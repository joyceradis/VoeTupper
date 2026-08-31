export type UserIdentity={id:string;handle:string;email:string;displayName:string};
export type AuthMethod='magic_link'|'password';
export const normalizeHandle=(value:string)=>value.trim().toLowerCase().replace(/[^a-z0-9-]/g,'');
export function isUnsafePassword(value:string){const compact=value.replace(/\D/g,'');return /^[0-9\s()+.-]+$/.test(value)||compact.length===11&&compact===value.replace(/\D/g,'');}
export function validatePassword(value:string){return value.length>=8&&/[A-Za-z]/.test(value)&&/[^A-Za-z\s]/.test(value)&&!isUnsafePassword(value)}
