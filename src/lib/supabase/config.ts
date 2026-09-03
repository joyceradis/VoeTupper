export type SupabasePublicConfig={url:string;anonKey:string};

type PublicEnv={
  NEXT_PUBLIC_SUPABASE_URL?:string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?:string;
  [key:string]:string|undefined;
};

export function readSupabasePublicConfig(env:PublicEnv):SupabasePublicConfig|null{
  const url=env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey=env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if(!url||!anonKey)return null;
  return {url,anonKey};
}

export function currentSupabasePublicConfig():SupabasePublicConfig|null{
  return readSupabasePublicConfig({
    NEXT_PUBLIC_SUPABASE_URL:process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
}
